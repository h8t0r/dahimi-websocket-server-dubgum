
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../integrations/supabase/client';
import { Card } from '../../types/game';
import { getCardDisplayName, getCardColor } from '../../utils/gameLogic';

const { width: screenWidth } = Dimensions.get('window');

interface GameRoom {
  id: string;
  player_count: number;
  current_players: number;
  game_state: string;
  host_player_id: string;
}

interface GamePlayer {
  id: string;
  room_id: string;
  player_name: string;
  player_index: number;
  hand: Card[];
  is_connected: boolean;
}

interface GameStateData {
  current_player_index: number;
  current_stack: Card[];
  last_played_rank: number;
  current_set_size: number;
  consecutive_passes: number;
  game_phase: string;
  winner?: string;
}

export default function GameRoomScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    
    loadRoomData();
    
    // Subscribe to real-time updates
    const roomSubscription = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          console.log('Room updated:', payload);
          loadRoomData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('Players updated:', payload);
          loadRoomData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_states', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('Game state updated:', payload);
          loadRoomData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
    };
  }, [roomId]);

  const loadRoomData = async () => {
    if (!roomId) return;
    
    try {
      // Load room data
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        Alert.alert('Error', 'Room not found');
        router.back();
        return;
      }

      setRoom(roomData);

      // Load players
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('room_id', roomId)
        .order('player_index');

      if (playersError) {
        console.error('Error loading players:', playersError);
      } else {
        setPlayers(playersData || []);
        // Set current player (assuming first player for now)
        if (playersData && playersData.length > 0) {
          setCurrentPlayer(playersData[0]);
        }
      }

      // Load game state
      const { data: gameStateData, error: gameStateError } = await supabase
        .from('game_states')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (!gameStateError && gameStateData) {
        setGameState(gameStateData);
      }

    } catch (error) {
      console.error('Error loading room data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleStartGame = async () => {
    if (!room || !roomId) return;

    try {
      // Call Edge Function to start game
      const { data, error } = await supabase.functions.invoke('game-engine', {
        body: { action: 'start-game', roomId }
      });

      if (error) {
        Alert.alert('Error', 'Failed to start game: ' + error.message);
        return;
      }

      if (data.success) {
        // Update game state in database
        const { error: stateError } = await supabase
          .from('game_states')
          .upsert({
            room_id: roomId,
            ...data.gameState
          });

        // Update player hands
        for (let i = 0; i < data.hands.length; i++) {
          await supabase
            .from('game_players')
            .update({ hand: data.hands[i] })
            .eq('room_id', roomId)
            .eq('player_index', i);
        }

        // Update room state
        await supabase
          .from('game_rooms')
          .update({ game_state: 'playing' })
          .eq('id', roomId);

        if (stateError) {
          console.error('Error updating game state:', stateError);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game');
    }
  };

  const toggleCardSelection = (card: Card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        // Only allow cards of the same rank to be selected
        if (prev.length > 0 && prev[0].rank !== card.rank) {
          return [card]; // Start new selection
        }
        return [...prev, card];
      }
    });
  };

  const handlePlayCards = async () => {
    if (!currentPlayer || !gameState || selectedCards.length === 0) return;

    try {
      // Validate move with Edge Function
      const { data, error } = await supabase.functions.invoke('game-engine', {
        body: {
          action: 'validate-move',
          gameState,
          move: { type: 'play-cards', cards: selectedCards },
          playerHand: currentPlayer.hand
        }
      });

      if (error || !data.success || !data.validation.valid) {
        Alert.alert('Invalid Move', data.validation?.error || 'Cannot play these cards');
        return;
      }

      // Apply move
      const { data: moveData, error: moveError } = await supabase.functions.invoke('game-engine', {
        body: {
          action: 'apply-move',
          gameState,
          move: { type: 'play-cards', cards: selectedCards }
        }
      });

      if (moveError || !moveData.success) {
        Alert.alert('Error', 'Failed to apply move');
        return;
      }

      // Update database
      await supabase
        .from('game_states')
        .update(moveData.gameState)
        .eq('room_id', roomId);

      // Record move
      await supabase
        .from('game_moves')
        .insert({
          room_id: roomId,
          player_id: currentPlayer.id,
          move_type: 'play-cards',
          cards: selectedCards,
          move_order: (gameState.consecutive_passes || 0) + 1
        });

      // Update player hand
      const newHand = currentPlayer.hand.filter(card => 
        !selectedCards.some(selected => selected.id === card.id)
      );
      
      await supabase
        .from('game_players')
        .update({ hand: newHand })
        .eq('id', currentPlayer.id);

      setSelectedCards([]);

    } catch (error) {
      console.error('Error playing cards:', error);
      Alert.alert('Error', 'Failed to play cards');
    }
  };

  const handlePass = async () => {
    if (!currentPlayer || !gameState) return;

    try {
      // Apply pass
      const { data, error } = await supabase.functions.invoke('game-engine', {
        body: {
          action: 'apply-move',
          gameState,
          move: { type: 'pass' }
        }
      });

      if (error || !data.success) {
        Alert.alert('Error', 'Failed to pass');
        return;
      }

      // Update database
      await supabase
        .from('game_states')
        .update(data.gameState)
        .eq('room_id', roomId);

      // Record move
      await supabase
        .from('game_moves')
        .insert({
          room_id: roomId,
          player_id: currentPlayer.id,
          move_type: 'pass',
          move_order: (gameState.consecutive_passes || 0) + 1
        });

    } catch (error) {
      console.error('Error passing:', error);
      Alert.alert('Error', 'Failed to pass');
    }
  };

  const renderCard = (card: Card, isSelected: boolean = false) => {
    const cardColor = getCardColor(card);
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          { borderColor: cardColor }
        ]}
        onPress={() => toggleCardSelection(card)}
      >
        <Text style={[styles.cardText, { color: cardColor }]}>
          {getCardDisplayName(card)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={commonStyles.text}>Loading room...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={commonStyles.text}>Room not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isHost = currentPlayer?.player_index === 0;
  const canStartGame = isHost && room.current_players === room.player_count && room.game_state === 'waiting';
  const isGameActive = room.game_state === 'playing' && gameState;
  const isCurrentPlayerTurn = gameState && currentPlayer && gameState.current_player_index === currentPlayer.player_index;

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Game Room</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomId}>Room ID: {roomId}</Text>
          <Text style={styles.roomStatus}>
            Status: {room.game_state} • Players: {room.current_players}/{room.player_count}
          </Text>
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.sectionTitle}>Players</Text>
          {players.map((player, index) => (
            <View key={player.id} style={[
              styles.playerCard,
              gameState && gameState.current_player_index === player.player_index && styles.currentPlayerCard
            ]}>
              <Text style={styles.playerName}>
                {player.player_name} {player.player_index === 0 && '(Host)'}
              </Text>
              <Text style={styles.playerStatus}>
                {player.is_connected ? 'Connected' : 'Disconnected'}
                {player.hand && ` • ${player.hand.length} cards`}
              </Text>
              {gameState && gameState.current_player_index === player.player_index && (
                <Text style={styles.turnIndicator}>Current Turn</Text>
              )}
            </View>
          ))}
        </View>

        {canStartGame && (
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        )}

        {isGameActive && gameState && (
          <>
            {/* Current Stack */}
            <View style={styles.stackSection}>
              <Text style={styles.sectionTitle}>Current Stack</Text>
              {gameState.current_stack && gameState.current_stack.length > 0 ? (
                <View style={styles.stackCards}>
                  {gameState.current_stack.map(card => renderCard(card))}
                </View>
              ) : (
                <Text style={styles.emptyStack}>No cards played yet</Text>
              )}
              {gameState.last_played_rank > 0 && (
                <Text style={styles.stackInfo}>
                  Last rank: {gameState.last_played_rank} • Set size: {gameState.current_set_size}
                </Text>
              )}
            </View>

            {/* Player Hand */}
            {currentPlayer && currentPlayer.hand && (
              <View style={styles.handSection}>
                <Text style={styles.sectionTitle}>Your Hand</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.handContainer}>
                    {currentPlayer.hand.map(card => 
                      renderCard(card, selectedCards.some(c => c.id === card.id))
                    )}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            {isCurrentPlayerTurn && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.playButton, selectedCards.length === 0 && styles.disabledButton]}
                  onPress={handlePlayCards}
                  disabled={selectedCards.length === 0}
                >
                  <Text style={[styles.playButtonText, selectedCards.length === 0 && styles.disabledButtonText]}>
                    Play {selectedCards.length} Card{selectedCards.length !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.passButton} onPress={handlePass}>
                  <Text style={styles.passButtonText}>Pass</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isCurrentPlayerTurn && (
              <View style={styles.waitingSection}>
                <Text style={styles.waitingText}>
                  Waiting for {players.find(p => p.player_index === gameState.current_player_index)?.player_name} to play...
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roomInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roomId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  roomStatus: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  playerCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentPlayerCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  playerStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  turnIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  stackSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stackCards: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyStack: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  stackInfo: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  handSection: {
    marginBottom: 16,
  },
  handContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingRight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 50,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    transform: [{ translateY: -8 }],
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    paddingVertical: 20,
    gap: 12,
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: colors.grey,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  passButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  waitingSection: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

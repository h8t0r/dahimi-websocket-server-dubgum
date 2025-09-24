
import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameLogic } from '../hooks/useGameLogic';
import { getCardDisplayName, getCardColor } from '../utils/gameLogic';
import { Card } from '../types/game';

export default function PracticeScreen() {
  const router = useRouter();
  const {
    gameState,
    selectedCards,
    startPracticeGame,
    playMove,
    passMove,
    toggleCardSelection,
    clearSelection,
    getCurrentPlayer,
    getHumanPlayer
  } = useGameLogic();

  useEffect(() => {
    startPracticeGame();
  }, [startPracticeGame]);

  const handleBack = () => {
    console.log('Going back to splash screen');
    router.back();
  };

  const handlePlayCards = () => {
    if (selectedCards.length === 0) return;
    
    const humanPlayer = getHumanPlayer();
    if (!humanPlayer) return;

    const success = playMove(humanPlayer.id, { cards: selectedCards });
    if (success) {
      console.log('Cards played successfully');
    }
  };

  const handlePass = () => {
    const humanPlayer = getHumanPlayer();
    if (!humanPlayer) return;

    passMove(humanPlayer.id);
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

  const renderPlayerInfo = (player: any, index: number) => {
    const isCurrentPlayer = getCurrentPlayer()?.id === player.id;
    const isHuman = player.id === 'player-0';
    
    return (
      <View key={player.id} style={[styles.playerInfo, isCurrentPlayer && styles.currentPlayerInfo]}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.handCount}>
          {isHuman ? `${player.hand.length} cards` : `${player.handCount} cards`}
        </Text>
        {isCurrentPlayer && <Text style={styles.turnIndicator}>Current Turn</Text>}
      </View>
    );
  };

  if (!gameState) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Text style={commonStyles.text}>Loading game...</Text>
      </SafeAreaView>
    );
  }

  const humanPlayer = getHumanPlayer();
  const currentPlayer = getCurrentPlayer();
  const isHumanTurn = currentPlayer?.id === humanPlayer?.id;

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Practice Game</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.gameArea} showsVerticalScrollIndicator={false}>
        {/* Other Players */}
        <View style={styles.playersContainer}>
          {gameState.players.filter(p => p.id !== 'player-0').map((player, index) => 
            renderPlayerInfo(player, index)
          )}
        </View>

        {/* Trick Area */}
        <View style={styles.trickArea}>
          <Text style={styles.sectionTitle}>Current Trick</Text>
          {gameState.currentTrick.plays.length > 0 ? (
            <View style={styles.trickCards}>
              {gameState.currentTrick.plays.map((play, index) => (
                <View key={index} style={styles.trickPlay}>
                  <Text style={styles.trickPlayerName}>
                    {gameState.players.find(p => p.id === play.playerId)?.name}
                  </Text>
                  <View style={styles.trickCardContainer}>
                    {play.cards.map(card => renderCard(card))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyTrick}>No cards played yet</Text>
          )}
          
          {gameState.currentTrick.currentRank > 0 && (
            <Text style={styles.trickInfo}>
              Current rank: {gameState.currentTrick.currentRank}
              {gameState.currentTrick.capRank && ` (capped at ${gameState.currentTrick.capRank})`}
            </Text>
          )}
        </View>

        {/* Human Player Info */}
        {humanPlayer && renderPlayerInfo(humanPlayer, 0)}

        {/* Human Player Hand */}
        {humanPlayer && (
          <View style={styles.handArea}>
            <Text style={styles.sectionTitle}>Your Hand</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.handScroll}>
              <View style={styles.handContainer}>
                {humanPlayer.hand.map(card => 
                  renderCard(card, selectedCards.some(c => c.id === card.id))
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        {isHumanTurn && (
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

            {selectedCards.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
                <Text style={styles.clearButtonText}>Clear Selection</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isHumanTurn && (
          <View style={styles.waitingArea}>
            <Text style={styles.waitingText}>
              Waiting for {currentPlayer?.name} to play...
            </Text>
          </View>
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
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playersContainer: {
    paddingVertical: 16,
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentPlayerInfo: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  handCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  turnIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  trickArea: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  trickCards: {
    gap: 12,
  },
  trickPlay: {
    alignItems: 'center',
  },
  trickPlayerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  trickCardContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyTrick: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  trickInfo: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  handArea: {
    marginVertical: 16,
  },
  handScroll: {
    marginTop: 8,
  },
  handContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
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
  clearButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.warning,
  },
  waitingArea: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Alert, Dimensions } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from './integrations/supabase/client';

const { width: screenWidth } = Dimensions.get('window');

export default function MultiplayerScreen() {
  const router = useRouter();
  const [matchID, setMatchID] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleBack = () => {
    console.log('Going back to splash screen');
    router.back();
  };

  const handleJoinLobby = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!matchID.trim()) {
      Alert.alert('Error', 'Please enter a match ID');
      return;
    }
    
    setIsConnecting(true);
    console.log('Joining lobby with ID:', matchID);
    
    try {
      // Check if room exists
      const { data: room, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', matchID)
        .single();

      if (error || !room) {
        Alert.alert('Error', 'Room not found. Please check the match ID.');
        return;
      }

      if (room.current_players >= room.player_count) {
        Alert.alert('Error', 'Room is full.');
        return;
      }

      // Join the room
      const { error: joinError } = await supabase
        .from('game_players')
        .insert({
          room_id: matchID,
          player_name: playerName.trim(),
          player_index: room.current_players
        });

      if (joinError) {
        Alert.alert('Error', 'Failed to join room: ' + joinError.message);
        return;
      }

      // Update room player count
      await supabase
        .from('game_rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', matchID);

      // Navigate to game room
      router.push(`/game-room/${matchID}`);
      
    } catch (error) {
      console.error('Error joining lobby:', error);
      Alert.alert('Error', 'Failed to join lobby. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRandomLobby = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    setIsConnecting(true);
    console.log('Joining random lobby');
    
    try {
      // Find available rooms
      const { data: rooms, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('game_state', 'waiting')
        .lt('current_players', 4)
        .limit(1);

      if (error) {
        Alert.alert('Error', 'Failed to find rooms: ' + error.message);
        return;
      }

      if (!rooms || rooms.length === 0) {
        Alert.alert('No Available Rooms', 'No rooms available. Try creating a new game.');
        return;
      }

      const room = rooms[0];
      
      // Join the room
      const { error: joinError } = await supabase
        .from('game_players')
        .insert({
          room_id: room.id,
          player_name: playerName.trim(),
          player_index: room.current_players
        });

      if (joinError) {
        Alert.alert('Error', 'Failed to join room: ' + joinError.message);
        return;
      }

      // Update room player count
      await supabase
        .from('game_rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', room.id);

      // Navigate to game room
      router.push(`/game-room/${room.id}`);
      
    } catch (error) {
      console.error('Error joining random lobby:', error);
      Alert.alert('Error', 'Failed to join lobby. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateLobby = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    setIsConnecting(true);
    console.log('Creating new lobby');
    
    try {
      // Create new room
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          player_count: 4,
          current_players: 1,
          game_state: 'waiting'
        })
        .select()
        .single();

      if (roomError || !room) {
        Alert.alert('Error', 'Failed to create room: ' + (roomError?.message || 'Unknown error'));
        return;
      }

      // Join as host
      const { error: joinError } = await supabase
        .from('game_players')
        .insert({
          room_id: room.id,
          player_name: playerName.trim(),
          player_index: 0
        });

      if (joinError) {
        Alert.alert('Error', 'Failed to join room: ' + joinError.message);
        return;
      }

      // Update room with host
      await supabase
        .from('game_rooms')
        .update({ host_player_id: room.id })
        .eq('id', room.id);

      // Navigate to game room
      router.push(`/game-room/${room.id}`);
      
    } catch (error) {
      console.error('Error creating lobby:', error);
      Alert.alert('Error', 'Failed to create lobby. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Multiplayer</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Player Setup</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.textInput}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              maxLength={20}
              editable={!isConnecting}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Join Game</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Match ID (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={matchID}
              onChangeText={setMatchID}
              placeholder="Enter match ID to join specific game"
              placeholderTextColor={colors.textSecondary}
              maxLength={36}
              autoCapitalize="none"
              editable={!isConnecting}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, (!playerName.trim() || isConnecting) && styles.disabledButton]} 
            onPress={handleJoinLobby}
            disabled={!playerName.trim() || isConnecting}
          >
            <Text style={[styles.primaryButtonText, (!playerName.trim() || isConnecting) && styles.disabledButtonText]}>
              {isConnecting ? 'Connecting...' : 'Join Specific Game'}
            </Text>
            <Text style={styles.buttonSubtext}>
              Join a game with the match ID above
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, (!playerName.trim() || isConnecting) && styles.disabledButton]} 
            onPress={handleJoinRandomLobby}
            disabled={!playerName.trim() || isConnecting}
          >
            <Text style={[styles.secondaryButtonText, (!playerName.trim() || isConnecting) && styles.disabledButtonText]}>
              {isConnecting ? 'Searching...' : 'Join Random Game'}
            </Text>
            <Text style={styles.buttonSubtextSecondary}>
              Find an available game to join
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.createButton, (!playerName.trim() || isConnecting) && styles.disabledButton]} 
            onPress={handleCreateLobby}
            disabled={!playerName.trim() || isConnecting}
          >
            <Text style={[styles.createButtonText, (!playerName.trim() || isConnecting) && styles.disabledButtonText]}>
              {isConnecting ? 'Creating...' : 'Create New Game'}
            </Text>
            <Text style={styles.buttonSubtextCreate}>
              Start a new game and invite friends
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Multiplayer Works</Text>
          <Text style={styles.infoText}>
            • Games require exactly 4 players{'\n'}
            • The game creator becomes the lobby leader{'\n'}
            • Only the leader can start the game{'\n'}
            • Share your match ID with friends to play together{'\n'}
            • Real-time gameplay powered by Supabase
          </Text>
        </View>
      </View>
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
    maxWidth: screenWidth,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxWidth: screenWidth,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: screenWidth - 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    maxWidth: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  buttonSubtextSecondary: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  buttonSubtextCreate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: colors.grey,
    borderColor: colors.grey,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: screenWidth - 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

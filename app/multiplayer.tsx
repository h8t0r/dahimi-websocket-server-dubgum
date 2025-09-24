
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function MultiplayerScreen() {
  const router = useRouter();
  const [matchID, setMatchID] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleBack = () => {
    console.log('Going back to splash screen');
    router.back();
  };

  const handleJoinLobby = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!matchID.trim()) {
      Alert.alert('Error', 'Please enter a match ID');
      return;
    }
    
    console.log('Joining lobby with ID:', matchID);
    // This would connect to the WebSocket server
    Alert.alert(
      'Backend Required', 
      'To enable multiplayer functionality, you need to set up a backend server. Please enable Supabase by pressing the Supabase button and connecting to a project.'
    );
  };

  const handleJoinRandomLobby = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    console.log('Joining random lobby');
    // This would connect to the WebSocket server
    Alert.alert(
      'Backend Required', 
      'To enable multiplayer functionality, you need to set up a backend server. Please enable Supabase by pressing the Supabase button and connecting to a project.'
    );
  };

  const handleCreateLobby = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    console.log('Creating new lobby');
    // This would connect to the WebSocket server
    Alert.alert(
      'Backend Required', 
      'To enable multiplayer functionality, you need to set up a backend server. Please enable Supabase by pressing the Supabase button and connecting to a project.'
    );
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
              maxLength={10}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, !playerName.trim() && styles.disabledButton]} 
            onPress={handleJoinLobby}
            disabled={!playerName.trim()}
          >
            <Text style={[styles.primaryButtonText, !playerName.trim() && styles.disabledButtonText]}>
              Join Specific Game
            </Text>
            <Text style={styles.buttonSubtext}>
              Join a game with the match ID above
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, !playerName.trim() && styles.disabledButton]} 
            onPress={handleJoinRandomLobby}
            disabled={!playerName.trim()}
          >
            <Text style={[styles.secondaryButtonText, !playerName.trim() && styles.disabledButtonText]}>
              Join Random Game
            </Text>
            <Text style={styles.buttonSubtextSecondary}>
              Find an available game to join
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.createButton, !playerName.trim() && styles.disabledButton]} 
            onPress={handleCreateLobby}
            disabled={!playerName.trim()}
          >
            <Text style={[styles.createButtonText, !playerName.trim() && styles.disabledButtonText]}>
              Create New Game
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
            • Share your match ID with friends to play together
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
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
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

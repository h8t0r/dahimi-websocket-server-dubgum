
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const { width: screenWidth } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handlePractice = () => {
    console.log('Navigating to practice mode');
    router.push('/practice');
  };

  const handleMultiplayer = () => {
    console.log('Navigating to multiplayer mode');
    router.push('/multiplayer');
  };

  const handleTutorial = () => {
    console.log('Navigating to tutorial');
    router.push('/tutorial');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Dahimi</Text>
          <Text style={styles.subtitle}>The Ultimate Card Game</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePractice}>
            <Text style={styles.primaryButtonText}>Practice</Text>
            <Text style={styles.buttonSubtext}>Play offline against AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleMultiplayer}>
            <Text style={styles.secondaryButtonText}>Multiplayer</Text>
            <Text style={styles.buttonSubtextSecondary}>Play online with friends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tertiaryButton} onPress={handleTutorial}>
            <Text style={styles.tertiaryButtonText}>Tutorial & Rules</Text>
            <Text style={styles.buttonSubtextTertiary}>Learn how to play</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: Math.min(400, screenWidth - 40),
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
    width: '100%',
  },
  title: {
    fontSize: Math.min(48, screenWidth * 0.12),
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(18, screenWidth * 0.045),
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    maxWidth: 350,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)',
    elevation: 4,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonSubtextSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  tertiaryButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonSubtextTertiary: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});

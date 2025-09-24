
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function TutorialScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleBack = () => {
    console.log('Going back to splash screen');
    router.back();
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const tutorialSteps = [
    {
      title: "Welcome to Dahimi",
      content: "Dahimi is a strategic card game where players try to get rid of all their cards first. Let's learn how to play!"
    },
    {
      title: "Game Setup",
      content: "• 4 players each get 13 cards from a standard 52-card deck\n• The player with 3♠ starts the game\n• Cards are ranked from 3 (lowest) to 2 (highest)"
    },
    {
      title: "Basic Rules",
      content: "• Play cards of the same rank (e.g., three 7s)\n• Next player must play same number of cards with equal or higher rank\n• If you can't play, you must pass\n• After 3 consecutive passes, the trick resets"
    },
    {
      title: "Special Cards - 8s",
      content: "• Playing 8s caps the maximum rank at 8\n• No one can play cards higher than 8 until the trick ends\n• This creates strategic opportunities to control the game"
    },
    {
      title: "Special Cards - 2s",
      content: "• 2s are the highest rank cards\n• Playing 2s immediately clears the table\n• The player who played 2s starts the next trick"
    },
    {
      title: "Four of a Kind",
      content: "• If all 4 cards of the same rank are played in one trick, the table is cleared\n• The last player to contribute to the four-of-a-kind starts next"
    },
    {
      title: "Winning",
      content: "• First player to play all their cards wins!\n• The game continues until only one player has cards left\n• Strategy tip: Save your 2s and plan your final moves carefully"
    },
    {
      title: "Practice Mode",
      content: "• Play against AI opponents to learn\n• Select cards by tapping them\n• Use 'Play Cards' button to make your move\n• Use 'Pass' if you can't or don't want to play"
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tutorial</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {tutorialSteps.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepContent}>{currentStepData.content}</Text>
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={[styles.navButton, currentStep === 0 && styles.disabledButton]} 
              onPress={handlePrevious}
              disabled={currentStep === 0}
            >
              <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledButtonText]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navButton, styles.primaryNavButton]} 
              onPress={currentStep === tutorialSteps.length - 1 ? handleBack : handleNext}
            >
              <Text style={styles.primaryNavButtonText}>
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickReference}>
          <Text style={styles.quickReferenceTitle}>Quick Reference</Text>
          <View style={styles.referenceGrid}>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>Card Ranks</Text>
              <Text style={styles.referenceValue}>3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A, 2</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>Special Cards</Text>
              <Text style={styles.referenceValue}>8s cap rank, 2s clear table</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>Four of a Kind</Text>
              <Text style={styles.referenceValue}>Clears table automatically</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>Passes</Text>
              <Text style={styles.referenceValue}>3 consecutive passes reset trick</Text>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'left',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryNavButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  primaryNavButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: colors.grey,
    borderColor: colors.grey,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  quickReference: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickReferenceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  referenceGrid: {
    gap: 12,
  },
  referenceItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  referenceValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

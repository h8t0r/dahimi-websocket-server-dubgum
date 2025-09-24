
import { StyleSheet, ViewStyle, TextStyle, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const colors = {
  primary: '#2563eb',      // Blue
  secondary: '#1d4ed8',    // Darker Blue
  accent: '#3b82f6',       // Light Blue
  background: '#f8fafc',   // Light gray background
  backgroundAlt: '#ffffff', // White
  text: '#1f2937',         // Dark gray text
  textSecondary: '#6b7280', // Medium gray text
  grey: '#e5e7eb',         // Light gray
  card: '#ffffff',         // White card background
  border: '#d1d5db',       // Light border
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  error: '#ef4444',        // Red
  red: '#dc2626',          // Card red
  black: '#1f2937',        // Card black
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    maxWidth: screenWidth,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    maxWidth: screenWidth,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
    maxWidth: screenWidth - 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
    maxWidth: screenWidth - 40,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: screenWidth - 40,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: screenWidth - 40,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: screenWidth,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 400,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    maxWidth: screenWidth - 40,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.text,
  },
});

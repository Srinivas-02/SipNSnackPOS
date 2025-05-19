import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007AFF',
  success: '#4CAF50',
  danger: '#E53935',
  warning: '#FFC107',
  text: '#000000',
  textSecondary: '#666666',
  background: '#F5F5F5',
  card: '#FFFFFF',
  border: '#E0E0E0',
};

export const globalStyles = StyleSheet.create({
  text: {
    color: colors.text,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  heading: {
    color: colors.text,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Define the props for flexibility
interface HeaderProps {
  title: string;
  onBack?: () => void; // Optional custom back behavior
  colors: {
    text: string;
  };
}

const Header = ({ title, onBack, colors }: HeaderProps) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable 
        onPress={onBack ? onBack : () => router.back()} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={28} color={colors.text} />
      </Pressable>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      {/* Spacer to keep the title centered */}
      <View style={styles.spacer} /> 
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 40, 
  },
});

export default Header;
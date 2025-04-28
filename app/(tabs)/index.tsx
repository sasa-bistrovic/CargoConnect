import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';

export default function TabOneScreen() {
  const router = useRouter();

  const navigateToAddVehicle = () => {
    router.push('/add');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Management</Text>
      <View style={styles.separator} />
      
      <Text style={styles.description}>
        Manage your fleet of vehicles and track their status in real-time.
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Add New Vehicle" 
          onPress={navigateToAddVehicle}
          style={styles.button}
          variant="primary"
          size="large"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={navigateToAddVehicle}
      >
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: colors.border,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
  button: {
    width: '100%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
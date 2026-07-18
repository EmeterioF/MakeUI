import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';

interface Props {
  visible: boolean;
}

export function AiLoadingIndicator({ visible }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.text}>Generating layout options...</Text>
          <Text style={styles.subtext}>Creating variations for you to choose from</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
});

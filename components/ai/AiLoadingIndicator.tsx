import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Animated, StyleSheet, Modal } from 'react-native';

interface Props {
  visible: boolean;
}

const THINKING_STEPS = [
  'Analyzing your layout...',
  'Exploring spacing variations...',
  'Trying alignment ideas...',
  'Polishing visual hierarchy...',
  'Preparing your options...',
];

const STEP_INTERVAL_MS = 2400;

export function AiLoadingIndicator({ visible }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      fade.setValue(1);
      return;
    }
    const id = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(
        () => {
          setStepIndex((i) => (i + 1) % THINKING_STEPS.length);
          Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }
      );
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [visible, fade]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.text}>Generating layout options...</Text>
          <Animated.Text style={[styles.subtext, { opacity: fade }]}>
            {THINKING_STEPS[stepIndex]}
          </Animated.Text>
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
    minWidth: 260,
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

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 6000;

export function AiUndoToast({ visible, onUndo, onDismiss }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });
    fadeIn.start();
    const id = setTimeout(() => {
      fadeOut.start(() => onDismiss());
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [visible, opacity, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>Layout applied</Text>
      <Pressable
        onPress={onUndo}
        style={({ pressed }) => [styles.undoBtn, pressed && styles.undoBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Undo applied layout"
      >
        <Text style={styles.undoText}>Undo</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 76,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  undoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  undoBtnPressed: {
    opacity: 0.8,
  },
  undoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

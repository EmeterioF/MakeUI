import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useAiSuggestionStore } from '@/editor/aiSuggestionStore';
import ComponentRenderer from '@/renderer/componentRenderer';

export function AiPreviewOverlay() {
  const {
    aiSuggestions,
    aiOriginalTree,
    showAiPreview,
    applySuggestions,
    discardSuggestions,
    togglePreview,
  } = useAiSuggestionStore();

  const [showOriginal, setShowOriginal] = useState(false);

  if (!showAiPreview || !aiSuggestions) return null;

  const displayTree = showOriginal ? aiOriginalTree : aiSuggestions;

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Layout Suggestion</Text>
            <Pressable onPress={togglePreview}>
              <Text style={styles.close}>X</Text>
            </Pressable>
          </View>

          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, !showOriginal && styles.toggleActive]}
              onPress={() => setShowOriginal(false)}
            >
              <Text style={[styles.toggleText, !showOriginal && styles.toggleTextActive]}>
                AI Suggestion
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, showOriginal && styles.toggleActive]}
              onPress={() => setShowOriginal(true)}
            >
              <Text style={[styles.toggleText, showOriginal && styles.toggleTextActive]}>
                Original
              </Text>
            </Pressable>
          </View>

          <View style={styles.preview}>
            {displayTree?.map((node) => (
              <ComponentRenderer key={node.id} node={node} />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.discardBtn} onPress={discardSuggestions}>
              <Text style={styles.discardText}>Discard</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={applySuggestions}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
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
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  close: {
    fontSize: 20,
    color: '#666',
  },
  toggleRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
  },
  preview: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  discardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useAiSuggestionStore } from '@/editor/aiSuggestionStore';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import { cleanFileName } from '@/services/componentFileService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onApplyWithBackup: (backupFileName: string) => void;
  onApplyWithoutBackup: () => void;
}

export function AiBackupConfirmDialog({
  visible,
  onClose,
  onApplyWithBackup,
  onApplyWithoutBackup,
}: Props) {
  const currentFileName = useComponentNodeStore((s) => s.currentFileName);
  const currentProjectId = useComponentNodeStore((s) => s.currentProjectId);
  const { name: projectName } = useComponentNodeStore.getState().currentProjectId
    ? { name: 'Current Project' }
    : { name: 'No Project' };

  const [backupName, setBackupName] = useState(() => {
    const base = currentFileName.replace(/\.tsx$/, '');
    return `${base} (Original).tsx`;
  });
  const [error, setError] = useState<string | null>(null);

  const defaultBase = currentFileName.replace(/\.tsx$/, '');
  const defaultName = `${defaultBase} (Original).tsx`;

  const handleApplyWithBackup = () => {
    const cleaned = cleanFileName(backupName);
    if (cleaned === currentFileName) {
      setError('Backup name cannot be the same as the current file name.');
      return;
    }
    setError(null);
    onApplyWithBackup(cleaned);
  };

  const handleApplyWithoutBackup = () => {
    Alert.alert(
      'Apply without backup',
      'The original design will not be saved as a separate file. You can still undo within 6 seconds.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply anyway', onPress: onApplyWithoutBackup, style: 'destructive' },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Save Original Design?</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.message}>
            Applying the AI layout will replace your current design. Save a copy of the original first?
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Backup file name</Text>
            <TextInput
              style={styles.textInput}
              value={backupName}
              onChangeText={(text) => {
                setBackupName(text);
                setError(null);
              }}
              placeholder={defaultName}
              autoCapitalize="none"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <View style={styles.projectInfo}>
            <Text style={styles.projectLabel}>Saves to project:</Text>
            <Text style={styles.projectName}>{projectName}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.applyBackupBtn} onPress={handleApplyWithBackup}>
            <Text style={styles.applyBackupText}>Save backup & Apply</Text>
          </Pressable>
          <Pressable style={styles.applyNoBackupBtn} onPress={handleApplyWithoutBackup}>
            <Text style={styles.applyNoBackupText}>Apply without backup</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  message: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E53E3E',
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F7FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  projectLabel: {
    fontSize: 13,
    color: '#666',
  },
  projectName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  actions: {
    flexDirection: 'column',
    padding: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyBackupBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBackupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  applyNoBackupBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FC8181',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyNoBackupText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E53E3E',
  },
  cancelBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});
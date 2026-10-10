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
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.applyNoBackupBtn} onPress={handleApplyWithoutBackup}>
            <Text style={styles.applyNoBackupText}>Apply without backup</Text>
          </Pressable>
          <Pressable style={styles.applyBackupBtn} onPress={handleApplyWithBackup}>
            <Text style={styles.applyBackupText}>Save backup & Apply</Text>
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
  content: {
    padding: 16,
    gap: 16,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  errorText: {
    fontSize: 12,
    color: '#E53E3E',
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  projectLabel: {
    fontSize: 13,
    color: '#666',
  },
  projectName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  applyNoBackupBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FC8181',
    alignItems: 'center',
  },
  applyNoBackupText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E53E3E',
  },
  applyBackupBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyBackupText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
import { useMemo } from 'react';
import { findNode, useComponentNodeStore } from '@/editor/componentNodeStore';

const ROOT_KEYS = new Set(['content', 'x', 'y']);

export function usePropertyEditor() {
    const { componentTree, selectedID, editNode } = useComponentNodeStore();
    const selectedNode = useMemo(() => findNode(componentTree, selectedID), [componentTree, selectedID]);

    const getValue = (key: string): string => {
        if (!selectedNode) return '';
        if (ROOT_KEYS.has(key)) return String((selectedNode as any)[key] ?? '');
        return String(selectedNode.style?.[key as keyof typeof selectedNode.style] ?? '');
    };

    const handleChange = (key: string, value: string, type: string) => {
        if (!selectedNode) return;

        const isRoot = ROOT_KEYS.has(key);
        const parsedValue = type === 'number' ? (value.trim() === '' ? undefined : Number(value)) : value;

        editNode(
            selectedNode.id,
            isRoot
                ? { [key]: ['x', 'y'].includes(key) ? Number(value) : parsedValue }
                : {
                      style: {
                          ...selectedNode.style,
                          [key]: parsedValue,
                      },
                  }
        );
    };

    const stepValue = (key: string, delta: number) => {
        const current = Number(getValue(key)) || 0;
        handleChange(key, String(current + delta), 'number');
    };

    return {
        selectedNode,
        getValue,
        handleChange,
        stepValue,
    };
}

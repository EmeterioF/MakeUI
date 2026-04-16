import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ComponentNode } from '@/editor/componentNodeStore';

const base = StyleSheet.create({
    selected: {
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    imageFill: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderIcon: {
        fontSize: 32,
    },
});

export const getNodeStyle = (node: ComponentNode, isSelected: boolean) => {
    const selection = isSelected ? base.selected : null;

    // cast node.style as any because it holds mixed View+Text styles
    // TypeScript can't verify it statically, but it works at runtime
    const nodeStyle = node.style as any;

    return {
        view:                [nodeStyle, selection] as ViewStyle[],
        text:                [nodeStyle, selection] as TextStyle[],
        button:              [nodeStyle, selection] as ViewStyle[],
        buttonLabel:         base.buttonLabel,
        image:               [nodeStyle, selection] as ViewStyle[],
        imageFill:           base.imageFill,
        imagePlaceholder:    base.imagePlaceholder,
        imagePlaceholderIcon: base.imagePlaceholderIcon,
    };

};

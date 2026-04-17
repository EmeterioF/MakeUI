import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ComponentNode, LayoutMode } from '@/editor/componentNodeStore';

const base = StyleSheet.create({
    selected: {
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    dropTarget: {
        borderWidth: 2,
        borderColor: '#10B981',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(16,185,129,0.08)',
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
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderIcon: {
        fontSize: 24,
    },
});

export const getNodeStyle = (
    node: ComponentNode,
    isSelected: boolean,
    isDropTarget: boolean,
    parentLayoutMode: LayoutMode
) => {
    const position: ViewStyle =
        parentLayoutMode === 'absolute'
            ? {
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
              }
            : {};

    const selection = isSelected ? base.selected : null;
    const dropTarget = isDropTarget ? base.dropTarget : null;
    const nodeStyle = node.style as unknown as ViewStyle & TextStyle;

    return {
        view: [position, nodeStyle, selection, dropTarget] as ViewStyle[],
        text: [position, nodeStyle, selection] as TextStyle[],
        button: [{ justifyContent: 'center', alignItems: 'center' }, position, nodeStyle, selection] as ViewStyle[],
        buttonLabel: [base.buttonLabel, { color: node.style.color ?? '#fff' }] as TextStyle[],
        image: [position, nodeStyle, selection] as ViewStyle[],
        imageFill: base.imageFill,
        imagePlaceholder: base.imagePlaceholder,
        imagePlaceholderIcon: base.imagePlaceholderIcon,
    };
};

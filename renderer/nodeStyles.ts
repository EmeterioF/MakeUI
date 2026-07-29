import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ComponentNode } from '@/editor/componentNodeStore';

const base = StyleSheet.create({
    selected: {
        borderWidth: 2,
        borderColor: '#4A90E2',
        borderStyle: 'dashed',

    },
    dropTarget: {
        borderWidth: 2,
        borderColor: '#10B981',
        // borderStyle: 'dashed', used for figma like appearance of a parent
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
    isDropTarget: boolean
) => {
    const selection = isSelected ? base.selected : null;
    const dropTarget = isDropTarget ? base.dropTarget : null;
    const nodeStyle = node.style as unknown as ViewStyle & TextStyle;
    const {
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        gap,
        rowGap,
        columnGap,
        padding,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        ...viewBoxStyle
    } = node.style as ViewStyle;

    const flexLayout = {
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        gap,
        rowGap,
        columnGap,
        padding,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
    } as ViewStyle;

    return {
        view: [viewBoxStyle, selection, dropTarget] as ViewStyle[],
        viewChildren: { flex: 1, ...flexLayout } as ViewStyle,
        scrollView: [viewBoxStyle, dropTarget] as ViewStyle[],
        scrollViewContent: flexLayout,
        text: [nodeStyle, selection] as TextStyle[],
        button: [{ justifyContent: 'center', alignItems: 'center' }, nodeStyle, selection] as ViewStyle[],
        buttonLabel: [base.buttonLabel, { color: node.style.color ?? '#fff' }] as TextStyle[],
        image: [nodeStyle, selection] as ViewStyle[],
        imageFill: base.imageFill,
        imagePlaceholder: base.imagePlaceholder,
        imagePlaceholderIcon: base.imagePlaceholderIcon,
    };
};

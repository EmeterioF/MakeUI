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

    // View nodes have two layers:
    // 1) outer box: size/background/border/drag/selection
    // 2) inner content: flex layout for the children
    // Flex props must live on the inner View because that is where children render.
    const viewChildrenStyle = {
        flex: 1,
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
        viewChildren: viewChildrenStyle,
        text: [nodeStyle, selection] as TextStyle[],
        button: [{ justifyContent: 'center', alignItems: 'center' }, nodeStyle, selection] as ViewStyle[],
        buttonLabel: [base.buttonLabel, { color: node.style.color ?? '#fff' }] as TextStyle[],
        image: [nodeStyle, selection] as ViewStyle[],
        imageFill: base.imageFill,
        imagePlaceholder: base.imagePlaceholder,
        imagePlaceholderIcon: base.imagePlaceholderIcon,
    };
};

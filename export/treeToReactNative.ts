import type { CanvasConfig, ComponentNode, ComponentStyle } from '@/editor/componentNodeTypes';

type RenderResult = {
    jsx: string;
    styleLines: string[];
};

const INDENT = '    ';

const indent = (depth: number): string => INDENT.repeat(depth);

const escapeString = (value: string): string =>
    value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, '\\n');

const toStyleValue = (value: string | number): string =>
    typeof value === 'number' ? String(value) : `'${escapeString(value)}'`;

const toStyleEntries = (style: ComponentStyle): string[] =>
    Object.entries(style)
        .filter(([key, value]) => key !== 'layoutMode' && value !== undefined)
        .map(([key, value]) => `        ${key}: ${toStyleValue(value as string | number)},`);

const renderNode = (node: ComponentNode, counter: { value: number }, depth = 2): RenderResult => {
    counter.value += 1;
    const styleName = `node${counter.value}`;
    const styleLines = [`    ${styleName}: {`, ...toStyleEntries(node.style), '    },'];
    const pad = indent(depth);
    const childPad = indent(depth + 1);

    if (node.type === 'View') {
        const children = (node.children ?? []).map((child) => renderNode(child, counter, depth + 1));
        const childrenJsx = children.map((child) => child.jsx).join('\n');
        return {
            jsx: childrenJsx
                ? `${pad}<View style={styles.${styleName}}>\n${childrenJsx}\n${pad}</View>`
                : `${pad}<View style={styles.${styleName}} />`,
            styleLines: [...styleLines, ...children.flatMap((child) => child.styleLines)],
        };
    }

    if (node.type === 'Text') {
        return {
            jsx: `${pad}<Text style={styles.${styleName}}>${escapeString(node.content ?? 'Text')}</Text>`,
            styleLines,
        };
    }

    if (node.type === 'Button') {
        const labelStyleName = `${styleName}Label`;
        return {
            jsx: `${pad}<Pressable style={styles.${styleName}}>\n${childPad}<Text style={styles.${labelStyleName}}>${escapeString(node.content ?? 'Button')}</Text>\n${pad}</Pressable>`,
            styleLines: [
                ...styleLines,
                `    ${labelStyleName}: {`,
                `        color: ${toStyleValue(node.style.color ?? '#FFFFFF')},`,
                `        fontSize: ${toStyleValue(node.style.fontSize ?? 14)},`,
                '        fontWeight: \'600\',',
                '        textAlign: \'center\',',
                '    },',
            ],
        };
    }

    const source = node.content?.trim();
    return {
        jsx: source
            ? `${pad}<Image source={{ uri: '${escapeString(source)}' }} style={styles.${styleName}} />`
            : `${pad}<View style={[styles.${styleName}, styles.imagePlaceholder]}>\n${childPad}<Text style={styles.imagePlaceholderText}>Image</Text>\n${pad}</View>`,
        styleLines,
    };
};

export const convertTreeToReactNativeCode = (componentTree: ComponentNode[], canvasConfig: CanvasConfig): string => {
    const counter = { value: 0 };
    const rendered = componentTree.map((node) => renderNode(node, counter, 2));
    const treeJsx = rendered.map((node) => node.jsx).join('\n');
    const nodeStyleLines = rendered.flatMap((node) => node.styleLines);

    const rootStyles = [
        '    root: {',
        '        flex: 1,',
        `        flexDirection: ${toStyleValue(canvasConfig.style.flexDirection)},`,
        `        justifyContent: ${toStyleValue(canvasConfig.style.justifyContent)},`,
        `        alignItems: ${toStyleValue(canvasConfig.style.alignItems)},`,
        `        flexWrap: ${toStyleValue(canvasConfig.style.flexWrap)},`,
        `        backgroundColor: ${toStyleValue(canvasConfig.style.backgroundColor)},`,
        ...(canvasConfig.style.gap !== undefined ? [`        gap: ${canvasConfig.style.gap},`] : []),
        ...(canvasConfig.style.padding !== undefined ? [`        padding: ${canvasConfig.style.padding},`] : []),
        '    },',
        '    imagePlaceholder: {',
        '        justifyContent: \'center\',',
        '        alignItems: \'center\',',
        '        borderWidth: 1,',
        '        borderStyle: \'dashed\',',
        '        borderColor: \'#9CA3AF\',',
        '        backgroundColor: \'#F3F4F6\',',
        '    },',
        '    imagePlaceholderText: {',
        '        color: \'#6B7280\',',
        '        fontSize: 12,',
        '        fontWeight: \'600\',',
        '    },',
    ];

    return [
        'import React from \'react\';',
        'import { Image, Pressable, StyleSheet, Text, View } from \'react-native\';',
        '',
        'export default function GeneratedScreen() {',
        '    return (',
        '        <View style={styles.root}>',
        treeJsx || '            {/* Empty canvas */}',
        '        </View>',
        '    );',
        '}',
        '',
        'const styles = StyleSheet.create({',
        ...rootStyles,
        ...nodeStyleLines,
        '});',
        '',
    ].join('\n');
};

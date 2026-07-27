import { ComponentType } from '@/editor/componentNodeTypes';

export type PropertyFieldType = 'number' | 'color' | 'select' | 'text' | 'imagePicker';

export type PropertyField = {
    label: string;
    key: string;
    type: PropertyFieldType;
    options?: string[];
};

export type PropertySection = {
    header: string;
    styles: PropertyField[];
};

export const properties: PropertySection[] = [
    {
        header: 'Position',
        styles: [
            { label: 'Margin', key: 'margin', type: 'number' },
            { label: 'Margin Top', key: 'marginTop', type: 'number' },
            { label: 'Margin Right', key: 'marginRight', type: 'number' },
            { label: 'Margin Bottom', key: 'marginBottom', type: 'number' },
            { label: 'Margin Left', key: 'marginLeft', type: 'number' },
        ]
    },
    {
        header: 'Layout',
        styles: [
            { label: 'Flex', key: 'flex', type: 'number' },
            { label: 'Flex Grow', key: 'flexGrow', type: 'number' },
            { label: 'Flex Shrink', key: 'flexShrink', type: 'number' },
            { label: 'Flex Basis', key: 'flexBasis', type: 'text' },
            { label: 'Width', key: 'width', type: 'number' },
            { label: 'Height', key: 'height', type: 'number' },
            { label: 'Min Width', key: 'minWidth', type: 'number' },
            { label: 'Min Height', key: 'minHeight', type: 'number' },
            { label: 'Max Width', key: 'maxWidth', type: 'number' },
            { label: 'Max Height', key: 'maxHeight', type: 'number' },
            { label: 'Flex Direction', key: 'flexDirection', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
            { label: 'Justify Content', key: 'justifyContent', type: 'select', options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] },
            { label: 'Align Items', key: 'alignItems', type: 'select', options: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'] },
            { label: 'Align Self', key: 'alignSelf', type: 'select', options: ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'] },
            { label: 'Flex Wrap', key: 'flexWrap', type: 'select', options: ['nowrap', 'wrap'] },
            { label: 'Padding', key: 'padding', type: 'number' },
            { label: 'Padding Top', key: 'paddingTop', type: 'number' },
            { label: 'Padding Right', key: 'paddingRight', type: 'number' },
            { label: 'Padding Bottom', key: 'paddingBottom', type: 'number' },
            { label: 'Padding Left', key: 'paddingLeft', type: 'number' },
            { label: 'Gap', key: 'gap', type: 'number' },
            { label: 'Row Gap', key: 'rowGap', type: 'number' },
            { label: 'Column Gap', key: 'columnGap', type: 'number' },
        ]
    },
    {
        header: 'Border',
        styles: [
            { label: 'Border Radius', key: 'borderRadius', type: 'number' },
            { label: 'Border Width', key: 'borderWidth', type: 'number' },
            { label: 'Border Color', key: 'borderColor', type: 'color' },
        ]
    },
    {
        header: 'Background',
        styles: [
            { label: 'Background Color', key: 'backgroundColor', type: 'color' },
        ]
    },
    {
        header: 'ScrollView',
        styles: [
            { label: 'Horizontal', key: 'horizontal', type: 'select', options: ['false', 'true'] },
            { label: 'Show Indicators', key: 'showsVerticalScrollIndicator', type: 'select', options: ['true', 'false'] },
            { label: 'Bounces', key: 'bounces', type: 'select', options: ['true', 'false'] },
        ]
    },
    {
        header: 'Image',
        styles: [
            { label: 'Resize Mode', key: 'resizeMode', type: 'select', options: ['cover', 'contain', 'stretch', 'center'] },
            { label: 'Pick Image', key: 'content', type: 'imagePicker' },
        ]
    },
    {
        header: 'Text',
        styles: [
            { label: 'Content', key: 'content', type: 'text' },
            { label: 'Font Size', key: 'fontSize', type: 'number' },
            { label: 'Font Weight', key: 'fontWeight', type: 'select', options: ['300', '400', '500', '600', '700', '800', '900'] },
            { label: 'Text Color', key: 'color', type: 'color' },
            { label: 'Text Align', key: 'textAlign', type: 'select', options: ['left', 'center', 'right', 'justify'] },
        ]
    }
];

const PROPERTY_SECTIONS_BY_COMPONENT: Record<ComponentType, PropertySection['header'][]> = {
    View: ['Position', 'Layout', 'Border', 'Background'],
    Text: ['Position', 'Layout', 'Border', 'Background', 'Text'],
    Button: ['Position', 'Layout', 'Border', 'Background', 'Text'],
    Image: ['Position', 'Layout', 'Border', 'Background', 'Image'],
    ScrollView: ['Position', 'Layout', 'Border', 'Background', 'ScrollView'],
};

export function getPropertiesForComponent(type: ComponentType): PropertySection[] {
    const allowedHeaders = new Set(PROPERTY_SECTIONS_BY_COMPONENT[type]);
    return properties.filter((section) => allowedHeaders.has(section.header));
}

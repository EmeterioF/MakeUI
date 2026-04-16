export const properties = [
    {
        header: 'Position',
        styles: [
            { label: 'X', key: 'x', type: 'number' },
            { label: 'Y', key: 'y', type: 'number' },
            { label: 'Position Mode', key: 'positionMode', type: 'select', options: ['absolute', 'flow'] },
        ]
    },
    {
        header: 'Layout',
        styles: [
            { label: 'Layout Mode', key: 'layoutMode', type: 'select', options: ['absolute', 'flex'] },
            { label: 'Width', key: 'width', type: 'number' },
            { label: 'Height', key: 'height', type: 'number' },
            { label: 'Flex Direction', key: 'flexDirection', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
            { label: 'Justify Content', key: 'justifyContent', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
            { label: 'Align Items', key: 'alignItems', type: 'select', options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
            { label: 'Align Self', key: 'alignSelf', type: 'select', options: ['auto', 'stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
            { label: 'Align Content', key: 'alignContent', type: 'select', options: ['stretch', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around'] },
            { label: 'Flex Wrap', key: 'flexWrap', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
            { label: 'Flex', key: 'flex', type: 'number' },
            { label: 'Flex Grow', key: 'flexGrow', type: 'number' },
            { label: 'Flex Shrink', key: 'flexShrink', type: 'number' },
            { label: 'Flex Basis', key: 'flexBasis', type: 'text' },
            { label: 'Gap', key: 'gap', type: 'number' },
            { label: 'Row Gap', key: 'rowGap', type: 'number' },
            { label: 'Column Gap', key: 'columnGap', type: 'number' },
            { label: 'Padding', key: 'padding', type: 'number' },
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
        header: 'Image',
        styles: [
            { label: 'Resize Mode', key: 'resizeMode', type: 'select', options: ['cover', 'contain', 'stretch', 'center'] },
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

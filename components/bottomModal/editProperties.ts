export const properties = [
    {
        header: 'Position',
        styles: [
            { label: 'X', key: 'x', type: 'number' },
            { label: 'Y', key: 'y', type: 'number' },
        ]
    },
    {
        header: 'Layout',
        styles: [
            { label: 'Width', key: 'width', type: 'number' },
            { label: 'Height', key: 'height', type: 'number' },
            { label: 'Flex Direction', key: 'flexDirection', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
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
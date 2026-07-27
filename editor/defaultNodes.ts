// defaultNodes.ts — these are TEMPLATES only, always spread + new id before adding
import { ComponentNode } from '@/editor/componentNodeStore';

export const ViewDefault: Omit<ComponentNode, 'id'> = {
    type: 'View',
    x: 0, y: 0,
    style: {
        flex: 1,
        padding: 12,
        gap: 8,
        backgroundColor: '#E8E8E8',
        borderColor: '#8D8D8D',
        borderWidth: 1,
        layoutMode: 'flex',
    },
    children: [],
};

export const TextDefault: Omit<ComponentNode, 'id'> = {
    type: 'Text',
    x: 0, y: 0,
    style: { fontSize: 16, color: '#000', marginTop: 8, marginLeft: 8 },
    content: 'Text',
};

export const ButtonDefault: Omit<ComponentNode, 'id'> = {
    type: 'Button',
    x: 0, y: 0,
    style: { height: 44, paddingLeft: 14, paddingRight: 14, backgroundColor: '#6200EE', borderRadius: 8, color: '#fff', fontSize: 14, marginTop: 8, marginLeft: 8, alignSelf: 'flex-start' },
    content: 'Button',
};

export const ScrollViewDefault: Omit<ComponentNode, 'id'> = {
    type: 'ScrollView',
    x: 0, y: 0,
    style: {
        flex: 1,
        padding: 12,
        gap: 8,
        flexDirection: 'column',
    },
    children: [],
};

export const ImageDefault: Omit<ComponentNode, 'id'> = {
    type: 'Image',
    x: 0, y: 0,
    style: { width: 160, height: 120, resizeMode: 'cover', marginTop: 8, marginLeft: 8 },
    content: '',
};

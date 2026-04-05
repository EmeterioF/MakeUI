// defaultNodes.ts — these are TEMPLATES only, always spread + new id before adding
import { ComponentNode } from '@/editor/componentNodeStore';

export const ViewDefault: Omit<ComponentNode, 'id'> = {
    type: 'View',
    x: 40, y: 40,
    style: { width: 200, height: 120, backgroundColor: '#e8e8e8', borderColor: '#8d8d8d', borderWidth: 1 },
    children: [],
};

export const TextDefault: Omit<ComponentNode, 'id'> = {
    type: 'Text',
    x: 40, y: 40,
    style: { fontSize: 16, color: '#000' },
    content: 'Text',
};

export const ButtonDefault: Omit<ComponentNode, 'id'> = {
    type: 'Button',
    x: 40, y: 40,
    style: { width: 120, height: 44, backgroundColor: '#6200EE', borderRadius: 8, color: '#fff', fontSize: 14 },
    content: 'Button',
};

export const ImageDefault: Omit<ComponentNode, 'id'> = {
    type: 'Image',
    x: 40, y: 40,
    style: { width: 160, height: 120, resizeMode: 'cover' },
    content: '',
};
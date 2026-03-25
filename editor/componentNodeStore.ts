import { create } from 'zustand'
import { View, Image, Text, Button } from './defaultNodes'

export type ComponentType = 'View' | 'Text' | 'Button' | 'Image';

export interface ComponentNode {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    style: {
        width?: number | string;
        height?: number | string;

        flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
        padding?: number;
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        backgroundColor?: string;

        resizeMode?: 'center' | 'contain' | 'stretch' | 'repeat' | 'cover'

        fontSize?: number;
        fontWeight?: 'normal' | 'bold';
        color?: string;
        textAlign?: 'left' | 'center' | 'right';
    };
    content?: string;
    children?: ComponentNode[];
}

interface CanvasState {
    componentTree: ComponentNode[];
    selectedID: string | null;

    addNode: (componentNode: ComponentNode, selectedID: string | null) => void;
}

export const useComponentNodeStore = create<CanvasState>((set,get) => ({
    componentTree: [],
    selectedID: null,

    addNode: (componentNode) => {
        const { selectedID } = get();

        if (!selectedID) {
            set((state) => ({
                componentTree: [...state.componentTree, componentNode]
            }))
            return;
        }
        // handle child insert here
    }
}));

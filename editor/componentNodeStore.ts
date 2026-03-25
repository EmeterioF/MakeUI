import {create} from 'zustand'

export type ComponentType = 'View' | 'Text' | 'Button' | 'Image';

export interface ComponentNode {
    id: string;                  // unique identifier
    type: ComponentType;         // type of component
    x: number;                   // X position on canvas
    y: number;                   // Y position on canvas
    style: {

        /* GENERAL STYLING */
        width?: number | string;
        height?: number | string;

        /* VIEW STYLES */
        flexDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
        padding?: number;
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        backgroundColor?: string;

        /* IMAGE STYLES*/
        resizeMode?: 'center' | 'contain' | 'stretch' | 'repeat' | 'cover'

        /* TEXT STYLES */
        fontSize?: number;
        fontWeight?: 'normal' | 'bold';
        color?: string;
        textAlign?: 'left' | 'center' | 'right';
    };
    content?: string;            // Text for Text/Button, URL for Image
    children?: ComponentNode[];   // only Views can have children
}

interface CanvasState{
    componentTree: ComponentNode[],
    selectedID: string|null,

    // addComponent: (componentNode: ComponentNode, selectedID: string|null) => null
}

const useComponentNodeStore = create<CanvasState>((get, set) => ({
    componentTree: [],
    selectedID: null,


}))



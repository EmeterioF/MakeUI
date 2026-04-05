import { create } from 'zustand'

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
    //THE COMPONENT TREE
    componentTree: ComponentNode[];

    //NODE SELECTION
    selectedID: string | null;
    selectNode: (id:string) => void;

    //EDITOR CRUD FUNCTIONS
    addNode: (componentNode: ComponentNode, selectedID: string | null) => void;
}

export const useComponentNodeStore = create<CanvasState>((set,get) => ({
    componentTree: [],
    selectedID: null,

    selectNode: (id) => set((state) => ({
        selectedID: state.selectedID === id ? null : id //selecting node witht toggle function
    })),

    addNode: (componentNode, selectedNode?) => {
        const { selectedID } = get();

        if(selectedID){
            //made it a child of the selected id
        }

        if (!selectedID) {
            set((state) => ({
                componentTree: [...state.componentTree, componentNode]
            }))
            return;
        }

    },

}));

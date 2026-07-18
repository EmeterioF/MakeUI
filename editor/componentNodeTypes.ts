export type ComponentType = 'View' | 'Text' | 'Button' | 'Image';
export type LayoutMode = 'flex';

export interface ComponentStyle {
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    flex?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    flexWrap?: 'wrap' | 'nowrap';
    gap?: number;
    rowGap?: number;
    columnGap?: number;
    margin?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    padding?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    backgroundColor?: string;
    resizeMode?: 'center' | 'contain' | 'stretch' | 'repeat' | 'cover';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    layoutMode?: LayoutMode;
}

export interface ComponentNode {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    style: ComponentStyle;
    content?: string;
    children?: ComponentNode[];
}

export type Rect = { x: number; y: number; width: number; height: number };

export interface CanvasConfig {
    layoutMode: LayoutMode;
    style: {
        flexDirection: 'row' | 'column';
        justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
        alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
        flexWrap: 'nowrap' | 'wrap';
        gap?: number;
        padding?: number;
        backgroundColor: string;
    };
}

export interface CanvasState {
    currentFileId: number | null;
    currentFileName: string;
    componentTree: ComponentNode[];
    selectedID: string | null;
    hoveredParentID: string | null;
    // Absolute on-screen rectangles keyed by node id.
    // Drag preview uses these measurements to decide which View is under the finger.
    layoutBounds: Record<string, Rect>;
    canvasConfig: CanvasConfig;

    setCurrentFileName: (fileName: string) => void;
    startNewFile: () => void;
    loadFile: (file: {
        id: number;
        fileName: string;
        componentTree: ComponentNode[];
        canvasConfig: CanvasConfig;
    }) => void;
    markFileSaved: (id: number, fileName: string) => void;
    selectNode: (id: string | null) => void;
    selectParentNode: (id: string) => void;
    addNode: (node: Omit<ComponentNode, 'id'>) => void;
    deleteNode: (id: string | null) => void;
    editNode: (id: string, updates: Partial<Omit<ComponentNode, 'id'>>) => void;
    updateNodeLayout: (id: string, rect: Rect) => void;
    // Returns the best candidate parent under the pointer during a drag.
    previewDropTarget: (id: string, pageX: number, pageY: number) => string | null;
    clearDropTarget: () => void;
    // Moves an existing node into a different View parent.
    dropNodeIntoParent: (id: string, parentId: string, dx: number, dy: number) => boolean;
    updateCanvasConfig: (updates: { layoutMode?: LayoutMode; style?: Partial<CanvasConfig['style']> }) => void;
    replaceTree: (newTree: ComponentNode[]) => void;
}

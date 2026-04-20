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
    componentTree: ComponentNode[];
    selectedID: string | null;
    hoveredParentID: string | null;
    layoutBounds: Record<string, Rect>;
    canvasConfig: CanvasConfig;

    selectNode: (id: string | null) => void;
    selectParentNode: (id: string) => void;
    addNode: (node: Omit<ComponentNode, 'id'>) => void;
    deleteNode: (id: string | null) => void;
    editNode: (id: string, updates: Partial<Omit<ComponentNode, 'id'>>) => void;
    updateNodeLayout: (id: string, rect: Rect) => void;
    previewDropTarget: (id: string, pageX: number, pageY: number) => string | null;
    clearDropTarget: () => void;
    dropNodeIntoParent: (id: string, parentId: string, dx: number, dy: number) => boolean;
    updateCanvasConfig: (updates: { layoutMode?: LayoutMode; style?: Partial<CanvasConfig['style']> }) => void;
}

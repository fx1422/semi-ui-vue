import { CSSProperties, VNode } from 'vue';
import {
    BasicTreeProps,
    BasicExpandedOtherProps,
    BasicRenderFullLabelProps,
    BasicSearchRenderProps,
    BasicTreeInnerData,
    BasicKeyEntities,
    BasicKeyEntity,
    BasicTreeNodeProps,
    BasicFlattenNode,
    BasicTreeNodeData,
    BasicOnDragProps,
    KeyMapProps,
    TreeDataSimpleJson,
} from '@douyinfe/semi-foundation/tree/foundation';

/* Tree */
export type Value = string | number | TreeNodeData | Array<TreeNodeData | number | string>;

export interface DragTreeNode extends TreeNodeData {
    expanded: boolean;
    /**
     * The positional relationship of the current node in the entire
     * treeData, such as the 0th node of the 2nd node of the 1st node
     * of the 0th layer: '0-1-2-0'
     */
    pos: string;
}

export interface DragProps {
    event: DragEvent;
    node: DragTreeNode;
}

export interface OnDragProps extends BasicOnDragProps {
    event: DragEvent;
    node: DragTreeNode;
    dragNode: DragTreeNode;
}

export interface DragEnterProps extends DragProps {
    expandedKeys?: string[];
}

export interface ExpandedOtherProps extends BasicExpandedOtherProps {
    node: TreeNodeData;
}

export interface RenderFullLabelProps extends BasicRenderFullLabelProps {
    onClick: (e: MouseEvent) => void;
    onContextMenu: (e: MouseEvent) => void;
    onDoubleClick: (e: MouseEvent) => void;
    onExpand: (e: MouseEvent) => void;
    data: TreeNodeData;
    style: CSSProperties;
    onCheck: (e: MouseEvent) => void;
    expandIcon: VNode | string;
}

export interface SearchRenderProps extends BasicSearchRenderProps {
    prefix: VNode | string;
}

export interface TreeProps extends BasicTreeProps {
    children?: VNode | string;
    defaultValue?: Value;
    emptyContent?: VNode | string;
    filterTreeNode?: boolean | ((inputValue: string, treeNodeString: string, data?: TreeNodeData) => boolean);
    searchRender?: ((searchRenderProps: SearchRenderProps) => VNode | string) | false;
    searchStyle?: CSSProperties;
    style?: CSSProperties;
    treeData?: TreeNodeData[];
    treeDataSimpleJson?: TreeDataSimpleJson;
    value?: Value;
    icon?: VNode | string | ((props: TreeNodeProps) => VNode | string);
    keyMaps?: KeyMapProps;
    loadData?: (treeNode?: TreeNodeData) => Promise<void>;
    onChange?: (value?: Value) => void;
    onDoubleClick?: (e: MouseEvent, node: TreeNodeData) => void;
    onDragEnd?: (dragProps: DragProps) => void;
    onDragLeave?: (dragProps: DragProps) => void;
    onDragOver?: (dragProps: DragProps) => void;
    onDragStart?: (dragProps: DragProps) => void;
    onDragEnter?: (dragEnterProps: DragEnterProps) => void;
    onDrop?: (onDragProps: OnDragProps) => void;
    onExpand?: (expandedKeys: string[], expandedOtherProps: ExpandedOtherProps) => void;
    onLoad?: (loadedKeys?: Set<string>, treeNode?: TreeNodeData) => void;
    onContextMenu?: (e: MouseEvent, node: TreeNodeData) => void;
    onSelect?: (selectedKey: string, selected: boolean, selectedNode: TreeNodeData) => void;
    renderDraggingNode?: (nodeInstance: HTMLElement, node: TreeNodeData) => HTMLElement;
    renderFullLabel?: (renderFullLabelProps: RenderFullLabelProps) => VNode | string;
    renderLabel?: (label?: VNode | string, treeNode?: TreeNodeData, searchWord?: string) => VNode | string;
    autoMergeValue?: boolean;
    expandIcon?:
        | VNode
        | string
        | ((props: { onClick: (e: MouseEvent) => void; className: string; expanded: boolean }) => VNode | string);
}

export interface OptionProps {
    index: number;
    style: CSSProperties;
    data: KeyEntity;
}

export interface KeyEntities extends BasicKeyEntities {
    [key: string]: KeyEntity;
}

export interface KeyEntity extends BasicKeyEntity {
    children?: KeyEntities;
    data?: TreeNodeData;
    parent?: undefined | KeyEntity;
}

export interface TreeState extends BasicTreeInnerData {
    keyEntities: KeyEntities;
    treeData: TreeNodeData[];
    flattenNodes: FlattenNode[];
    prevProps: null | TreeProps;
    cachedFlattenNodes: FlattenNode[] | undefined;
}

/* TreeNode */
export interface TreeNodeProps extends BasicTreeNodeProps {
    children?: TreeNodeData[];
    icon?: VNode | string;
    isEnd?: boolean[];
    expandIcon?:
        | VNode
        | string
        | ((props: { onClick: (e: MouseEvent) => void; className: string; expanded: boolean }) => VNode | string);
    level?: number;
    empty?: boolean;
    style?: CSSProperties;
    data?: any;
    emptyContent?: VNode | string;
    label?: VNode | string;
    value?: string | number;
    // Note: Don't add 'key' here - it's a reserved prop in Vue, use 'eventKey' instead
    filtered?: boolean;
    keyword?: string;
    treeNodeFilterProp?: string;
}

export interface TreeNodeState {
    [x: string]: any;
}

/* NodeList */
export interface TreeNodeData extends BasicTreeNodeData {
    label?: VNode | string;
    icon?: VNode | string;
    children?: TreeNodeData[];
}

export interface FlattenNode extends BasicFlattenNode {
    children?: FlattenNode[];
    data?: BasicTreeNodeData;
    label?: VNode | string;
    parent?: null | FlattenNode;
    isEnd?: boolean[];
}

export interface NodeListProps {
    [x: string]: any;
    flattenNodes: FlattenNode[];
    motionKeys: Set<string>;
    motionType: string | null;
    flattenList: FlattenNode[] | undefined;
    searchTargetIsDeep?: boolean;
    renderTreeNode: (treeNode: FlattenNode, ind?: number, style?: CSSProperties) => VNode;
}

export type TransitionNodes<T> = Array<T | Array<T>>;

export interface NodeListState {
    transitionNodes: TransitionNodes<FlattenNode>;
    cachedMotionKeys?: Set<string>;
    cachedData?: FlattenNode[];
}

export interface ScrollData {
    key: string;
    // The align parameter is consistent with react-window
    align?: 'center' | 'start' | 'end' | 'smart' | 'auto';
}

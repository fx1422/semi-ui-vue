import { VNode } from 'vue';
import { Virtualize, ExpandAction } from '@douyinfe/semi-foundation/tree/foundation';
import { TreeNodeData, KeyEntities, TreeNodeProps, FlattenNode, RenderFullLabelProps } from './interface';

export interface TreeContextValue {
    treeDisabled?: boolean;
    treeIcon?: VNode | string | ((props: TreeNodeProps) => VNode | string);
    motion?: boolean;
    motionKeys?: Set<string>;
    motionType?: string;
    filterTreeNode?: boolean | ((inputValue: string, treeNodeString: string) => void);
    keyEntities?: KeyEntities;
    onNodeClick?: any;
    onNodeExpand?: (e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) => void;
    onNodeSelect?: (e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) => void;
    onNodeCheck?: (e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) => void;
    onNodeRightClick?: (e: MouseEvent, treeNode: TreeNodeProps) => void;
    onNodeDoubleClick?: (e: MouseEvent, treeNode: TreeNodeProps) => void;
    renderTreeNode?: (treeNode: FlattenNode, ind?: number, style?: any) => VNode;
    onNodeDragStart?: (e: DragEvent, treeNode: TreeNodeProps) => void;
    onNodeDragEnter?: (e: DragEvent, treeNode: TreeNodeProps) => void;
    onNodeDragOver?: (e: DragEvent, treeNode: TreeNodeProps) => void;
    onNodeDragLeave?: (e: DragEvent, treeNode: TreeNodeProps) => void;
    onNodeDragEnd?: (e: DragEvent, treeNode: TreeNodeProps) => void;
    onNodeDrop?: (e: DragEvent, treeNode: TreeNodeProps) => void;
    expandAction?: ExpandAction;
    directory?: boolean;
    multiple?: boolean;
    showFilteredOnly?: boolean;
    isSearching?: boolean;
    loadData?: (treeNode?: TreeNodeData) => Promise<void>;
    onNodeLoad?: (data: TreeNodeData) => Promise<unknown>;
    renderLabel?: (label?: VNode | string, treeNode?: TreeNodeData, searchWord?: string) => VNode | string;
    draggable?: boolean;
    renderFullLabel?: (renderFullLabelProps: RenderFullLabelProps) => VNode | string;
    dragOverNodeKey?: string | string[];
    dropPosition?: number | null;
    labelEllipsis?: boolean | Virtualize;
}

export const TreeContextKey = Symbol('TreeContext');

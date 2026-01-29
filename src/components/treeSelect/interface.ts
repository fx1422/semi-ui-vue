import type { VNode, CSSProperties } from 'vue';
import type { PopoverProps } from '../popover/interface';
import type { InputProps } from '../input/interface';
import type { TreeNodeData } from '../tree/interface';

export type ValidateStatus = 'default' | 'error' | 'warning';
export type Size = 'small' | 'large' | 'default';
export type ExpandAction = false | 'click' | 'doubleClick';

export type RenderSelectedItemInSingle = (treeNode: TreeNodeData) => VNode;
export type RenderSelectedItemInMultiple = (
    treeNode: TreeNodeData,
    otherProps: { index: number | string; onClose: (tagContent: any, e: MouseEvent) => void }
) => {
    isRenderInTag: boolean;
    content: VNode;
};
export type RenderSelectedItem = RenderSelectedItemInSingle | RenderSelectedItemInMultiple;

export interface TriggerRenderProps {
    componentProps: TreeSelectProps;
    disabled: boolean;
    value: TreeNodeData[];
    inputValue: string;
    placeholder?: string;
    onSearch: (inputValue: string) => void;
    onChange: (inputValue: string) => void;
    onClear: (e: MouseEvent) => void;
    onRemove?: (key: string) => void;
}

export type OnChange = {
    (
        value: TreeNodeData['value'] | Array<TreeNodeData['value']>,
        node: TreeNodeData[] | TreeNodeData,
        e: MouseEvent
    ): void;
    (node: TreeNodeData[] | TreeNodeData, e: MouseEvent): void;
};

export interface TreeSelectProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    'aria-label'?: string;
    arrowIcon?: VNode;
    autoAdjustOverflow?: boolean;
    autoExpandParent?: boolean;
    autoMergeValue?: boolean;
    borderless?: boolean;
    checkRelation?: string;
    clickToHide?: boolean;
    clickTriggerToHide?: boolean;
    clearIcon?: VNode;
    className?: string;
    defaultExpandAll?: boolean;
    defaultExpandedKeys?: string[];
    defaultOpen?: boolean;
    defaultValue?: TreeNodeData['value'] | Array<TreeNodeData['value']> | TreeNodeData | TreeNodeData[];
    disabled?: boolean;
    disableStrictly?: boolean;
    dropdownClassName?: string;
    dropdownMatchSelectWidth?: boolean;
    dropdownMargin?: PopoverProps['margin'];
    dropdownStyle?: CSSProperties;
    emptyContent?: VNode | string;
    expandAction?: ExpandAction;
    expandAll?: boolean;
    expandIcon?: VNode | ((props: { onClick: (e: MouseEvent) => void; className: string; expanded: boolean }) => VNode);
    expandedKeys?: string[];
    filterTreeNode?: ((inputValue: string, treeNodeString: string, data?: TreeNodeData) => boolean) | boolean;
    getPopupContainer?: () => HTMLElement;
    insetLabel?: VNode | string;
    insetLabelId?: string;
    keyMaps?: {
        key?: string;
        value?: string;
        label?: string;
        children?: string;
    };
    labelEllipsis?: boolean;
    leafOnly?: boolean;
    loadData?: (data: TreeNodeData) => Promise<void>;
    loadedKeys?: string[];
    maxTagCount?: number;
    modelValue?: TreeNodeData['value'] | Array<TreeNodeData['value']> | TreeNodeData | TreeNodeData[];
    value?: TreeNodeData['value'] | Array<TreeNodeData['value']> | TreeNodeData | TreeNodeData[];
    motion?: boolean;
    motionExpand?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    multiple?: boolean;
    onChange?: OnChange;
    onChangeWithObject?: boolean;
    onClear?: (e: MouseEvent | KeyboardEvent) => void;
    onExpand?: (expandedKeys: Set<string>, expandedOtherProps: { expanded: boolean; node: TreeNodeData }) => void;
    onFocus?: (e: MouseEvent | FocusEvent) => void;
    onBlur?: (e: MouseEvent | FocusEvent) => void;
    onLoad?: (keys: Set<string>, data: TreeNodeData) => void;
    onSearch?: (sunInput: string, filteredExpandedKeys: string[], filteredNodes: TreeNodeData[]) => void;
    onSelect?: (selectedKey: string, selected: boolean, selectedNode: TreeNodeData) => void;
    onVisibleChange?: (isVisible: boolean) => void;
    optionListStyle?: CSSProperties;
    outerBottomSlot?: VNode;
    outerTopSlot?: VNode;
    placeholder?: string;
    position?: PopoverProps['position'];
    prefix?: VNode | string;
    preventScroll?: boolean;
    renderFullLabel?: (treeNode: TreeNodeData) => VNode;
    renderLabel?: (treeNode: TreeNodeData) => VNode;
    renderSelectedItem?: RenderSelectedItem;
    restTagsPopoverProps?: PopoverProps;
    searchAutoFocus?: boolean;
    searchPlaceholder?: string;
    searchPosition?: string;
    searchRender?: boolean | ((inputProps: InputProps) => VNode);
    showClear?: boolean;
    showFilteredOnly?: boolean;
    showLine?: boolean;
    showRestTagsPopover?: boolean;
    showSearchClear?: boolean;
    size?: Size;
    stopPropagation?: boolean | string;
    style?: CSSProperties;
    suffix?: VNode | string;
    triggerRender?: (props: TriggerRenderProps) => VNode;
    treeData?: TreeNodeData[];
    treeNodeFilterProp?: string;
    treeNodeLabelProp?: string;
    validateStatus?: ValidateStatus;
    virtualize?: {
        itemSize: number;
        height?: number | string;
        width?: number | string;
    };
    zIndex?: number;
}

export interface TreeSelectEmits {
    (
        e: 'update:modelValue',
        value: TreeNodeData['value'] | Array<TreeNodeData['value']> | TreeNodeData | TreeNodeData[]
    ): void;
    (
        e: 'update:value',
        value: TreeNodeData['value'] | Array<TreeNodeData['value']> | TreeNodeData | TreeNodeData[]
    ): void;
    (
        e: 'change',
        value: TreeNodeData['value'] | Array<TreeNodeData['value']>,
        node: TreeNodeData[] | TreeNodeData,
        event: MouseEvent
    ): void;
    (e: 'select', selectedKey: string, selected: boolean, selectedNode: TreeNodeData): void;
    (e: 'search', sunInput: string, filteredExpandedKeys: string[], filteredNodes: TreeNodeData[]): void;
    (e: 'focus', event: MouseEvent | FocusEvent): void;
    (e: 'blur', event: MouseEvent | FocusEvent): void;
    (e: 'visibleChange', isVisible: boolean): void;
    (e: 'expand', expandedKeys: Set<string>, expandedOtherProps: { expanded: boolean; node: TreeNodeData }): void;
    (e: 'load', keys: Set<string>, data: TreeNodeData): void;
    (e: 'clear', event: MouseEvent | KeyboardEvent): void;
}

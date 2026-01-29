import type { VNode, CSSProperties } from 'vue';
import type { PopoverProps } from '../popover/interface';

export type ValidateStatus = 'default' | 'error' | 'warning' | 'success';

export type CascaderType = 'small' | 'large' | 'default';
export type ShowNextType = 'click' | 'hover';

export interface CascaderData {
    value: string | number;
    label: VNode | string | number;
    disabled?: boolean;
    isLeaf?: boolean;
    loading?: boolean;
    children?: CascaderData[];
    [x: string]: any;
}

export interface Entity {
    _notExist?: boolean;
    children?: Array<Entity>;
    data: CascaderData;
    ind: number;
    key: string;
    level: number;
    parent?: Entity;
    parentKey?: string;
    path: Array<string>;
    pos: string;
    valuePath: Array<string>;
}

export interface Entities {
    [idx: string]: Entity;
}

export interface Data {
    data: CascaderData;
    disabled: boolean;
    key: string;
    searchText: VNode[];
    pathData?: CascaderData[];
}

export interface FilterRenderProps {
    className: string;
    inputValue: string;
    disabled: boolean;
    data: CascaderData[];
    checkStatus: {
        checked: boolean;
        halfChecked: boolean;
    };
    selected: boolean;
    onClick: (e: MouseEvent) => void;
    onCheck: (e: MouseEvent) => void;
}

export interface ScrollPanelProps {
    panelIndex: number;
    activeNode: CascaderData;
}

export interface TriggerRenderProps {
    componentProps: CascaderProps;
    disabled: boolean;
    value?: string | Set<string>;
    inputValue: string;
    placeholder?: string;
    onSearch: (inputValue: string) => void;
    onChange: (inputValue: string) => void;
    onClear: (e: MouseEvent) => void;
    onRemove?: (pos: string) => void;
}

export type SimpleValueType = string | number | CascaderData;
export type Value = SimpleValueType | Array<SimpleValueType> | Array<Array<SimpleValueType>>;

export interface CascaderProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    'aria-label'?: string;
    arrowIcon?: VNode;
    clearIcon?: VNode;
    expandIcon?: VNode;
    defaultValue?: Value;
    dropdownStyle?: CSSProperties;
    dropdownMargin?: PopoverProps['margin'];
    motion?: boolean;
    filterTreeNode?: ((inputValue: string, treeNodeString: string, data?: CascaderData) => boolean) | boolean;
    filterSorter?: (first: CascaderData, second: CascaderData, inputValue: string) => number;
    filterRender?: (props: FilterRenderProps) => VNode;
    treeData?: Array<CascaderData>;
    restTagsPopoverProps?: PopoverProps;
    children?: VNode;
    modelValue?: Value;
    value?: Value;
    prefix?: VNode | string;
    suffix?: VNode | string;
    id?: string;
    insetLabel?: VNode | string;
    insetLabelId?: string;
    style?: CSSProperties;
    bottomSlot?: VNode;
    topSlot?: VNode;
    triggerRender?: (props: TriggerRenderProps) => VNode;
    onListScroll?: (e: UIEvent, panel: ScrollPanelProps) => void;
    loadData?: (selectOptions: CascaderData[]) => Promise<void>;
    onLoad?: (newLoadedKeys: Set<string>, data: CascaderData) => void;
    onExceed?: (checkedItem: Entity[]) => void;
    displayRender?: (selected: Array<string> | Entity, idx?: number) => VNode;
    validateStatus?: ValidateStatus;
    position?: string;
    searchPosition?: string;
    borderless?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    separator?: string;
    changeOnSelect?: boolean;
    multiple?: boolean;
    autoMergeValue?: boolean;
    disabled?: boolean;
    dropdownClassName?: string;
    filterLeafOnly?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    size?: CascaderType;
    className?: string;
    treeNodeFilterProp?: string;
    displayProp?: string;
    maxTagCount?: number;
    max?: number;
    showRestTagsPopover?: boolean;
    zIndex?: number;
    showClear?: boolean;
    autoClearSearchValue?: boolean;
    defaultOpen?: boolean;
    autoAdjustOverflow?: boolean;
    stopPropagation?: boolean | string;
    onChangeWithObject?: boolean;
    showNext?: ShowNextType;
    disableStrictly?: boolean;
    leafOnly?: boolean;
    enableLeafClick?: boolean;
    preventScroll?: boolean;
    virtualizeInSearch?: {
        itemSize: number;
        height?: number | string;
        width?: number | string;
    };
    checkRelation?: string;
    getPopupContainer?: () => HTMLElement;
    emptyContent?: VNode | string;
}

export interface CascaderItemProps {
    onMouseDownInDropdown?: () => void;
    activeKeys: Set<string>;
    selectedKeys: Set<string>;
    loadedKeys: Set<string>;
    loadingKeys: Set<string>;
    onItemClick: (e: MouseEvent | KeyboardEvent, item: Entity | Data) => void;
    onItemHover: (e: MouseEvent, item: Entity) => void;
    showNext: ShowNextType;
    onItemCheckboxClick: (item: Entity | Data) => void;
    onListScroll: (e: UIEvent, ind: number) => void;
    searchable: boolean;
    keyword: string;
    empty: boolean;
    emptyContent?: VNode | string;
    loadData?: (selectOptions: CascaderData[]) => Promise<void>;
    data: Array<Data | Entity>;
    separator: string;
    multiple: boolean;
    checkedKeys: Set<string>;
    halfCheckedKeys: Set<string>;
    filterRender?: (props: FilterRenderProps) => VNode;
    virtualize?: {
        itemSize: number;
        height?: number | string;
        width?: number | string;
    };
    expandIcon?: VNode;
}

export interface CascaderEmits {
    (e: 'update:modelValue', value: Value): void;
    (e: 'update:value', value: Value): void;
    (e: 'change', value: Value): void;
    (e: 'select', selected: string | number | Array<string | number>): void;
    (e: 'search', input: string): void;
    (e: 'focus', event: FocusEvent | MouseEvent): void;
    (e: 'blur', event: FocusEvent | MouseEvent): void;
    (e: 'dropdownVisibleChange', visible: boolean): void;
    (e: 'listScroll', event: UIEvent, panel: ScrollPanelProps): void;
    (e: 'load', newLoadedKeys: Set<string>, data: CascaderData): void;
    (e: 'exceed', checkedItem: Entity[]): void;
    (e: 'clear'): void;
}

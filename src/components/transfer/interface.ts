import { VNode, CSSProperties, InjectionKey } from 'vue';
import { BasicDataItem, OnSortEndProps } from '@douyinfe/semi-foundation/transfer/foundation';
import { InputProps } from '../input/interface';
import { TreeProps } from '../tree/interface';

export type { BasicDataItem, OnSortEndProps };

export interface DataItem extends BasicDataItem {
    label?: VNode | string;
    style?: CSSProperties;
}

export interface GroupItem {
    title?: string;
    children?: Array<DataItem>;
}

export interface TreeItem extends DataItem {
    children: Array<TreeItem>;
}

export interface RenderSourceItemProps extends DataItem {
    checked: boolean;
    onChange?: () => void;
}

export interface RenderSelectedItemProps extends DataItem {
    onRemove?: () => void;
    sortableHandle?: any;
}

// 插槽名称常量
export const SLOT_NAMES = {
    SOURCE_ITEM: 'source-item',
    SELECTED_ITEM: 'selected-item',
    SOURCE_PANEL: 'source-panel',
    SELECTED_PANEL: 'selected-panel',
    SOURCE_HEADER: 'source-header',
    SELECTED_HEADER: 'selected-header',
} as const;

export interface EmptyContent {
    left?: VNode;
    right?: VNode;
    search?: VNode;
}

export type Type = 'list' | 'groupList' | 'treeList';

export interface SourcePanelProps {
    value: Array<string | number>;
    /* Loading */
    loading: boolean;
    /* Whether there are no items that match the current search value */
    noMatch: boolean;
    /* Items that match the current search value */
    filterData: Array<DataItem>;
    /* All items */
    sourceData: Array<DataItem>;
    /* transfer props' dataSource */
    propsDataSource: DataSource;
    /* Whether to select all */
    allChecked: boolean;
    /* Number of filtered results */
    showNumber: number;
    /* Input search box value */
    inputValue: string;
    /* The function that should be called when the search box changes */
    onSearch: (searchString: string) => void;
    /* The function that should be called when all the buttons on the left are clicked */
    onAllClick: () => void;
    /* Selected item on the left */
    selectedItems: Map<string | number, DataItem>;
    /* The function that should be called when selecting or deleting a single option */
    onSelectOrRemove: (item: DataItem) => void;
    /* The function that should be called when selecting an option, */
    onSelect: (value: Array<string | number>) => void;
}

export type OnSortEnd = ({ oldIndex, newIndex }: OnSortEndProps) => void;

export interface SelectedPanelProps {
    /* Number of selected options */
    length: number;
    /* Collection of all selected options */
    selectedData: Array<DataItem>;
    /* Callback function that should be called when click to clear */
    onClear: () => void;
    /* The function that should be called when a single option is deleted */
    onRemove: (item: DataItem) => void;
    /* The function that should be called when reordering the results */
    onSortEnd: OnSortEnd;
}

export interface ResolvedDataItem extends DataItem {
    _parent?: {
        title: string;
    };
    _optionKey?: string | number;
}

export interface DraggableResolvedDataItem {
    key?: string | number;
    index?: number;
    item?: ResolvedDataItem;
}

export type DataSource = Array<DataItem> | Array<GroupItem> | Array<TreeItem>;

export interface HeaderConfig {
    totalContent: string;
    allContent: string;
    onAllClick: () => void;
    type: string;
    showButton: boolean;
    num: number;
    allChecked?: boolean;
}

export type SourceHeaderProps = {
    num: number;
    showButton: boolean;
    allChecked: boolean;
    onAllClick: () => void;
};

export type SelectedHeaderProps = {
    num: number;
    showButton: boolean;
    onClear: () => void;
};

export interface TransferState {
    data: Array<ResolvedDataItem>;
    selectedItems: Map<number | string, ResolvedDataItem>;
    searchResult: Set<number | string>;
    inputValue: string;
}

export interface TransferProps {
    style?: CSSProperties;
    className?: string;
    disabled?: boolean;
    dataSource?: DataSource;
    filter?: boolean | ((sugInput: string, item: DataItem) => boolean);
    defaultValue?: Array<string | number>;
    value?: Array<string | number>;
    inputProps?: InputProps;
    type?: Type;
    emptyContent?: EmptyContent;
    draggable?: boolean;
    treeProps?: Omit<TreeProps, 'value' | 'ref' | 'onChange'>;
    showPath?: boolean;
    loading?: boolean;
    onChange?: (values: Array<string | number>, items: Array<DataItem>) => void;
    onSelect?: (item: DataItem) => void;
    onDeselect?: (item: DataItem) => void;
    onSearch?: (sunInput: string) => void;
    renderSourceItem?: (item: RenderSourceItemProps) => VNode;
    renderSelectedItem?: (item: RenderSelectedItemProps) => VNode;
    renderSourcePanel?: (sourcePanelProps: SourcePanelProps) => VNode;
    renderSelectedPanel?: (selectedPanelProps: SelectedPanelProps) => VNode;
    renderSourceHeader?: (headProps: SourceHeaderProps) => VNode;
    renderSelectedHeader?: (headProps: SelectedHeaderProps) => VNode;
}

export interface TransferContext {
    state: { value: TransferState };
    transferProps: TransferProps;
    foundation: any;
    methods: {
        handleInputChange: (value: string) => void;
        handleSelectOrRemove: (item: ResolvedDataItem) => void;
        handleSortEnd: (callbackProps: { oldIndex: number; newIndex: number }) => void;
    };
    treeRef: any;
    slots: any;
}

export const TransferContextKey: InjectionKey<TransferContext> = Symbol('TransferContext');

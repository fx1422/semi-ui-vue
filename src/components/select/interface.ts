import type { VNode, CSSProperties } from 'vue';
import type { PopoverProps } from '../popover/interface';
import type { InputProps } from '../input/interface';

export type SelectSize = 'small' | 'large' | 'default';
export type Position =
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'left'
    | 'leftTop'
    | 'leftBottom'
    | 'right'
    | 'rightTop'
    | 'rightBottom'
    | 'bottom'
    | 'bottomLeft'
    | 'bottomRight';

export interface OptionProps {
    value?: string | number;
    label?: string | number | VNode;
    children?: VNode | string;
    disabled?: boolean;
    showTick?: boolean;
    className?: string;
    style?: CSSProperties;
    _show?: boolean;
    _selected?: boolean;
    _scrollIndex?: number;
    _keyInJsx?: string | number;
    _parentGroup?: OptionGroupProps;
    _inputCreateOnly?: boolean;
    _keyInOptionList?: string | number;
}

export interface OptionGroupProps {
    children?: VNode | OptionProps[];
    label?: VNode | string | number;
    className?: string;
    style?: CSSProperties;
    _show?: boolean;
}

export interface SelectedItemProps {
    value: OptionProps['value'];
    label: OptionProps['label'];
    _show?: boolean;
    _selected: boolean;
    _scrollIndex?: number;
}

export interface TriggerRenderProps {
    value: SelectedItemProps[];
    inputValue: string;
    onSearch: (inputValue: string) => void;
    onClear: () => void;
    onRemove: (option: OptionProps) => void;
    disabled: boolean;
    placeholder: string;
    componentProps: Record<string, any>;
}

export interface optionRenderProps {
    key?: any;
    label?: VNode | string;
    value?: string | number;
    style?: CSSProperties;
    className?: string;
    selected?: boolean;
    focused?: boolean;
    show?: boolean;
    disabled?: boolean;
    onMouseEnter?: (e: MouseEvent) => any;
    onClick?: (e: MouseEvent) => any;
    _inputCreateOnly?: boolean;
    _keyInOptionList?: string | number;
    [x: string]: any;
}

export interface virtualListProps {
    itemSize?: number;
    height?: number;
    width?: string | number;
}

export type RenderSingleSelectedItemFn = (optionNode: Record<string, any>) => VNode;
export type RenderMultipleSelectedItemFn = (
    optionNode: Record<string, any>,
    multipleProps: {
        index: number;
        disabled: boolean;
        onClose: (tagContent: VNode | string, e: MouseEvent) => void;
    }
) => { isRenderInTag: boolean; content: VNode };

export type RenderSelectedItemFn = RenderSingleSelectedItemFn | RenderMultipleSelectedItemFn;

export type SelectValue = string | number | any[] | Record<string, any>;

export interface SelectProps {
    // ARIA
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;

    id?: string;
    name?: string;
    autoFocus?: boolean;
    autoClearSearchValue?: boolean;
    arrowIcon?: VNode;
    borderless?: boolean;
    clearIcon?: VNode;
    defaultValue?: SelectValue;
    value?: SelectValue;
    placeholder?: VNode | string;
    multiple?: boolean;
    filter?: boolean | ((inputValue: string, option: OptionProps) => boolean);
    max?: number;
    maxTagCount?: number;
    maxHeight?: string | number;
    style?: CSSProperties;
    className?: string;
    size?: SelectSize;
    disabled?: boolean;
    emptyContent?: VNode | string;
    expandRestTagsOnClick?: boolean;
    zIndex?: number;
    position?: Position;
    dropdownClassName?: string;
    dropdownStyle?: CSSProperties;
    dropdownMargin?: PopoverProps['margin'];
    ellipsisTrigger?: boolean;

    optionList?: OptionProps[];
    dropdownMatchSelectWidth?: boolean;
    loading?: boolean;
    defaultOpen?: boolean;
    validateStatus?: 'default' | 'error' | 'warning' | 'success';
    defaultActiveFirstOption?: boolean;
    onChangeWithObject?: boolean;

    searchPosition?: string;
    searchPlaceholder?: string;
    insetLabel?: VNode | string;
    insetLabelId?: string;
    inputProps?: Omit<InputProps, 'value' | 'onFocus' | 'onChange'>;
    showClear?: boolean;
    showArrow?: boolean;

    // Render functions
    renderSelectedItem?: RenderSelectedItemFn;
    renderCreateItem?: (inputValue: OptionProps['value'], focus: boolean, style?: CSSProperties) => VNode;
    renderOptionItem?: (props: optionRenderProps) => VNode;

    clickToHide?: boolean;
    remote?: boolean;
    allowCreate?: boolean;
    triggerRender?: (props: TriggerRenderProps) => VNode;
    virtualize?: virtualListProps;
    preventScroll?: boolean;
    showRestTagsPopover?: boolean;
    restTagsPopoverProps?: PopoverProps;

    spacing?: number | { x: number; y: number };
    getPopupContainer?: () => HTMLElement;
    motion?: boolean;
    autoAdjustOverflow?: boolean;
    mouseLeaveDelay?: number;
    mouseEnterDelay?: number;
    stopPropagation?: boolean;

    children?: VNode;
}

export interface SelectEmits {
    (e: 'update:value', value: SelectValue): void;
    (e: 'change', value: SelectValue): void;
    (e: 'dropdownVisibleChange', visible: boolean): void;
    (e: 'search', value: string, event: KeyboardEvent | MouseEvent): void;
    (e: 'mouseEnter', event: MouseEvent): void;
    (e: 'mouseLeave', event: MouseEvent): void;
    (e: 'exceed', option: OptionProps): void;
    (e: 'create', option: OptionProps): void;
    (e: 'deselect', value: SelectValue, option: Record<string, any>): void;
    (e: 'select', value: SelectValue, option: Record<string, any>): void;
    (e: 'clear'): void;
    (e: 'focus', event: FocusEvent): void;
    (e: 'blur', event: FocusEvent): void;
    (e: 'listScroll', event: Event): void;
}

export interface SelectMethods {
    clearInput: () => void;
    selectAll: () => void;
    deselectAll: () => void;
    focus: () => void;
    close: () => void;
    open: () => void;
}

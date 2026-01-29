import type { CSSProperties, VNode, Component } from 'vue';
import type { Position } from '../tooltip/interface';

export interface DataItem {
    [x: string]: any;
    value?: string | number;
    label?: any; // VNode or string
}

export interface BaseDataItem extends DataItem {
    label?: VNode | string;
}

export type AutoCompleteItems = BaseDataItem | string | number;

export interface StateOptionItem extends DataItem {
    show?: boolean;
    key?: string | number;
}

export interface AutoCompleteProps<T extends AutoCompleteItems = AutoCompleteItems> {
    ariaDescribedby?: string;
    ariaErrormessage?: string;
    ariaInvalid?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaRequired?: boolean;
    autoAdjustOverflow?: boolean;
    autoFocus?: boolean;
    className?: string;
    clearIcon?: VNode | Component;
    data?: T[];
    disabled?: boolean;
    defaultOpen?: boolean;
    defaultValue?: T;
    defaultActiveFirstOption?: boolean;
    dropdownMatchSelectWidth?: boolean;
    dropdownClassName?: string;
    dropdownStyle?: CSSProperties;
    emptyContent?: VNode | string;
    getPopupContainer?: () => HTMLElement;
    insetLabel?: VNode | string;
    insetLabelId?: string;
    id?: string;
    loading?: boolean;
    motion?: boolean;
    maxHeight?: string | number;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    prefix?: VNode | string;
    placeholder?: string;
    position?: Position;
    renderItem?: (option: T) => VNode | string;
    renderSelectedItem?: (option: T) => string;
    size?: 'small' | 'default' | 'large';
    style?: CSSProperties;
    suffix?: VNode | string;
    showClear?: boolean;
    triggerRender?: (props?: any) => VNode | string;
    stopPropagation?: boolean | string;
    value?: string | number;
    validateStatus?: 'default' | 'error' | 'warning';
    zIndex?: number;
    onChangeWithObject?: boolean;
    onSelectWithObject?: boolean;
}

export interface OptionProps {
    [x: string]: any;
    value?: string | number;
    label?: string | number | VNode | string;
    children?: VNode | string;
    disabled?: boolean;
    showTick?: boolean;
    className?: string;
    style?: CSSProperties;
    selected?: boolean;
    focused?: boolean;
    empty?: boolean;
    emptyContent?: VNode | string;
    onSelect?: (option: any, event: MouseEvent) => void;
    onMouseEnter?: (event: MouseEvent) => void;
    prefixCls?: string;
    renderOptionItem?: (option: any) => VNode | string;
    inputValue?: string;
}

import { VNode, CSSProperties } from 'vue';
import { PopoverProps } from '../popover/interface';
import { ShowTooltip } from '../typography/interface';

export type Size = 'large' | 'default' | 'small';
export type ValidateStatus = 'default' | 'error' | 'warning';
export type RestTagsPopoverProps = PopoverProps;

export interface TagInputProps {
    className?: string;
    clearIcon?: VNode | string;
    defaultValue?: string[];
    disabled?: boolean;
    inputValue?: string;
    maxLength?: number;
    max?: number;
    maxTagCount?: number;
    showRestTagsPopover?: boolean;
    restTagsPopoverProps?: RestTagsPopoverProps;
    showContentTooltip?: boolean | ShowTooltip;
    allowDuplicates?: boolean;
    addOnBlur?: boolean;
    draggable?: boolean;
    expandRestTagsOnClick?: boolean;
    onAdd?: (addedValue: string[]) => void;
    onBlur?: (e: FocusEvent) => void;
    onChange?: (value: string[]) => void;
    onExceed?: (value: string[]) => void;
    onFocus?: (e: FocusEvent) => void;
    onInputChange?: (value: string, e: Event) => void;
    onInputExceed?: (value: string) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onRemove?: (removedValue: string, idx: number) => void;
    placeholder?: string;
    insetLabel?: VNode | string;
    insetLabelId?: string;
    prefix?: VNode | string;
    renderTagItem?: (value: string, index: number, onClose: () => void) => VNode;
    separator?: string | string[] | null;
    showClear?: boolean;
    size?: Size;
    style?: CSSProperties;
    suffix?: VNode | string;
    validateStatus?: ValidateStatus;
    value?: string[];
    autoFocus?: boolean;
    'aria-label'?: string;
    preventScroll?: boolean;
}

export interface TagInputState {
    tagsArray?: string[];
    inputValue?: string;
    focusing?: boolean;
    hovering?: boolean;
    active?: boolean;
    entering?: boolean;
}

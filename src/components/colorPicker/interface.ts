import type { ColorValue } from '@douyinfe/semi-foundation/colorPicker/foundation';
import type { PopoverProps } from '../popover/interface';

export interface ColorPickerProps {
    eyeDropper?: boolean;
    defaultValue?: ColorValue;
    value?: ColorValue;
    onChange?: (value: ColorValue) => void;
    alpha?: boolean;
    width?: number;
    height?: number;
    defaultFormat?: 'hex' | 'rgba' | 'hsva';
    usePopover?: boolean;
    popoverProps?: PopoverProps;
    className?: string;
    style?: Record<string, any>;
}

export type { ColorValue };

export * from '@douyinfe/semi-foundation/colorPicker/interface';

import type { CSSProperties } from 'vue';

export interface Marks {
    [key: number]: string;
}

export type TipFormatterBasicType = string | number | boolean | null;

export interface HandleDotConfig {
    size?: string;
    color?: string;
}

export interface SliderProps {
    disabled?: boolean;
    showMarkLabel?: boolean;
    included?: boolean;
    marks?: Marks;
    max?: number;
    min?: number;
    modelValue?: number | number[];
    range?: boolean;
    step?: number;
    tipFormatter?: ((value: TipFormatterBasicType | TipFormatterBasicType[]) => any) | null;
    value?: number | number[];
    vertical?: boolean;
    tooltipOnMark?: boolean;
    tooltipVisible?: boolean;
    showArrow?: boolean;
    style?: CSSProperties;
    className?: string;
    showBoundary?: boolean;
    railStyle?: CSSProperties;
    verticalReverse?: boolean;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-valuetext'?: string;
    getAriaValueText?: (value: number, index?: number) => string;
    handleDot?: HandleDotConfig | HandleDotConfig[];
}

export interface SliderState {
    currentValue: number | number[];
    min: number;
    max: number;
    focusPos: 'min' | 'max' | '';
    disabled: boolean;
    chooseMovePos: 'min' | 'max' | '';
    isDrag: boolean;
    clickValue: number;
    showBoundary: boolean;
    isInRenderTree: boolean;
    firstDotFocusVisible: boolean;
    secondDotFocusVisible: boolean;
}

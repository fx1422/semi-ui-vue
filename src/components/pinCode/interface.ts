import type { InputProps } from '../input/interface';

export interface PinCodeProps {
    value?: string;
    format?: 'number' | 'mixed' | RegExp | ((char: string) => boolean);
    onChange?: (value: string) => void;
    defaultValue?: string;
    count?: number;
    className?: string;
    style?: Record<string, any>;
    autoFocus?: boolean;
    onComplete?: (value: string) => void;
    disabled?: boolean;
    size?: InputProps['size'];
}

export interface PinCodeState {
    valueList: string[];
    currentActiveIndex: number;
}

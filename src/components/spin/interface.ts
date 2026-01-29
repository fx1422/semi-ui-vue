import { CSSProperties, VNode } from 'vue';

export type SpinSize = 'small' | 'large' | 'middle';

export interface SpinProps {
    size?: SpinSize;
    spinning?: boolean;
    indicator?: VNode | string;
    delay?: number;
    tip?: VNode | string;
    wrapperClassName?: string;
    style?: CSSProperties;
    childStyle?: CSSProperties;
    children?: VNode | string;
}

import { CSSProperties, VNode } from 'vue';

export interface SVGNode {
    id?: string;
    viewBox?: string;
    url?: string;
}

export type EmptyLayout = 'vertical' | 'horizontal';

export interface EmptyProps {
    layout?: EmptyLayout;
    imageStyle?: CSSProperties;
    title?: VNode | string;
    description?: VNode | string;
    image?: VNode | SVGNode | string;
    darkModeImage?: VNode | SVGNode | string;
    style?: CSSProperties;
    className?: string;
}

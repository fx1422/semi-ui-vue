import type { CSSProperties } from 'vue';

export interface BackTopProps {
    target?: () => HTMLElement | Window;
    visibilityHeight?: number;
    duration?: number;
    style?: CSSProperties;
    className?: string;
}

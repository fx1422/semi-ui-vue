import { CSSProperties } from 'vue';

export interface CollapsibleProps {
    motion?: boolean;
    isOpen?: boolean;
    duration?: number;
    keepDOM?: boolean;
    lazyRender?: boolean;
    className?: string;
    style?: CSSProperties;
    collapseHeight?: number;
    reCalcKey?: number | string;
    id?: string;
    fade?: boolean;
    onMotionEnd?: () => void;
}

export interface CollapsibleState {
    domInRenderTree: boolean;
    domHeight: number;
    visible: boolean;
    isTransitioning: boolean;
    cacheIsOpen: boolean;
}

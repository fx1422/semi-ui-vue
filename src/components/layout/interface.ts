import { CSSProperties } from 'vue';

export interface BasicProps {
    prefixCls?: string;
    style?: CSSProperties;
    className?: string;
    tagName?: keyof HTMLElementTagNameMap;
    type?: string;
}

export interface LayoutProps {
    prefixCls?: string;
    style?: CSSProperties;
    className?: string;
    hasSider?: boolean;
    tagName?: keyof HTMLElementTagNameMap;
}

export interface ResponsiveMap {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
}

export interface SiderProps {
    prefixCls?: string;
    style?: CSSProperties;
    className?: string;
    breakpoint?: Array<keyof ResponsiveMap>;
    'aria-label'?: string;
    role?: string;
}

export interface ContextType {
    siderHook: {
        addSider: (id: string) => void;
        removeSider: (id: string) => void;
    };
}

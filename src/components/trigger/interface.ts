import type { VNode, CSSProperties } from 'vue';

export interface TriggerProps {
    triggerRender?: (props?: any) => VNode;
    componentName?: string;
    componentProps?: Record<string, any>;
    value?: any;
    inputValue?: string;
    placeholder?: string | string[];
    className?: string;
    style?: CSSProperties;
    [x: string]: any;
}

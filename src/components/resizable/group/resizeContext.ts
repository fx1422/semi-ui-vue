import { inject, provide, type Ref } from 'vue';
import type { ResizeCallback, ResizeEventType, ResizeStartCallback } from '@douyinfe/semi-foundation/resizable/types';

export interface ResizeContextProps {
    direction: 'horizontal' | 'vertical';
    registerItem: (
        ref: Ref<HTMLDivElement | undefined>,
        min: string,
        max: string,
        defaultSize: string | number,
        onResizeStart: ResizeStartCallback,
        onChange: ResizeCallback,
        onResizeEnd: ResizeCallback
    ) => number;
    registerHandler: (ref: Ref<HTMLDivElement | undefined>) => number;
    notifyResizeStart: (handlerIndex: number, e: MouseEvent | Touch, type: ResizeEventType) => void;
    getGroupSize: () => number;
}

const RESIZE_CONTEXT_KEY = Symbol('ResizeContext');

export function provideResizeContext(context: ResizeContextProps) {
    provide(RESIZE_CONTEXT_KEY, context);
}

export function useResizeContext(): ResizeContextProps | undefined {
    return inject<ResizeContextProps>(RESIZE_CONTEXT_KEY);
}

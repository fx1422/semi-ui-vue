/** A parallel type to `ResizeObserverEntry` (from resize-observer-polyfill). */
export interface ResizeEntry {
    contentRect: DOMRectReadOnly;
    target: Element;
}

export enum ObserverProperty {
    Width = 'width',
    Height = 'height',
    All = 'all',
}

export interface ReactResizeObserverProps {
    onResize?: (entries: ResizeEntry[]) => void;
    observeParent?: boolean;
    observerProperty?: ObserverProperty;
    delayTick?: number;
}

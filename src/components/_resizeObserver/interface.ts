export interface ResizeEntry {
    contentRect: DOMRectReadOnly;
    target: Element;
}

export enum ObserverProperty {
    Width = 'width',
    Height = 'height',
    All = 'all',
}

export interface ResizeObserverProps {
    onResize?: (entries: ResizeEntry[]) => void;
    observeParent?: boolean;
    observerProperty?: ObserverProperty | 'width' | 'height' | 'all';
    delayTick?: number;
}

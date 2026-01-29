import { VNode, CSSProperties } from 'vue';
import { RatioType } from '@douyinfe/semi-foundation/image/previewInnerFoundation';

export type { RatioType };

export type ImageLoadStatus = 'loading' | 'success' | 'error';

export interface ImageStates {
    src: string;
    loadStatus: ImageLoadStatus;
    previewVisible: boolean;
}

export interface ImageProps {
    src?: string;
    width?: string | number;
    height?: string | number;
    alt?: string;
    placeholder?: VNode;
    fallback?: string | VNode;
    preview?: boolean | PreviewProps;
    onError?: (event: Event) => void;
    onLoad?: (event: Event) => void;
    onClick?: (event: any) => void;
    crossOrigin?: 'anonymous' | 'use-credentials';
    children?: VNode;
    imageID?: number;
    setDownloadName?: (src: string) => string;
    imgStyle?: CSSProperties;
    imgCls?: string;
    className?: string;
    style?: CSSProperties;
    id?: string;
    [key: string]: any; // For other HTML attributes
}

export interface PreviewProps {
    visible?: boolean;
    src?: string | string[];
    previewTitle?: VNode | string;
    currentIndex?: number;
    defaultCurrentIndex?: number;
    defaultVisible?: boolean;
    maskClosable?: boolean;
    closable?: boolean;
    zoomStep?: number;
    infinite?: boolean;
    showTooltip?: boolean;
    closeOnEsc?: boolean;
    prevTip?: string;
    nextTip?: string;
    zoomInTip?: string;
    zoomOutTip?: string;
    rotateTip?: string;
    downloadTip?: string;
    adaptiveTip?: string;
    originTip?: string;
    lazyLoad?: boolean;
    lazyLoadMargin?: string;
    preLoad?: boolean;
    preLoadGap?: number;
    viewerVisibleDelay?: number;
    disableDownload?: boolean;
    zIndex?: number;
    children?: VNode;
    crossOrigin?: 'anonymous' | 'use-credentials';
    maxZoom?: number;
    minZoom?: number;
    previewCls?: string;
    previewStyle?: CSSProperties;
    renderLeftIcon?: VNode | ((index: number) => VNode);
    renderRightIcon?: VNode | ((index: number) => VNode);
    renderCloseIcon?: VNode | (() => VNode);
    renderHeader?: (info: any) => VNode;
    renderPreviewMenu?: (props: MenuProps) => VNode;
    getPopupContainer?: () => HTMLElement;
    onVisibleChange?: (visible: boolean) => void;
    onChange?: (index: number) => void;
    onClose?: () => void;
    onZoomIn?: (zoom: number) => void;
    onZoomOut?: (zoom: number) => void;
    onPrev?: (index: number) => void;
    onNext?: (index: number) => void;
    onRatioChange?: (type: RatioType) => void;
    onRotateLeft?: (angle: number) => void;
    onDownload?: (src: string, index: number) => void;
    onDownloadError?: (src: string) => void;
    setDownloadName?: (src: string) => string;
    className?: string;
    style?: CSSProperties;
}

export interface PreviewInnerProps extends Omit<PreviewProps, 'previewCls' | 'previewStyle'> {}

export interface MenuProps {
    min?: number;
    max?: number;
    step?: number;
    curPage?: number;
    totalNum?: number;
    zoom?: number;
    ratio?: RatioType;
    disabledPrev?: boolean;
    disabledNext?: boolean;
    disableDownload?: boolean;
    disableZoomIn?: boolean;
    disableZoomOut?: boolean;
    onDownload?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onRatioClick?: () => void;
    onRotateLeft?: () => void;
    onRotateRight?: () => void;
    menuItems?: VNode[];
}

export interface PreviewInnerStates {
    imgSrc?: string[];
    imgLoadStatus?: Map<string, boolean>;
    zoom?: number;
    rotation?: number;
    ratio?: RatioType;
    currentIndex?: number;
    viewerVisible?: boolean;
    visible?: boolean;
    preloadAfterVisibleChange?: boolean;
    direction?: string;
}

export interface PreviewContextProps {
    isGroup: boolean;
    lazyLoad: boolean;
    previewSrc: string[];
    titles: VNode[];
    currentIndex: number;
    visible: boolean;
    previewObserver: IntersectionObserver | null;
    setCurrentIndex: (current: number) => void;
    handleVisibleChange: (visible: boolean, preVisible?: boolean) => void;
    setDownloadName?: (src: string) => string;
}

export interface PreviewImageProps {
    src?: string;
    rotation?: number;
    style?: CSSProperties;
    zoom?: number;
    ratio?: RatioType;
    disableDownload?: boolean;
    clickZoom?: number;
    crossOrigin?: 'anonymous' | 'use-credentials';
    setRatio?: (type: RatioType) => void;
    onZoom?: (zoom: number, notify?: boolean) => void;
    onLoad?: (src: string) => void;
    onError?: (src: string) => void;
}

export interface ImageTranslate {
    x: number;
    y: number;
}

export interface PreviewImageStates {
    loading: boolean;
    width: number;
    height: number;
    translate: ImageTranslate;
    currZoom: number;
}

export interface DragDirection {
    canDragVertical: boolean;
    canDragHorizontal: boolean;
}

export interface ExtremeBounds {
    left: number;
    top: number;
}

export interface PreviewState {
    currentIndex: number;
    visible: boolean;
}

export interface HeaderProps {
    closable: boolean;
    renderHeader?: (info: any) => VNode;
    title?: string;
    titleStyle?: CSSProperties;
    className?: string;
    onClose?: (e: MouseEvent) => void;
    renderCloseIcon?: VNode | (() => VNode);
}

export interface SliderProps {
    max?: number;
    min?: number;
    step?: number;
}

export interface FooterProps extends SliderProps {
    curPage?: number;
    totalNum?: number;
    disabledPrev?: boolean;
    disabledNext?: boolean;
    disableDownload?: boolean;
    className?: string;
    zoom?: number;
    ratio?: RatioType;
    prevTip?: string;
    nextTip?: string;
    zoomInTip?: string;
    zoomOutTip?: string;
    rotateTip?: string;
    downloadTip?: string;
    adaptiveTip?: string;
    originTip?: string;
    showTooltip?: boolean;
    zIndex?: number;
    onZoomIn?: (zoom: number) => void;
    onZoomOut?: (zoom: number) => void;
    onPrev?: () => void;
    onNext?: () => void;
    onAdjustRatio?: (type: RatioType) => void;
    onRotate?: (direction: string) => void;
    onDownload?: () => void;
    renderPreviewMenu?: (props: MenuProps) => VNode;
}

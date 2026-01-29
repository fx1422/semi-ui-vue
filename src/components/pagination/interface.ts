import type { VNode, CSSProperties } from 'vue';
import type { Position } from '../tooltip/interface';

export type PopoverPosition = Position;

export interface PaginationProps {
    total?: number;
    showTotal?: boolean;
    pageSize?: number;
    pageSizeOpts?: Array<number>;
    size?: 'small' | 'default';
    currentPage?: number;
    defaultCurrentPage?: number;
    prevText?: VNode | string;
    nextText?: VNode | string;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    popoverZIndex?: number;
    popoverPosition?: PopoverPosition;
    style?: CSSProperties;
    className?: string;
    hideOnSinglePage?: boolean;
    hoverShowPageSelect?: boolean;
    disabled?: boolean;
}

export interface PaginationEvents {
    onPageChange?: (currentPage: number) => void;
    onPageSizeChange?: (newPageSize: number) => void;
    onChange?: (currentPage: number, pageSize: number) => void;
}

export type PageRenderText = number | '...';
export type PageList = PageRenderText[];

export interface PaginationLocale {
    total: string;
    pageSize: string;
    jumpTo: string;
    page: string;
}

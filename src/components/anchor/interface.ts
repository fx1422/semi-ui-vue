import type { CSSProperties, VNode } from 'vue';
import type { ShowTooltip } from '../typography/interface';

export type Position = 'left' | 'right';

export interface AnchorProps {
    autoCollapse?: boolean;
    className?: string;
    defaultAnchor?: string;
    getContainer?: () => HTMLElement | Window;
    maxHeight?: string | number;
    maxWidth?: string | number;
    offsetTop?: number;
    position?: Position;
    railTheme?: 'primary' | 'muted' | 'tertiary';
    scrollMotion?: boolean;
    showTooltip?: boolean | ShowTooltip;
    size?: 'default' | 'small';
    style?: CSSProperties;
    targetOffset?: number;
    'aria-label'?: string;
}

export interface AnchorEmits {
    (e: 'change', currentLink: string, previousLink: string): void;
    (e: 'click', event: MouseEvent, currentLink: string): void;
}

export interface LinkProps {
    href?: string;
    title?: string | VNode;
    className?: string;
    style?: CSSProperties;
    disabled?: boolean;
    level?: number;
    direction?: 'ltr' | 'rtl';
}

export interface AnchorContextType {
    activeLink: string;
    showTooltip: boolean | ShowTooltip;
    position?: Position;
    childMap: Record<string, Set<string>>;
    autoCollapse: boolean;
    size?: 'default' | 'small';
    onClick: (e: MouseEvent | KeyboardEvent, link: string) => void;
    addLink: (link: string) => void;
    removeLink: (link: string) => void;
}

export interface AnchorState {
    activeLink: string;
    links: string[];
    clickLink: boolean;
    scrollHeight: string;
    slideBarTop: string;
}

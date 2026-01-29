import { CSSProperties, VNode } from 'vue';

export type Shadows = 'hover' | 'always';

export interface CardProps {
    /** Operation group at the bottom of the card content area */
    actions?: VNode[];
    /** Card content area inline style */
    bodyStyle?: CSSProperties;
    /** Whether there is an outer border */
    bordered?: boolean;
    /** Style class name */
    className?: string;
    /** Cover */
    cover?: VNode;
    /** Additional additions to the right of the title */
    headerExtraContent?: VNode;
    /** Custom end of page */
    footer?: VNode;
    /** Whether there is an edge between the bottom of the page and the content area */
    footerLine?: boolean;
    /** Inline style at the end of the page */
    footerStyle?: CSSProperties;
    /** Custom head */
    header?: VNode;
    /** Whether there is an edge line between the head and the content area */
    headerLine?: boolean;
    /** Head inline style */
    headerStyle?: CSSProperties;
    /** Whether to preload */
    loading?: boolean;
    /** Set shadow */
    shadows?: Shadows;
    /** Card inline style */
    style?: CSSProperties;
    /** Title */
    title?: VNode | string;
    /** aria label */
    'aria-label'?: string;
}

export interface MetaProps {
    /** Avatar */
    avatar?: VNode;
    /** Style class name */
    className?: string;
    /** Description */
    description?: VNode | string;
    /** Card inline style */
    style?: CSSProperties;
    /** Title */
    title?: VNode | string;
}

export interface CardGroupProps {
    /** Style class name */
    className?: string;
    /** Card inline style */
    style?: CSSProperties;
    /** Set shadow */
    shadows?: Shadows;
    /** Card group type */
    type?: 'grid';
    /** Spacing between cards */
    spacing?: number | [number, number];
}

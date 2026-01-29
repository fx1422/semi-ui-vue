import type { CSSProperties, VNode } from 'vue';
import type { PopoverProps } from '../popover/interface';
import type { TooltipProps } from '../tooltip/interface';

export type EllipsisPos = 'end' | 'middle';

export type ShowTooltip = {
    type?: string;
    opts?: Partial<PopoverProps> & Partial<TooltipProps>;
    renderTooltip?: (content: any, children: VNode) => VNode;
};

export type Ellipsis = {
    collapseText?: string;
    collapsible?: boolean;
    expandText?: string;
    expandable?: boolean;
    pos?: EllipsisPos;
    rows?: number;
    showTooltip?: boolean | ShowTooltip;
    suffix?: string;
    onExpand?: (expanded: boolean, event: MouseEvent) => void;
};

export type TypographyBaseType = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'warning' | 'danger' | 'success';
export type TypographyBaseSize = 'normal' | 'small' | 'inherit';
export type TypographyBaseSpacing = 'normal' | 'extended';
export type TitleHeading = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'default' | number;

export type LinkType =
    | {
          href?: string;
          target?: string;
          rel?: string;
      }
    | boolean;

export interface CopyableConfig {
    content?: string;
    copyTip?: any;
    successTip?: any;
    icon?: any;
    onCopy?: (e: MouseEvent, content: string, res: boolean) => void;
    render?: (copied: boolean, doCopy: (e: MouseEvent) => void, configs: CopyableConfig) => VNode;
}

export interface BaseTypographyProps {
    className?: string;
    code?: boolean;
    component?: string;
    copyable?: CopyableConfig | boolean;
    delete?: boolean;
    disabled?: boolean;
    ellipsis?: Ellipsis | boolean;
    icon?: any;
    link?: LinkType;
    mark?: boolean;
    strong?: boolean;
    style?: CSSProperties;
    type?: TypographyBaseType;
    underline?: boolean;
}

export interface TextProps extends BaseTypographyProps {
    size?: TypographyBaseSize;
    weight?: TitleWeight;
    ellipsis?: Ellipsis | boolean;
    copyable?: CopyableConfig | boolean;
}

export interface TitleProps extends BaseTypographyProps {
    heading?: TitleHeading;
    weight?: TitleWeight;
    copyable?: CopyableConfig | boolean;
}

export interface ParagraphProps extends BaseTypographyProps {
    size?: TypographyBaseSize;
    spacing?: TypographyBaseSpacing;
    copyable?: CopyableConfig | boolean;
}

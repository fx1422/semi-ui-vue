import type { VNode, CSSProperties } from 'vue';

export type Direction = 'horizontal' | 'vertical';
export type Status = 'wait' | 'process' | 'finish' | 'error' | 'warning';
export type Size = 'default' | 'small';
export type StepsType = 'fill' | 'basic' | 'nav';

// Context type
export interface StepsContextValue {
    type?: StepsType;
}

// Step Props
export interface StepProps {
    description?: string | VNode;
    icon?: VNode;
    status?: Status;
    title?: string | VNode;
    className?: string;
    style?: CSSProperties;
    onClick?: (e: MouseEvent) => void;
}

// BasicStep Props
export interface BasicStepProps extends StepProps {
    active?: boolean;
    prefixCls?: string;
    stepNumber?: string;
    size?: Size;
    done?: boolean;
    onChange?: () => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    role?: string;
    'aria-label'?: string;
}

// FillStep Props
export interface FillStepProps extends StepProps {
    prefixCls?: string;
    stepNumber?: string;
    onChange?: () => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    role?: string;
    'aria-label'?: string;
}

// NavStep Props
export interface NavStepProps {
    title?: string | VNode;
    className?: string;
    style?: CSSProperties;
    index?: number;
    active?: boolean;
    total?: number;
    prefixCls?: string;
    onChange?: () => void;
    onClick?: (e: MouseEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    role?: string;
    'aria-label'?: string;
}

// BasicSteps Props
export interface BasicStepsProps {
    prefixCls?: string;
    className?: string;
    direction?: Direction;
    current?: number;
    initial?: number;
    status?: Status;
    style?: CSSProperties;
    size?: Size;
    hasLine?: boolean;
    children?: VNode[];
    'aria-label'?: string;
}

// FillSteps Props
export interface FillStepsProps {
    prefixCls?: string;
    className?: string;
    current?: number;
    direction?: Direction;
    initial?: number;
    status?: Status;
    style?: CSSProperties;
    children?: VNode[];
    'aria-label'?: string;
}

// NavSteps Props
export interface NavStepsProps {
    prefixCls?: string;
    className?: string;
    style?: CSSProperties;
    current?: number;
    initial?: number;
    size?: Size;
    children?: VNode[];
    'aria-label'?: string;
}

// Main Steps Props
export interface FillStepsAllProps extends FillStepsProps {
    type?: 'fill';
}

export interface BasicStepsAllProps extends BasicStepsProps {
    type?: 'basic';
}

export interface NavStepsAllProps extends NavStepsProps {
    type?: 'nav';
}

export type StepsProps = FillStepsAllProps | BasicStepsAllProps | NavStepsAllProps;

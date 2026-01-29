export interface MotionObject {
    [x: string]: any;
    children?: any | ((props: MotionChildrenProps) => any);
    willEnter?: () => void;
    didEnter?: () => void;
    willLeave?: () => void;
    didLeave?: () => void;
    onStart?: () => void;
    onRest?: () => void;
    state?: string;
}

export interface MotionChildrenProps {
    animateCls?: string;
    animateStyle?: {
        animationTimingFunction?: string;
        animationName?: string;
        animationDuration?: number | string;
        animationDelay?: number | string;
        animationIterationCount?: number | string;
        animationDirection?: 'alternate' | 'normal';
        animationFillMode?: string;
    };
    animateEvents?: {
        onAnimationIteration?: (e: any) => void;
        onAnimationStart?: (e: any) => void;
        onAnimationEnd?: (e: any) => void;
    };
}

export type MotionFunction<P extends Record<string, any> = any> = (props: P) => MotionObject;

export type Motion<P extends Record<string, any> = any> = boolean | MotionObject | MotionFunction<P>;

export function normalizeMotion<P extends Record<string, any>>(
    motion: Motion<P> | undefined,
    props?: P
): { enabled: boolean; motionObject?: MotionObject } {
    if (motion === undefined || motion === null) {
        return { enabled: true };
    }

    if (typeof motion === 'boolean') {
        return { enabled: motion };
    }

    if (typeof motion === 'function') {
        const motionObject = motion(props || ({} as P));
        return { enabled: true, motionObject };
    }

    if (typeof motion === 'object') {
        return { enabled: true, motionObject: motion };
    }

    return { enabled: true };
}

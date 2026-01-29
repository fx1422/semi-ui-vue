import { InjectionKey } from 'vue';
import { ContextType } from './interface';

const noop = () => {};

export const LayoutContextKey: InjectionKey<ContextType> = Symbol('LayoutContext');

export const defaultContext: ContextType = {
    siderHook: {
        addSider: noop,
        removeSider: noop,
    },
};

import { reactive, isRef, Ref } from 'vue';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import { DefaultAdapter } from '@douyinfe/semi-foundation/base/foundation';

/**
 * 基础组件工具函数，提供 Foundation 层适配器方法和数据属性辅助函数
 */
export function useBaseComponent<
    P extends Record<string, any> = Record<string, any>,
    S extends Record<string, any> = Record<string, any>,
>(props: P, state: S | Ref<S>) {
    const cache: Record<string, unknown> = reactive({});

    const getStateValue = (): S => {
        return isRef(state) ? state.value : state;
    };

    // 过滤掉 undefined 值的 props，使 _isControlledComponent 检查与 React 行为一致
    const getFilteredProps = (): P => {
        const filtered = {} as Partial<P>;
        for (const key in props) {
            if (props[key] !== undefined) {
                filtered[key] = props[key];
            }
        }
        return filtered as P;
    };

    const adapter: DefaultAdapter<P, S> = {
        getContext: (_key: string): unknown => {
            return undefined;
        },
        getContexts: (): Record<string, unknown> => {
            return {};
        },
        getProp: (key: string): unknown => {
            const value = (props as Record<string, unknown>)[key];
            // 为 rowKey 提供默认值 'key'，与 React 版本保持一致
            if (key === 'rowKey' && value === undefined) {
                return 'key';
            }
            return value;
        },
        getProps: () => getFilteredProps(),
        getState: (key: string): unknown => {
            const stateValue = getStateValue();
            return (stateValue as Record<string, unknown>)[key];
        },
        getStates: () => getStateValue(),
        setState: <K extends keyof S>(states: Pick<S, K>, cb?: () => void): void => {
            const stateValue = getStateValue();
            Object.assign(stateValue, states);
            if (cb) {
                cb();
            }
        },
        getCache: (_key: string): unknown => {
            return _key ? cache[_key] : undefined;
        },
        getCaches: (): Record<string, unknown> => {
            return cache;
        },
        setCache: (key: string, value: unknown): void => {
            if (key) {
                cache[key] = value;
            }
        },
        stopPropagation: (e: Event): void => {
            try {
                e.stopPropagation();
                e.stopImmediatePropagation?.();
            } catch {
                // 忽略错误
            }
        },
        persistEvent: (_e: Event): void => {
            // Vue 3 事件不需要 persist
        },
    };

    const getDataAttrFn = (propsToUse?: P | Record<string, unknown>) => {
        return getDataAttr(propsToUse || props);
    };

    return {
        adapter,
        getDataAttr: getDataAttrFn,
        cache,
    };
}

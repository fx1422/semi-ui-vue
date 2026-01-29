import { onMounted, onUnmounted, reactive, shallowRef, markRaw } from 'vue';
import type { DefaultAdapter } from '@douyinfe/semi-foundation/base/foundation';

/**
 * Foundation 类生命周期接口
 */
export interface FoundationLifecycle {
    init?: () => void;
    destroy?: () => void;
}

type AdapterType = Partial<DefaultAdapter>;

export function useFoundation<T extends FoundationLifecycle, A extends AdapterType>(
    FoundationClass: new (adapter: A) => T,
    adapter: A
): { foundation: T };

export function useFoundation<T extends FoundationLifecycle, A extends AdapterType, S extends Record<string, unknown>>(
    FoundationClass: new (adapter: A & { updateState?: (newState: Partial<S>) => void }) => T,
    adapter: A,
    initialState: S
): { foundation: T; state: S };

export function useFoundation<T extends FoundationLifecycle, A extends AdapterType, S extends Record<string, unknown>>(
    FoundationClass: new (adapter: A & { updateState?: (newState: Partial<S>) => void }) => T,
    adapter: A,
    initialState?: S
): { foundation: T; state?: S } {
    if (initialState !== undefined) {
        const state = reactive<S>(initialState);
        const foundation = new FoundationClass({
            ...adapter,
            updateState: (newState: Partial<S>) => {
                Object.assign(state, newState);
            },
        });

        onMounted(() => {
            foundation.init?.();
        });

        onUnmounted(() => {
            foundation.destroy?.();
        });

        return {
            state: state as S,
            foundation,
        };
    }

    // 使用 shallowRef + markRaw 防止 Foundation 实例被深度响应式处理
    const foundation = shallowRef<T | null>(null);
    foundation.value = markRaw(new FoundationClass(adapter));

    onMounted(() => {
        foundation.value?.init?.();
    });

    onUnmounted(() => {
        foundation.value?.destroy?.();
    });

    return {
        foundation: foundation.value as T,
    };
}

<template>
    <div v-if="state.visible" :class="wrapperCls" :style="style" @click="handleClick">
        <slot>
            <Button theme="light" circle>
                <IconChevronUp />
            </Button>
        </slot>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted } from 'vue';
import classNames from 'classnames';
import { throttle } from 'lodash-es';
import { cssClasses } from '@douyinfe/semi-foundation/backtop/constants';
import BackTopFoundation, { type BackTopAdapter } from '@douyinfe/semi-foundation/backtop/foundation';
import type { BackTopProps } from './interface';
import { useFoundation } from '../_utils';
import Button from '../button/Button.vue';
import { IconChevronUp } from '../icons';

defineOptions({
    name: 'BackTop',
});

const props = withDefaults(defineProps<BackTopProps>(), {
    visibilityHeight: 400,
    target: () => (typeof window !== 'undefined' ? window : (null as any)),
    duration: 450,
});

const emit = defineEmits<{
    click: [e: MouseEvent];
}>();

const prefixCls = cssClasses.PREFIX;

// State
const state = reactive({
    visible: false,
});

// Adapter
const adapter: BackTopAdapter = {
    // BackTopAdapter specific methods
    updateVisible: (visible: boolean) => {
        state.visible = visible;
    },
    notifyClick: (e: MouseEvent) => {
        emit('click', e);
    },
    targetIsWindow: (target: any) => target === window,
    isWindowUndefined: () => typeof window === 'undefined',
    targetScrollToTop: (targetNode: any, scrollTop: number) => {
        if (targetNode === window) {
            document.body.scrollTop = scrollTop;
            document.documentElement.scrollTop = scrollTop;
        } else {
            targetNode.scrollTop = scrollTop;
        }
    },
    getProps: () => props,
    getProp: (key: string) => props[key as keyof BackTopProps],
    getStates: () => state,
    getState: (key: string) => state[key as keyof typeof state],

    // DefaultAdapter required methods
    getContext: (key: string) => {
        // Vue 没有 React Context，返回空值
        return undefined;
    },
    getContexts: () => {
        return {};
    },
    setState: (newState: Partial<typeof state>, callback?: () => void) => {
        Object.assign(state, newState);
        if (callback) {
            callback();
        }
    },
    getCache: (key: string) => {
        return undefined;
    },
    getCaches: () => {
        return {};
    },
    setCache: (key: string, value: any) => {
        // 可以实现缓存设置，这里暂不实现
    },
    stopPropagation: (e: Event) => {
        e?.stopPropagation();
    },
    persistEvent: (event: Event) => {
        // Vue 3 不需要持久化事件
    },
};

// Foundation
const foundation = new BackTopFoundation(adapter);

// Throttled click handler
let throttledClick: ((e: MouseEvent) => void) | null = null;

// Class names
const wrapperCls = computed(() => {
    return classNames(prefixCls, props.className);
});

// Event handlers
const handleClick = (e: MouseEvent) => {
    if (throttledClick) {
        throttledClick(e);
    }
};

const clickHandler = (e: MouseEvent) => {
    foundation.onClick(e);
};

// Lifecycle
onMounted(() => {
    foundation.init();
    throttledClick = throttle(clickHandler, props.duration);
});

onUnmounted(() => {
    foundation.destroy();
    throttledClick = null;
});
</script>

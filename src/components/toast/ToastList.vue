<template>
    <div ref="innerWrapperRef" :class="innerWrapperCls" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <CSSAnimation
            v-for="item in list"
            :key="item.id"
            :motion="item.motion !== false"
            :animationState="isRemoved(item) ? 'leave' : 'enter'"
            :startClassName="isRemoved(item) ? `${prefixCls}-animation-hide` : `${prefixCls}-animation-show`"
            :endClassName="isRemoved(item) ? '' : ''"
        >
            <template #default="{ animationClassName, animationEventsNeedBind, isAnimating }">
                <Toast
                    v-if="!(isRemoved(item) && !isAnimating)"
                    :id="item.id"
                    :content="item.content"
                    :type="item.type"
                    :duration="item.duration"
                    :icon="item.icon"
                    :showClose="item.showClose"
                    :textMaxWidth="item.textMaxWidth"
                    :onClose="typeof item.onClose === 'function' ? item.onClose : undefined"
                    :style="item.style"
                    :className="classNames(item.className, animationClassName)"
                    :theme="item.theme"
                    :stack="stack"
                    :stackExpanded="state.mouseInSide"
                    :positionInList="getPositionInList(item)"
                    :motion="item.motion !== false"
                    v-bind="animationEventsNeedBind"
                    @animationstart="
                        (e: AnimationEvent) => {
                            animationEventsNeedBind.onAnimationstart?.();
                            item.onAnimationStart?.(e);
                        }
                    "
                    @animationend="
                        (e: AnimationEvent) => {
                            animationEventsNeedBind.onAnimationend?.();
                            item.onAnimationEnd?.(e);
                        }
                    "
                    v-on="{ close: handleClose }"
                />
            </template>
        </CSSAnimation>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/toast/constants';
import type { ToastListProps, ToastListState, ToastProps } from './interface';
import { useFoundation } from '../_utils';
import ToastListFoundation, { ToastListAdapter } from '@douyinfe/semi-foundation/toast/toastListFoundation';
import Toast from './Toast.vue';
import CSSAnimation from '../_cssAnimation/index.vue';

defineOptions({
    name: 'ToastList',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<ToastListProps>(), {});

const prefixCls = cssClasses.PREFIX;
const innerWrapperRef = ref<HTMLDivElement | null>(null);
const stack = ref(false);

// State
const state = ref<ToastListState>({
    list: [],
    removedItems: [],
    updatedItems: [],
    mouseInSide: false,
});

// Adapter
const adapter: ToastListAdapter = {
    getProps: () => props,
    getProp: (key: keyof ToastListProps) => props[key as keyof ToastListProps],
    getState: (key: keyof ToastListState) => state.value[key],
    getStates: () => state.value,
    setState: (newState: Partial<ToastListState>, callback?: () => void) => {
        Object.assign(state.value, newState);
        callback?.();
    },
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e?: Event) => e?.stopPropagation(),
    persistEvent: () => {},
    updateToast: (list, removedItems, updatedItems) => {
        state.value.list = list;
        state.value.removedItems = removedItems;
        state.value.updatedItems = updatedItems;
    },
    handleMouseInSideChange: (mouseInSide: boolean) => {
        state.value.mouseInSide = mouseInSide;
    },
    getInputWrapperRect: () => {
        return innerWrapperRef.value?.getBoundingClientRect() || null;
    },
};

const { foundation } = useFoundation(ToastListFoundation, adapter);

// Computed
const list = computed(() => {
    const { list, removedItems } = state.value;
    return Array.from(new Set([...list, ...removedItems]));
});

const innerWrapperCls = computed(() => {
    return classNames({
        [`${prefixCls}-innerWrapper`]: true,
        [`${prefixCls}-innerWrapper-hover`]: state.value.mouseInSide,
    });
});

// Methods
const isRemoved = (item: ToastProps) => {
    return state.value.removedItems.find((removedItem) => removedItem.id === item.id) !== undefined;
};

const getPositionInList = (item: ToastProps) => {
    const index = list.value.findIndex((i) => i.id === item.id);
    return {
        index,
        length: list.value.length,
    };
};

const handleMouseEnter = () => {
    if (stack.value) {
        foundation.handleMouseInSideChange(true);
    }
};

const handleMouseLeave = () => {
    if (stack.value) {
        const height = foundation.getInputWrapperRect()?.height;
        if (height) {
            foundation.handleMouseInSideChange(false);
        }
    }
};

const handleClose = (id: string) => {
    foundation.removeToast(id);
};

// Expose methods
defineExpose({
    has: (id: string) => foundation.hasToast(id),
    add: (opts: ToastProps) => foundation.addToast(opts),
    update: (id: string, opts: ToastProps) => foundation.updateToast(id, opts),
    remove: (id: string) => foundation.removeToast(id),
    destroyAll: () => foundation.destroyAll(),
    stack,
});
</script>

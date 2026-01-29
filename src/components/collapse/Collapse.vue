<template>
    <div :class="clsPrefix" :style="style" v-bind="dataAttrs">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/collapse/constants';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import { isEqual } from 'lodash-es';
import type { CollapseProps, CollapseActiveKey } from './interface';
import { provideCollapseContext } from './context';
import { useFoundation } from '../_utils';
import CollapseFoundation from '@douyinfe/semi-foundation/collapse/foundation';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<CollapseProps>(), {
    defaultActiveKey: '',
    clickHeaderToExpand: true,
    expandIconPosition: 'right',
    lazyRender: false,
});

const emit = defineEmits<{
    change: [activeKey: CollapseActiveKey, e: MouseEvent];
}>();

const activeSet = ref<Set<string>>(new Set());

const adapter = {
    handleChange: (activeKey: CollapseActiveKey, e: MouseEvent) => {
        emit('change', activeKey, e);
    },
    addActiveKey: (newSet: Set<string>) => {
        activeSet.value = newSet;
    },

    getContext: () => {
        return undefined;
    },
    getContexts: () => {
        return {};
    },
    getState: (key: string) => {
        if (key === 'activeSet') return activeSet.value;
        return undefined;
    },
    getStates: () => ({ activeSet: activeSet.value }),
    setState: (newState: Partial<{ activeSet: Set<string> }>, callback?: () => void) => {
        if (newState.activeSet !== undefined) {
            activeSet.value = newState.activeSet;
        }
        if (callback) {
            callback();
        }
    },
    getProp: (key: string) => {
        const value = (props as any)[key];
        // 转换 motion 类型：Motion -> boolean（Foundation 期望 boolean）
        if (key === 'motion') {
            return typeof value === 'boolean' ? value : Boolean(value);
        }
        return value;
    },
    getProps: () => {
        const foundationProps = { ...props } as any;
        if (foundationProps.motion !== undefined) {
            foundationProps.motion =
                typeof foundationProps.motion === 'boolean' ? foundationProps.motion : Boolean(foundationProps.motion);
        }
        return foundationProps;
    },
    getCache: () => {
        return undefined;
    },
    getCaches: () => {
        return {};
    },
    setCache: () => {},
    stopPropagation: (e: Event) => {
        e?.stopPropagation();
    },
    persistEvent: () => {},
};

const { foundation } = useFoundation(CollapseFoundation, adapter);

const initKeys = foundation.initActiveKey();
activeSet.value = new Set(initKeys);

watch(
    () => props.activeKey,
    (newActiveKey) => {
        if (newActiveKey !== undefined) {
            const keys = Array.isArray(newActiveKey) ? newActiveKey : [newActiveKey];
            const newSet = new Set(keys);
            if (!isEqual(newSet, activeSet.value)) {
                activeSet.value = newSet;
            }
        }
    },
    { deep: true }
);

const clsPrefix = computed(() => classNames(prefixCls, props.className));

const dataAttrs = computed(() => {
    const { ...rest } = props;
    return getDataAttr(rest as any);
});

const contextValue = computed(() => {
    return {
        get activeSet() {
            return activeSet.value;
        },
        expandIcon: props.expandIcon,
        collapseIcon: props.collapseIcon,
        clickHeaderToExpand: props.clickHeaderToExpand,
        keepDOM: props.keepDOM,
        expandIconPosition: props.expandIconPosition,
        onClick: (itemKey: string, e: MouseEvent) => {
            foundation.handleChange(itemKey, e);
        },
        motion: props.motion,
        lazyRender: props.lazyRender,
    };
});

provideCollapseContext(contextValue);
</script>

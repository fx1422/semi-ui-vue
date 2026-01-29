<template>
    <component :is="tagName" :class="classString" :style="style">
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import { ref, computed, provide, useSlots, VNode } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/layout/constants';
import { LayoutProps } from './interface';
import { LayoutContextKey } from './context';

const props = withDefaults(defineProps<LayoutProps>(), {
    prefixCls: cssClasses.PREFIX,
    tagName: 'section',
});

const slots = useSlots();
const siders = ref<string[]>([]);

const addSider = (id: string) => {
    siders.value = [...siders.value, id];
};

const removeSider = (id: string) => {
    siders.value = siders.value.filter((curr) => curr !== id);
};

provide(LayoutContextKey, {
    siderHook: {
        addSider,
        removeSider,
    },
});

const hasSiderInChildren = computed(() => {
    const children = slots.default?.() || [];
    return children.some((child: VNode) => {
        if (child.type && typeof child.type === 'object') {
            const componentName = (child.type as any).name || (child.type as any).__name;
            return componentName === 'Sider' || componentName === 'LayoutSider';
        }
        return false;
    });
});

const classString = computed(() =>
    cls(props.className, props.prefixCls, {
        [`${props.prefixCls}-has-sider`]:
            (typeof props.hasSider === 'boolean' && props.hasSider) ||
            siders.value.length > 0 ||
            hasSiderInChildren.value,
    })
);
</script>

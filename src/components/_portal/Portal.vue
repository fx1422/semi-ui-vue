<template>
    <Teleport :to="container" :disabled="!container">
        <slot></slot>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, getCurrentInstance } from 'vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';
import classnames from 'classnames';
import { PortalProps } from './interface';

const props = withDefaults(defineProps<PortalProps>(), {
    prefixCls: `${BASE_CLASS_PREFIX}-portal`,
});

const emit = defineEmits<{
    didUpdate: [prevProps: PortalProps];
}>();

const container = ref<HTMLElement | null>(null);
const portalElement = ref<HTMLDivElement | null>(null);

const defaultGetContainer = () => document.body;

const initContainer = () => {
    if (typeof document === 'undefined') {
        return;
    }

    if (portalElement.value) {
        const getContainer = props.getPopupContainer || defaultGetContainer;
        const portalContainer = getContainer();
        if (portalElement.value.parentElement === portalContainer) {
            return;
        }
        if (portalElement.value.parentElement) {
            portalElement.value.parentElement.removeChild(portalElement.value);
        }
    } else {
        portalElement.value = document.createElement('div');
    }

    const getContainer = props.getPopupContainer || defaultGetContainer;
    const portalContainer = getContainer();

    if (portalContainer) {
        portalContainer.appendChild(portalElement.value);
        addStyle(props.style);
        addClass(props.prefixCls, props.className);
        container.value = portalElement.value;
    }
};

const addStyle = (style?: Record<string, any>) => {
    if (portalElement.value && style) {
        Object.keys(style).forEach((key) => {
            if (portalElement.value) {
                portalElement.value.style[key as any] = style[key];
            }
        });
    }
};

const addClass = (prefixCls: string, ...classNames: (string | undefined)[]) => {
    const cls = classnames(prefixCls, ...classNames);
    if (portalElement.value) {
        portalElement.value.className = cls;
    }
};

onMounted(() => {
    if (typeof document !== 'undefined') {
        initContainer();
    }
});

onBeforeUnmount(() => {
    if (portalElement.value && portalElement.value.parentElement) {
        portalElement.value.parentElement.removeChild(portalElement.value);
    }
});

watch(
    () => [props.style, props.className],
    () => {
        if (portalElement.value) {
            addStyle(props.style);
            addClass(props.prefixCls, props.className);
        }
    },
    { deep: true }
);

watch(
    () => props.getPopupContainer,
    (newGetContainer, oldGetContainer) => {
        if (newGetContainer !== oldGetContainer && typeof document !== 'undefined') {
            if (portalElement.value && portalElement.value.parentElement) {
                portalElement.value.parentElement.removeChild(portalElement.value);
            }
            portalElement.value = null;
            container.value = null;
            nextTick(() => {
                initContainer();
            });
        }
    }
);

const instance = getCurrentInstance();
if (instance) {
    watch(
        () => props,
        (newProps, oldProps) => {
            if (oldProps) {
                emit('didUpdate', oldProps);
            }
        },
        { deep: true }
    );
}
</script>

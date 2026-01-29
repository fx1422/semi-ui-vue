<template>
    <Modal
        :className="wrapperClassName"
        :title="titleNode"
        :confirmLoading="confirmLoading"
        :cancelLoading="cancelLoading"
        :icon="iconNode"
        :visible="internalVisible"
        v-bind="restProps"
        @ok="handleOk"
        @cancel="handleCancel"
    >
        <div :class="contentCls" x-semi-prop="content">
            <component :is="content" v-if="isVNode(content)" />
            <template v-else>{{ content }}</template>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref, computed, h, isVNode, watch, provide } from 'vue';
import classNames from 'classnames';
import { omit } from 'lodash-es';
import { cssClasses } from '@douyinfe/semi-foundation/modal/constants';
import Modal from './Modal.vue';
import type { ConfirmProps } from './confirm';

// 标记这是命令式调用
provide('semi-modal-imperative', true);

const props = withDefaults(defineProps<ConfirmProps>(), {
    mask: true,
    motion: true,
    maskClosable: true,
    centered: false,
    closable: true,
    okType: 'primary',
    hasCancel: true,
});

const internalVisible = ref(props.visible !== undefined ? props.visible : true);
const confirmLoading = ref(false);
const cancelLoading = ref(false);

watch(
    () => props.visible,
    (newVal) => {
        if (newVal !== undefined) {
            internalVisible.value = newVal;
        }
    }
);

const handleOk = (e: MouseEvent) => {
    const res = props.onOk && props.onOk(e);
    if (res && typeof res.then === 'function') {
        confirmLoading.value = true;
        res.then(
            () => {
                internalVisible.value = false;
                confirmLoading.value = false;
            },
            () => {
                confirmLoading.value = false;
            }
        );
    } else {
        internalVisible.value = false;
    }
};

const handleCancel = (e: MouseEvent) => {
    const res = props.onCancel && props.onCancel(e);
    if (res && typeof res.then === 'function') {
        cancelLoading.value = true;
        res.then(
            () => {
                internalVisible.value = false;
                cancelLoading.value = false;
            },
            () => {
                cancelLoading.value = false;
            }
        );
    } else {
        internalVisible.value = false;
    }
};

const confirmCls = `${cssClasses.DIALOG}-confirm`;
const wrapperClassName = computed(() => {
    return classNames(confirmCls, props.className, {
        [`${confirmCls}-rtl`]: props.direction === 'rtl',
    });
});

const typeCls = computed(() => classNames(`${cssClasses.DIALOG}-${props.type}`));

const iconNode = computed(() => {
    const { icon } = props;
    if (!icon) return null;

    if (isVNode(icon)) {
        return h(
            icon.type as any,
            {
                ...(icon.props || {}),
                class: classNames(icon.props?.class, `${confirmCls}-icon`, `${typeCls.value}-icon`),
                size: 'extra-large',
            },
            icon.children
        );
    }

    return icon;
});

const titleNode = computed(() => {
    const { title } = props;
    if (title == null) return null;
    return h('span', { class: `${confirmCls}-title-text` }, [title]);
});

const contentCls = computed(() => {
    return classNames(`${confirmCls}-content`, {
        [`${confirmCls}-content-withIcon`]: props.icon,
    });
});

const restProps = computed(() => {
    const excludedKeys = ['title', 'content', 'icon', 'type', 'onCancel', 'onOk', 'className', 'visible'];
    const rest = omit(props, excludedKeys);
    const filteredProps: Record<string, any> = {};
    Object.keys(rest).forEach((key) => {
        const value = (rest as any)[key];
        if (value !== undefined) {
            filteredProps[key] = value;
        }
    });
    // 添加 visible 属性，使用 internalVisible
    filteredProps.visible = internalVisible.value;
    return filteredProps;
});
</script>

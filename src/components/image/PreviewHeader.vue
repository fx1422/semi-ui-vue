<template>
    <section ref="headerRef" :class="headerCls">
        <section :class="`${prefixCls}-title`" :style="titleStyle">
            <slot name="header" :title="titleValue">
                <component :is="titleNode" v-if="titleNode" />
            </slot>
        </section>
        <section v-if="closable" :class="`${prefixCls}-close`" @mouseup="handleClose">
            <component :is="closeIconNode" />
        </section>
    </section>
</template>

<script setup lang="ts">
import { computed, h, ref, useSlots } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/image/constants';
import { HeaderProps } from './interface';
import { usePreviewContext } from './context';
import { IconClose } from '../icons';

defineOptions({
    name: 'PreviewHeader',
});

const prefixCls = `${cssClasses.PREFIX}-preview-header`;
const slots = useSlots();

console.log('PreviewHeader 初始化，slots:', {
    header: !!slots.header,
    availableSlots: Object.keys(slots),
});

const props = withDefaults(defineProps<HeaderProps>(), {
    closable: true,
});

const emit = defineEmits<{
    close: [e: MouseEvent];
}>();

const previewContext = usePreviewContext();

const headerRef = ref<HTMLElement | null>(null);

const headerCls = computed(() => {
    return cls(prefixCls, props.className);
});

const titleValue = computed(() => {
    if (previewContext && previewContext.titles && typeof previewContext.currentIndex === 'number') {
        return previewContext.titles[previewContext.currentIndex];
    }
    return props.title;
});

const title = computed(() => titleValue.value);

const titleNode = computed(() => {
    // 插槽优先级高于renderHeader
    if (slots.header) {
        console.log('PreviewHeader: 检测到header插槽，使用插槽内容');
        return null;
    }

    // 没有插槽时才使用renderHeader
    if (props.renderHeader) {
        console.log('PreviewHeader: 使用renderHeader函数');
        const rendered = props.renderHeader(title.value);
        if (rendered && typeof rendered === 'object' && 'type' in rendered) {
            return rendered;
        }
        return h('span', rendered || '');
    }

    // 最后使用默认标题
    console.log('PreviewHeader: 使用默认标题');
    return title.value ? h('span', title.value) : null;
});

const closeIconNode = computed(() => {
    if (props.renderCloseIcon) {
        const icon = typeof props.renderCloseIcon === 'function' ? props.renderCloseIcon() : props.renderCloseIcon;
        if (icon && typeof icon === 'object' && 'type' in icon) {
            return icon;
        }
        console.warn(
            '[Semi ImagePreview] RenderCloseIcon should be a valid vue element or a function that returns a vue element'
        );
    }
    return h(IconClose);
});

const handleClose = (e: MouseEvent) => {
    emit('close', e);
};

defineExpose({
    headerRef: headerRef,
    $el: headerRef,
});
</script>

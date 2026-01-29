<template>
    <div :class="wrapperCls" :style="style">
        <div :class="`${prefixCls}-image`" :style="imageStyle" x-semi-prop="image,darkModeImage">
            <component :is="imageNode" v-if="imageNode" />
        </div>
        <div :class="`${prefixCls}-content`">
            <TypographyTitle
                v-if="title || $slots.title"
                :class="`${prefixCls}-title`"
                :heading="titleProps.heading"
                :style="titleProps.style"
                x-semi-prop="title"
            >
                <slot v-if="$slots.title" name="title"></slot>
                <template v-else-if="isString(title)">{{ title }}</template>
                <component :is="() => title" v-else />
            </TypographyTitle>
            <div v-if="description || $slots.description" :class="`${prefixCls}-description`" x-semi-prop="description">
                <slot v-if="$slots.description" name="description"></slot>
                <template v-else-if="isString(description)">{{ description }}</template>
                <component :is="() => description" v-else />
            </div>
            <div v-if="$slots.default" :class="`${prefixCls}-footer`" x-semi-prop="children">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, h } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/empty/constants';
import TypographyTitle from '../typography/Title.vue';
import { EmptyProps, SVGNode } from './interface';

defineOptions({
    name: 'Empty',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<EmptyProps>(), {
    layout: 'vertical',
});

// 类型判断辅助函数
const isString = (val: unknown): val is string => typeof val === 'string';

// 主题模式监听
const mode = ref<string | null>(null);
let body: HTMLElement | null = null;
let observer: MutationObserver | null = null;

const updateMode = () => {
    if (body) {
        const val = body.getAttribute('theme-mode');
        if (val !== mode.value) {
            mode.value = val;
        }
    }
};

const observe = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'theme-mode') {
            updateMode();
        }
    }
};

onMounted(() => {
    if (props.darkModeImage) {
        body = window.document.body;
        updateMode();
        const config = { attributes: true, childList: false, subtree: false };
        observer = new MutationObserver(observe);
        observer.observe(body, config);
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});

// 计算图片节点
const imageNode = computed(() => {
    const alt = typeof props.description === 'string' ? props.description : 'empty';
    const imgSrc = mode.value === 'dark' && props.darkModeImage ? props.darkModeImage : props.image;

    if (typeof imgSrc === 'string') {
        return h('img', { alt, src: imgSrc });
    } else if (imgSrc && typeof imgSrc === 'object' && 'id' in imgSrc) {
        return h('svg', { 'aria-hidden': 'true' }, [h('use', { 'xlink:href': `#${(imgSrc as SVGNode).id}` })]);
    } else if (imgSrc) {
        return imgSrc;
    }
    return null;
});

// 计算样式类
const wrapperCls = computed(() => {
    return cls(props.className, prefixCls, {
        [`${prefixCls}-${props.layout}`]: props.layout,
    });
});

// 标题属性
const titleProps = computed(() => {
    if (imageNode.value) {
        return {
            heading: 4 as const,
            style: undefined,
        };
    }
    return {
        heading: 6 as const,
        style: { fontWeight: 400 },
    };
});
</script>

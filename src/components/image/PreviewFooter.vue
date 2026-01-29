<template>
    <section ref="footerRef" :class="menuCls">
        <slot name="footer" :menuProps="menuProps">
            <template v-if="renderPreviewMenu">
                <component :is="customMenu" />
            </template>
            <template v-else>
                <template v-for="(item, index) in defaultMenu" :key="index">
                    <component :is="item" />
                </template>
            </template>
        </slot>
    </section>
</template>

<script setup lang="ts">
import { computed, h, ref, useSlots } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/image/constants';
import PreviewFooterFoundation, { PreviewFooterAdapter } from '@douyinfe/semi-foundation/image/previewFooterFoundation';
import { FooterProps, MenuProps, RatioType } from './interface';
import { useFoundation } from '../_utils';
import {
    IconChevronLeft,
    IconChevronRight,
    IconMinus,
    IconPlus,
    IconRotate,
    IconDownload,
    IconWindowAdaptionStroked,
    IconRealSizeStroked,
} from '../icons';
import Tooltip from '../tooltip/Tooltip.vue';
import Divider from '../divider/Divider.vue';
import Slider from '../slider/Slider.vue';
import { throttle } from 'lodash-es';

defineOptions({
    name: 'PreviewFooter',
});

const prefixCls = cssClasses.PREFIX;
const footerPrefixCls = `${prefixCls}-preview-footer`;
const slots = useSlots();

console.log('PreviewFooter 初始化，slots:', {
    footer: !!slots.footer,
    availableSlots: Object.keys(slots),
});

const props = withDefaults(defineProps<FooterProps>(), {
    min: 10,
    max: 500,
    step: 10,
    showTooltip: false,
    disableDownload: false,
});

const emit = defineEmits<{
    prev: [];
    next: [];
    zoomIn: [zoom: number];
    zoomOut: [zoom: number];
    rotate: [direction: string];
    adjustRatio: [type: RatioType];
    download: [];
}>();

const footerRef = ref<HTMLElement | null>(null);

const adapter: PreviewFooterAdapter<FooterProps> = {
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: () => null,
    getStates: () => ({}),
    setState: () => {},
    getContext: () => null,
    getContexts: () => ({}),
    getCache: () => null,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: Event) => e?.stopPropagation(),
    persistEvent: () => {},
};

const { foundation } = useFoundation(PreviewFooterFoundation, adapter);
const handleMinusClick = () => {
    foundation.changeSliderValue('minus');
};

const handlePlusClick = () => {
    foundation.changeSliderValue('plus');
};

const handleRotateLeft = () => {
    foundation.handleRotate('left');
    emit('rotate', 'left');
};

const handleRotateRight = () => {
    foundation.handleRotate('right');
    emit('rotate', 'right');
};

const handleSlideChange = throttle((value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    foundation.handleValueChange(numValue);
}, 50);

const handleRatioClick = () => {
    foundation.handleRatioClick();
};

const getIconChevronLeft = () => {
    const icon = h(IconChevronLeft, {
        size: 'large',
        class: props.disabledPrev ? `${footerPrefixCls}-disabled` : '',
        onClick: !props.disabledPrev ? () => emit('prev') : undefined,
    });
    return props.showTooltip ? h(Tooltip, { content: props.prevTip || '上一张' }, { default: () => icon }) : icon;
};

const getIconChevronRight = () => {
    const icon = h(IconChevronRight, {
        size: 'large',
        class: props.disabledNext ? `${footerPrefixCls}-disabled` : '',
        onClick: !props.disabledNext ? () => emit('next') : undefined,
    });
    return props.showTooltip ? h(Tooltip, { content: props.nextTip || '下一张' }, { default: () => icon }) : icon;
};

const getIconMinus = () => {
    const disabledZoomOut = props.zoom === props.min;
    const icon = h(IconMinus, {
        size: 'large',
        class: disabledZoomOut ? `${footerPrefixCls}-disabled` : '',
        onClick: !disabledZoomOut ? handleMinusClick : undefined,
    });
    return props.showTooltip ? h(Tooltip, { content: props.zoomOutTip || '缩小' }, { default: () => icon }) : icon;
};

const getIconPlus = () => {
    const disabledZoomIn = props.zoom === props.max;
    const icon = h(IconPlus, {
        size: 'large',
        class: disabledZoomIn ? `${footerPrefixCls}-disabled` : '',
        onClick: !disabledZoomIn ? handlePlusClick : undefined,
    });
    return props.showTooltip ? h(Tooltip, { content: props.zoomInTip || '放大' }, { default: () => icon }) : icon;
};

const getIconRatio = () => {
    const icon =
        props.ratio === 'adaptation'
            ? h(IconRealSizeStroked, { size: 'large', class: `${footerPrefixCls}-gap`, onClick: handleRatioClick })
            : h(IconWindowAdaptionStroked, {
                  size: 'large',
                  class: `${footerPrefixCls}-gap`,
                  onClick: handleRatioClick,
              });
    const content = props.ratio === 'adaptation' ? props.originTip || '原始尺寸' : props.adaptiveTip || '适应窗口';
    return props.showTooltip ? h(Tooltip, { content }, { default: () => icon }) : icon;
};

const getIconRotate = () => {
    const icon = h(IconRotate, {
        size: 'large',
        onClick: handleRotateLeft,
    });
    return props.showTooltip ? h(Tooltip, { content: props.rotateTip || '旋转' }, { default: () => icon }) : icon;
};

const getIconDownload = () => {
    const icon = h(IconDownload, {
        size: 'large',
        class: cls(`${footerPrefixCls}-gap`, {
            [`${footerPrefixCls}-disabled`]: props.disableDownload,
        }),
        onClick: !props.disableDownload ? () => emit('download') : undefined,
    });
    return props.showTooltip ? h(Tooltip, { content: props.downloadTip || '下载' }, { default: () => icon }) : icon;
};

const getNumberInfo = () => {
    return h('div', { class: `${footerPrefixCls}-page`, key: 'info' }, `${props.curPage}/${props.totalNum}`);
};

const getSlider = () => {
    return h(Slider, {
        key: 'slider',
        value: props.zoom,
        min: props.min,
        max: props.max,
        step: props.step,
        tipFormatter: (v: string | number | boolean | null | (string | number | boolean | null)[]) => {
            const numValue = Array.isArray(v) ? v[0] : v;
            return typeof numValue === 'number' ? `${numValue}%` : String(numValue || '');
        },
        tooltipVisible: props.showTooltip ? undefined : false,
        onChange: handleSlideChange,
    });
};

const getMenu = () => [
    getIconChevronLeft(),
    getNumberInfo(),
    getIconChevronRight(),
    getIconMinus(),
    getSlider(),
    getIconPlus(),
    getIconRatio(),
    getIconRotate(),
    getIconDownload(),
];

const getFooterMenu = () => {
    const menuItems = getMenu();
    menuItems.splice(3, 0, h(Divider, { layout: 'vertical', key: 'divider-first' }));
    menuItems.splice(8, 0, h(Divider, { layout: 'vertical', key: 'divider-second' }));
    return menuItems;
};

const defaultMenu = computed(() => {
    return getFooterMenu();
});

const menuProps = computed<MenuProps>(() => ({
    min: props.min,
    max: props.max,
    step: props.step,
    curPage: props.curPage,
    totalNum: props.totalNum,
    zoom: props.zoom,
    ratio: props.ratio,
    disabledPrev: props.disabledPrev,
    disabledNext: props.disabledNext,
    disableDownload: props.disableDownload,
    disableZoomIn: props.zoom === props.max,
    disableZoomOut: props.zoom === props.min,
    onDownload: () => emit('download'),
    onNext: () => emit('next'),
    onPrev: () => emit('prev'),
    onZoomIn: () => handlePlusClick(),
    onZoomOut: () => handleMinusClick(),
    onRatioClick: handleRatioClick,
    onRotateLeft: handleRotateLeft,
    onRotateRight: handleRotateRight,
    menuItems: getMenu() as any,
}));

const customMenu = computed(() => {
    // 插槽优先级高于renderPreviewMenu
    if (slots.footer) {
        console.log('PreviewFooter: 检测到footer插槽，使用插槽内容');
        return null;
    }

    // 没有插槽时才使用renderPreviewMenu
    if (!props.renderPreviewMenu) {
        console.log('PreviewFooter: 没有renderPreviewMenu');
        return null;
    }
    console.log('PreviewFooter: 使用renderPreviewMenu函数');
    return props.renderPreviewMenu!(menuProps.value);
});

const menuCls = computed(() => {
    return cls(footerPrefixCls, `${footerPrefixCls}-wrapper`, props.className, {
        [`${footerPrefixCls}-content`]: !props.renderPreviewMenu,
    });
});

defineExpose({
    footerRef: footerRef,
    $el: footerRef,
});
</script>

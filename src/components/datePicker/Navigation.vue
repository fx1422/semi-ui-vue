<template>
    <div ref="navRef" :class="prefixCls">
        <IconButton
            key="double-chevron-left"
            aria-label="Previous year"
            :size="buttonSize"
            theme="borderless"
            :noHorizontalPadding="btnNoHorizontalPadding"
            :style="leftButtonStyle"
            @click="handlePrevYear"
        >
            <IconDoubleChevronLeft :size="iconBtnSize" aria-hidden />
        </IconButton>
        <IconButton
            key="chevron-left"
            aria-label="Previous month"
            :size="buttonSize"
            theme="borderless"
            :noHorizontalPadding="btnNoHorizontalPadding"
            :style="leftButtonStyle"
            @click="handlePrevMonth"
        >
            <IconChevronLeft :size="iconBtnSize" aria-hidden />
        </IconButton>
        <div :class="`${prefixCls}-month`">
            <Button theme="borderless" :size="buttonSize" @click="handleMonthClick">
                {{ monthTextDisplay }}
            </Button>
        </div>
        <IconButton
            key="chevron-right"
            aria-label="Next month"
            :size="buttonSize"
            theme="borderless"
            :noHorizontalPadding="btnNoHorizontalPadding"
            :style="rightButtonStyle"
            @click="handleNextMonth"
        >
            <IconChevronRight :size="iconBtnSize" aria-hidden />
        </IconButton>
        <IconButton
            key="double-chevron-right"
            aria-label="Next year"
            :size="buttonSize"
            theme="borderless"
            :noHorizontalPadding="btnNoHorizontalPadding"
            :style="rightButtonStyle"
            @click="handleNextYear"
        >
            <IconDoubleChevronRight :size="iconBtnSize" aria-hidden />
        </IconButton>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useAttrs } from 'vue';
import { noop } from 'lodash-es';
import IconButton from '../iconButton/IconButton.vue';
import Button from '../button/Button.vue';
import { IconChevronLeft, IconChevronRight, IconDoubleChevronLeft, IconDoubleChevronRight } from '../icons';
import { cssClasses, strings } from '@douyinfe/semi-foundation/datePicker/constants';
import type { NavigationProps } from './interface';
import type { PanelType } from '@douyinfe/semi-foundation/datePicker/monthsGridFoundation';

defineOptions({
    name: 'DatePickerNavigation',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<NavigationProps>(), {
    monthText: '',
    onMonthClick: noop,
    onNextMonth: noop,
    onPrevMonth: noop,
    onNextYear: noop,
    onPrevYear: noop,
    forwardRef: noop,
});

const prefixCls = cssClasses.NAVIGATION;
const navRef = ref<HTMLDivElement | null>(null);

const getDensity = () => props.density || (attrs as any).density || 'default';
const getPanelType = () => props.panelType || (attrs as any).panelType;
const getShouldBimonthSwitch = () => props.shouldBimonthSwitch || (attrs as any).shouldBimonthSwitch;

const iconBtnSize = computed(() => (getDensity() === 'compact' ? 'default' : 'large'));
const btnNoHorizontalPadding = true;
const buttonSize = computed(() => (getDensity() === 'compact' ? 'small' : 'default'));
const isLeftPanel = computed(() => getPanelType() === strings.PANEL_TYPE_LEFT);
const isRightPanel = computed(() => getPanelType() === strings.PANEL_TYPE_RIGHT);

const hiddenLeftPanelRightButtons = computed(() => getShouldBimonthSwitch() && isLeftPanel.value);
const hiddenRightPanelLeftButtons = computed(() => getShouldBimonthSwitch() && isRightPanel.value);

const leftButtonStyle = computed(() => {
    const style: Record<string, any> = {};
    if (hiddenRightPanelLeftButtons.value) {
        style.visibility = 'hidden';
    }
    return style;
});

const rightButtonStyle = computed(() => {
    const style: Record<string, any> = {};
    if (hiddenLeftPanelRightButtons.value) {
        style.visibility = 'hidden';
    }
    return style;
});

const handlePrevYear = (e: MouseEvent) => (props.onPrevYear || (attrs as any).onPrevYear)?.(e);
const handlePrevMonth = (e: MouseEvent) => (props.onPrevMonth || (attrs as any).onPrevMonth)?.(e);
const handleNextMonth = (e: MouseEvent) => (props.onNextMonth || (attrs as any).onNextMonth)?.(e);
const handleNextYear = (e: MouseEvent) => (props.onNextYear || (attrs as any).onNextYear)?.(e);
const handleMonthClick = (e: MouseEvent) => (props.onMonthClick || (attrs as any).onMonthClick)?.(e);

const attrs = useAttrs();

const monthTextDisplay = computed(() => {
    return props.monthText || (attrs as any).monthText || '';
});

onMounted(() => {
    if (props.forwardRef) {
        props.forwardRef(navRef.value);
    }
});
</script>

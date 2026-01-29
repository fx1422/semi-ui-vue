<template>
    <div
        v-if="props.presets && props.presets.length"
        :class="wrapperCls"
        :x-insetinput="props.insetInput ? 'true' : 'false'"
    >
        <div v-if="!isPanelTopAndBottom" :class="headerCls">{{ props.locale?.presets }}</div>
        <div :class="contentWrapperCls">
            <div :class="contentCls">
                <Button
                    v-for="(item, index) in props.presets"
                    :key="index"
                    size="small"
                    type="primary"
                    @click="handlePresetClick(item, $event)"
                >
                    <div :class="itemCls">
                        <TypographyText :ellipsis="{ showTooltip: true }" :class="ellipsisCls">
                            {{ getPresetText(item) }}
                        </TypographyText>
                    </div>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { noop } from 'lodash-es';
import classNames from 'classnames';
import Button from '../button/Button.vue';
import TypographyText from '../typography/Text.vue';
import { cssClasses, strings } from '@douyinfe/semi-foundation/datePicker/constants';
import type { QuickControlProps, PresetType, PresetsType } from './interface';

defineOptions({
    name: 'DatePickerQuickControl',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<QuickControlProps>(), {
    presets: () => [] as PresetsType,
    presetPosition: 'bottom',
    onPresetClick: noop,
    type: 'date',
    insetInput: false,
    locale: undefined,
});

const prefixCls = cssClasses.PREFIX;

const isTypeRange = computed(() => props.type === 'dateRange' || props.type === 'dateTimeRange');
const isPanelTopAndBottom = computed(() => props.presetPosition === 'top' || props.presetPosition === 'bottom');
const isMonth = computed(() => props.type === 'month');
const isTopAndBottomRange = computed(() => isPanelTopAndBottom.value && isTypeRange.value);
const isTopAndBottomMonth = computed(() => isPanelTopAndBottom.value && isMonth.value);

const wrapperCls = computed(() =>
    classNames(`${prefixCls}-quick-control`, {
        [`${prefixCls}-quick-control-${props.type}`]: props.type,
        [`${prefixCls}-quick-control-${props.presetPosition}`]: true,
    })
);

const headerCls = computed(() => classNames(`${prefixCls}-quick-control-header`));

const contentWrapperCls = computed(() =>
    classNames(`${prefixCls}-quick-control-${props.presetPosition}-content-wrapper`)
);

const contentCls = computed(() =>
    classNames({
        [`${prefixCls}-quick-control-${props.presetPosition}-content`]:
            !isTopAndBottomRange.value && !isTopAndBottomMonth.value,
        [`${prefixCls}-quick-control-${props.presetPosition}-range-content`]: isTopAndBottomRange.value,
        [`${prefixCls}-quick-control-${props.presetPosition}-month-content`]: isTopAndBottomMonth.value,
    })
);

const itemCls = computed(() =>
    classNames({
        [`${prefixCls}-quick-control-${props.presetPosition}-content-item`]:
            !isTopAndBottomRange.value && !isTopAndBottomMonth.value,
        [`${prefixCls}-quick-control-${props.presetPosition}-range-content-item`]: isTopAndBottomRange.value,
        [`${prefixCls}-quick-control-${props.presetPosition}-month-content-item`]: isTopAndBottomMonth.value,
    })
);

const ellipsisCls = computed(() =>
    classNames({
        [`${prefixCls}-quick-control-${props.presetPosition}-content-item-ellipsis`]:
            !isTopAndBottomRange.value && !isTopAndBottomMonth.value,
        [`${prefixCls}-quick-control-${props.presetPosition}-range-content-item-ellipsis`]: isTopAndBottomRange.value,
        [`${prefixCls}-quick-control-${props.presetPosition}-month-content-item-ellipsis`]: isTopAndBottomMonth.value,
    })
);

const getPresetText = (item: PresetType | (() => PresetType)): string => {
    const _item: PresetType = typeof item === 'function' ? (item as () => PresetType)() : item;
    return _item.text || '';
};

const handlePresetClick = (item: PresetType | (() => PresetType), e: MouseEvent) => {
    const _item: PresetType = typeof item === 'function' ? (item as () => PresetType)() : item;
    props.onPresetClick(_item, e);
};
</script>

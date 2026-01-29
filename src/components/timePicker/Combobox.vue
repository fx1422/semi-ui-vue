<template>
    <ScrollList
        :header="props.panelHeader"
        :footer="props.panelFooter"
        x-semi-header-alias="panelHeader"
        x-semi-footer-alias="panelFooter"
    >
        <ScrollItem
            v-if="props.use12Hours"
            mode="normal"
            :class="`${props.prefixCls}-list-ampm`"
            :list="ampmOptions"
            :selectedIndex="props.isAM ? 0 : 1"
            type="ampm"
            v-bind="props.scrollItemProps"
            :motion="props.motion"
            @select="onItemChange"
        />
        <ScrollItem
            v-if="state.showHour"
            mode="normal"
            :class="`${props.prefixCls}-list-hour`"
            :transform="transformHour"
            :list="hourOptionsFormatted"
            :selectedIndex="hourSelectedIndex"
            type="hour"
            v-bind="props.scrollItemProps"
            :motion="props.motion"
            @select="onItemChange"
        />
        <ScrollItem
            v-if="state.showMinute"
            mode="normal"
            :class="`${props.prefixCls}-list-minute`"
            :transform="transformMinute"
            :list="minuteOptionsFormatted"
            :selectedIndex="minuteSelectedIndex"
            type="minute"
            v-bind="props.scrollItemProps"
            :motion="props.motion"
            @select="onItemChange"
        />
        <ScrollItem
            v-if="state.showSecond"
            mode="normal"
            :class="`${props.prefixCls}-list-second`"
            :transform="transformSecond"
            :list="secondOptionsFormatted"
            :selectedIndex="secondSelectedIndex"
            type="second"
            v-bind="props.scrollItemProps"
            :motion="props.motion"
            @select="onItemChange"
        />
    </ScrollList>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, unref } from 'vue';
import { format as dateFnsFormat } from 'date-fns';
import ScrollList from '../scrollList/ScrollList.vue';
import ScrollItem from '../scrollList/ScrollItem.vue';
import ComboboxFoundation, { formatOption } from '@douyinfe/semi-foundation/timePicker/ComboxFoundation';
import { strings } from '@douyinfe/semi-foundation/timePicker/constants';
import { useBaseComponent } from '../_utils/useBaseComponent';
import { useLocaleContext } from '../locale/context';
import type { ComboboxProps } from './interface';
import type { Item } from '../scrollList/interface';

const props = withDefaults(defineProps<ComboboxProps>(), {
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
    format: strings.DEFAULT_FORMAT,
});

const emit = defineEmits<{
    (e: 'change', value: { isAM: boolean; value: string; timeStampValue: number }): void;
    (e: 'currentSelectPanelChange', range: string): void;
}>();

const { adapter: baseAdapter } = useBaseComponent(props, {});
const localeContext = useLocaleContext();
const locale = computed(() => unref(localeContext));

const foundation = new ComboboxFoundation(baseAdapter);

const state = reactive({
    showHour: false,
    showMinute: false,
    showSecond: false,
    hourOptions: [] as number[],
    minuteOptions: [] as number[],
    secondOptions: [] as number[],
});

const initData = () => {
    const data = foundation.initData();
    Object.assign(state, data);
};

watch(
    () => [props.timeStampValue, props.format],
    () => {
        initData();
    }
);
const ampmOptions = computed(() => {
    const currentLocale = locale?.value?.TimePicker || { AM: '上午', PM: '下午' };
    return [
        { value: 'AM', text: currentLocale.AM || '上午' },
        { value: 'PM', text: currentLocale.PM || '下午' },
    ];
});

const hourOptionsFormatted = computed(() => {
    const disabledOptions = foundation.disabledHours();
    let options = state.hourOptions;
    if (props.use12Hours) {
        options = [12].concat(state.hourOptions.filter((h) => h < 12 && h > 0));
    }
    return options.map((option) => formatOption(option, disabledOptions));
});

const hourSelectedIndex = computed(() => {
    const value = foundation.getDisplayDateFromTimeStamp(props.timeStampValue);
    const hour = value.getHours();
    let hourAdj = hour;
    let options = state.hourOptions;
    if (props.use12Hours) {
        hourAdj = hour % 12 || 12;
        options = [12].concat(state.hourOptions.filter((h) => h < 12 && h > 0));
    }
    return options.indexOf(hourAdj);
});

const minuteOptionsFormatted = computed(() => {
    const value = foundation.getDisplayDateFromTimeStamp(props.timeStampValue);
    const disabledOptions = props.disabledMinutes && props.disabledMinutes(value.getHours());
    return state.minuteOptions.map((option) => formatOption(option, disabledOptions));
});

const minuteSelectedIndex = computed(() => {
    const value = foundation.getDisplayDateFromTimeStamp(props.timeStampValue);
    return state.minuteOptions.indexOf(value.getMinutes());
});

const secondOptionsFormatted = computed(() => {
    const value = foundation.getDisplayDateFromTimeStamp(props.timeStampValue);
    const disabledOptions = props.disabledSeconds && props.disabledSeconds(value.getHours(), value.getMinutes());
    return state.secondOptions.map((option) => formatOption(option, disabledOptions));
});

const secondSelectedIndex = computed(() => {
    const value = foundation.getDisplayDateFromTimeStamp(props.timeStampValue);
    return state.secondOptions.indexOf(value.getSeconds());
});

const transformHour = (value: string) => value + (locale?.value?.TimePicker?.hour || '');
const transformMinute = (value: string) => value + (locale?.value?.TimePicker?.minute || '');
const transformSecond = (value: string) => value + (locale?.value?.TimePicker?.second || '');
const onItemChange = (item: Item) => {
    const type = item.type;
    const value = item.value;

    const { use12Hours, format, timeStampValue } = props;
    let { isAM } = props;
    const transformValue = foundation.getDisplayDateFromTimeStamp(timeStampValue);
    // TODO: foundation
    if (type === 'hour') {
        if (use12Hours) {
            if (isAM) {
                transformValue.setHours(Number(value) % 12);
            } else {
                transformValue.setHours((Number(value) % 12) + 12);
            }
        } else {
            transformValue.setHours(Number(value));
        }
    } else if (type === 'minute') {
        transformValue.setMinutes(Number(value));
    } else if (type === 'ampm') {
        const ampm = String(value).toUpperCase();
        if (use12Hours) {
            if (ampm === 'PM') {
                isAM = false;
                transformValue.getHours() < 12 && transformValue.setHours((transformValue.getHours() % 12) + 12);
            }

            if (ampm === 'AM') {
                isAM = true;
                transformValue.getHours() >= 12 && transformValue.setHours(transformValue.getHours() - 12);
            }
        }
    } else {
        transformValue.setSeconds(Number(value));
    }

    emit('change', {
        isAM: Boolean(isAM),
        value: dateFnsFormat(transformValue, format && format.replace(/(\s+)A/g, '$1a')), // dateFns only supports "h: mm: ss a"
        timeStampValue: Number(transformValue),
    });
};

onMounted(() => {
    initData();
});
</script>

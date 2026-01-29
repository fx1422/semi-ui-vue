<template>
    <div :class="`${props.prefixCls}-input-wrap`">
        <Input
            v-bind="bindProps"
            ref="inputRef"
            hideSuffix
            :class="inputCls"
            :value="props.value"
            :placeholder="props.placeholder || (locale as any)?.placeholder?.[props.type || 'time']"
            :readonly="Boolean(props.inputReadOnly)"
            :validateStatus="mergeValidateStatus"
            :disabled="props.disabled"
            :insetLabel="props.insetLabel"
            @change="handleChange"
            @focus="handleFocus"
            @blur="handleBlur"
        >
            <template #suffix>
                <IconClock @click="handleClick" />
            </template>
        </Input>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    inheritAttrs: false,
});
import { ref, computed, onMounted, watch } from 'vue';
import classNames from 'classnames';
import { noop } from 'lodash-es';
import Input from '../input/Input.vue';
import InputFoundation from '@douyinfe/semi-foundation/timePicker/inputFoundation';
import { IconClock } from '../icons';
import { useBaseComponent } from '../_utils/useBaseComponent';
import { useLocaleContext } from '../locale/context';
import type { TimeInputProps } from './interface';
import type { TimeInputAdapter } from '@douyinfe/semi-foundation/timePicker/inputFoundation';

const props = withDefaults(defineProps<TimeInputProps>(), {
    borderless: false,
    inputReadOnly: false,
    onChange: noop,
    onBlur: noop,
    onFocus: noop,
    onClick: noop,
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
});

const emit = defineEmits<{
    (e: 'change', value: string): void;
    (e: 'focus', event: FocusEvent): void;
    (e: 'blur', event: FocusEvent): void;
    (e: 'click', event: MouseEvent): void;
}>();

const { adapter: baseAdapter } = useBaseComponent(props, {});
const locale = useLocaleContext();

const inputRef = ref<InstanceType<typeof Input> | null>(null);

const adapter: TimeInputAdapter = {
    ...baseAdapter,
    notifyChange: (...args) => {
        emit('change', ...args);
        props.onChange?.(...args);
    },
    notifyFocus: (...args) => {
        emit('focus', ...args);
        props.onFocus?.(...args);
    },
    notifyBlur: (...args) => {
        emit('blur', ...args);
        props.onBlur?.(...args);
    },
    getCache: (key: string) => {
        if (key === 'inputNode') {
            return inputRef.value?.inputRef;
        }
        return baseAdapter.getCache(key);
    },
    setCache: (key: string, value: any) => {
        baseAdapter.setCache(key, value);
    },
};

const foundation = new InputFoundation(adapter);

const inputCls = computed(() =>
    classNames(`${props.prefixCls}-input`, {
        [`${props.prefixCls}-input-invalid`]: props.invalid,
        [`${props.prefixCls}-input-readonly`]: props.inputReadOnly,
    })
);

const mergeValidateStatus = computed(() => (props.invalid ? 'error' : props.validateStatus));

const bindProps = computed(() => {
    const propsObj = { ...props };

    const excludeKeys = [
        'prefixCls',
        'placeholder',
        'inputReadOnly',
        'onFocus',
        'disabled',
        'type',
        'locale',
        'localeCode',
        'insetLabel',
        'validateStatus',
        'value',
        'onChange',
        'invalid',
        'format',
        'clearText',
        'disabledHours',
        'disabledMinutes',
        'disabledSeconds',
        'onEsc',
        'defaultOpenValue',
        'currentSelectPanel',
        'focusOnOpen',
        'timeStampValue',
        'timeZone',
        'defaultOpen',
        'defaultValue',
        'dateFnsLocale',
        'onChangeWithDateFirst',
        'onOpenChange',
        'autoAdjustOverflow',
        'popupClassName',
        'popupStyle',
        'zIndex',
        'getPopupContainer',
        'motion',
        'dropdownMargin',
        'stopPropagation',
        'triggerRender',
        'panels',
        'panelHeader',
        'panelFooter',
        'scrollItemProps',
        'hourStep',
        'minuteStep',
        'secondStep',
        'use12Hours',
        'hideDisabledOptions',
        'rangeSeparator',
    ];

    excludeKeys.forEach((key) => {
        delete propsObj[key as keyof TimeInputProps];
    });

    return propsObj;
});

const handleChange = (value: string | number, _e: Event) => {
    foundation.handleChange(String(value));
};

const handleFocus = (e: FocusEvent) => {
    foundation.handleFocus(e);
};

const handleBlur = (e: FocusEvent) => {
    foundation.handleBlur(e);
};

const handleClick = (e: MouseEvent) => {
    props.onClick?.(e);
};

onMounted(() => {
    const { focusOnOpen, preventScroll } = props;
    if (focusOnOpen) {
        const requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;
        requestAnimationFrame(() => {
            const inputNode = adapter.getCache('inputNode');
            if (inputNode) {
                inputNode.focus({ preventScroll });
                inputNode.select();
            }
        });
    }
});

watch(
    () => props.timeStampValue,
    (val, oldVal) => {
        if (val !== oldVal) {
            foundation.restoreCursor();
        }
    }
);

watch(
    () => props.value,
    (val, oldVal) => {
        if (val !== oldVal) {
            foundation.restoreCursor();
        }
    }
);

defineExpose({
    focus: () => {
        inputRef.value?.focus();
    },
    blur: () => {
        inputRef.value?.blur();
    },
});
</script>

<template>
    <div :class="slotCls" :x-label-pos="labelPosition" :style="props.style">
        <template v-if="!appendCol && !noLabel">
            <Label v-bind="mergeLabelProps" />
            <div :class="mainCls">
                <slot></slot>
                <ErrorMessage v-if="slotError" v-bind="slotErrorProps" />
            </div>
        </template>
        <template v-else-if="!appendCol && noLabel">
            <div :class="mainCls">
                <slot></slot>
                <ErrorMessage v-if="slotError" v-bind="slotErrorProps" />
            </div>
        </template>
        <template v-else-if="appendCol && labelPosition === 'top'">
            <div style="overflow: hidden">
                <Col v-bind="labelCol" :class="labelColCls">
                    <Label v-bind="mergeLabelProps" />
                </Col>
            </div>
            <Col>
                <slot></slot>
                <ErrorMessage v-if="slotError" v-bind="slotErrorProps" />
            </Col>
        </template>
        <template v-else-if="appendCol && labelPosition !== 'top'">
            <Col v-bind="labelCol" :class="labelColCls">
                <Label v-bind="mergeLabelProps" />
            </Col>
            <Col>
                <slot></slot>
                <ErrorMessage v-if="slotError" v-bind="slotErrorProps" />
            </Col>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import { isString, isNumber, isObject } from 'lodash-es';
import { useFormUpdater } from './hooks';
import Label, { type LabelProps } from './Label.vue';
import ErrorMessage, { type ErrorMessageProps } from './ErrorMessage.vue';
import { Col } from '../grid';

defineOptions({ name: 'SemiFormSlot', inheritAttrs: false });

export interface SlotProps {
    className?: string;
    style?: Record<string, any>;
    label?: LabelProps | string;
    noLabel?: boolean;
    labelPosition?: 'top' | 'left';
    error?: ErrorMessageProps | string;
}

const props = defineProps<SlotProps>();

const prefix = cssClasses.PREFIX;
const updater = useFormUpdater();

const formProps = computed(() =>
    updater.getFormProps(['labelPosition', 'labelWidth', 'labelAlign', 'labelCol', 'wrapperCol'])
);

const labelCol = computed(() => formProps.value.labelCol);
const wrapperCol = computed(() => formProps.value.wrapperCol);
const labelWidth = computed(() => formProps.value.labelWidth);
const labelAlign = computed(() => formProps.value.labelAlign);
const labelPosition = computed(() => props.labelPosition || formProps.value.labelPosition || 'top');

const appendCol = computed(() => labelCol.value && wrapperCol.value);

const slotCls = computed(() =>
    classNames(
        {
            [`${prefix}-field`]: true,
            [`${prefix}-slot`]: true,
        },
        props.className
    )
);

const labelColCls = computed(() =>
    classNames({
        [`${prefix}-col-${labelAlign.value}`]: true,
    })
);

const mainCls = computed(() =>
    classNames({
        [`${prefix}-field-main`]: true,
        [`${prefix}-slot-main`]: true,
    })
);

const normalizedLabel = computed(() => {
    const label = props.label;
    if (!label) return null;
    if (isObject(label) && !isString(label) && !isNumber(label)) {
        return label as LabelProps;
    }
    if (isString(label) || isNumber(label)) {
        return { text: String(label) } as LabelProps;
    }
    return { text: label } as LabelProps;
});

const mergeLabelProps = computed(() => ({
    align: labelAlign.value,
    width: labelWidth.value,
    ...normalizedLabel.value,
}));

const slotError = computed(() => {
    if (props.error === undefined) return null;
    if (isObject(props.error) && !isString(props.error) && !isNumber(props.error)) {
        return props.error as ErrorMessageProps;
    }
    if (isString(props.error) || isNumber(props.error)) {
        return { error: String(props.error) } as ErrorMessageProps;
    }
    return { error: props.error } as ErrorMessageProps;
});

const slotErrorProps = computed(() => slotError.value || {});
</script>

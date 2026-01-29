<template>
    <div :x-label-pos="labelPosition" :class="groupCls">
        <template v-if="!appendCol">
            <Label v-if="labelContent" v-bind="labelContent" />
            <div>
                <div v-if="extraText && extraTextPosition === 'middle'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
                <InputGroup v-bind="restProps" :disabled="formProps.disabled">
                    <slot></slot>
                </InputGroup>
                <div v-if="extraText && extraTextPosition === 'bottom'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
                <GroupError
                    :field-set="groupFieldSet"
                    :show-validate-icon="formProps.showValidateIcon"
                    :is-in-input-group="true"
                />
            </div>
        </template>
        <template v-else-if="appendCol && labelPosition === 'top'">
            <div style="overflow: hidden">
                <Col v-bind="labelCol" :class="labelColCls">
                    <Label v-if="labelContent" v-bind="labelContent" />
                </Col>
            </div>
            <Col v-bind="wrapperCol">
                <div v-if="extraText && extraTextPosition === 'middle'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
                <InputGroup v-bind="restProps" :disabled="formProps.disabled">
                    <slot></slot>
                </InputGroup>
                <div v-if="extraText && extraTextPosition === 'bottom'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
                <GroupError
                    :field-set="groupFieldSet"
                    :show-validate-icon="formProps.showValidateIcon"
                    :is-in-input-group="true"
                />
            </Col>
        </template>
        <template v-else-if="appendCol && labelPosition !== 'top'">
            <Col v-bind="labelCol" :class="labelColCls">
                <Label v-if="labelContent" v-bind="labelContent" />
            </Col>
            <Col v-bind="wrapperCol">
                <div v-if="extraText && extraTextPosition === 'middle'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
                <InputGroup v-bind="restProps" :disabled="formProps.disabled">
                    <slot></slot>
                </InputGroup>
                <div v-if="extraText && extraTextPosition === 'bottom'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
                <GroupError
                    :field-set="groupFieldSet"
                    :show-validate-icon="formProps.showValidateIcon"
                    :is-in-input-group="true"
                />
            </Col>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots, h, defineComponent, type PropType } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import { isValid } from '@douyinfe/semi-foundation/form/utils';
import * as ObjectUtil from '@douyinfe/semi-foundation/utils/object';
// use typeof checks instead of lodash isString for proper TS narrowing
import { useFormUpdater, useFormState } from './hooks';
import Label, { type LabelProps } from './Label.vue';
import ErrorMessage from './ErrorMessage.vue';
import InputGroup from '../input/InputGroup.vue';
import { Col } from '../grid';
import type { InputGroupProps as BasicInputGroupProps } from '../input/interface';

defineOptions({ name: 'SemiFormGroup', inheritAttrs: false });

export interface InputGroupProps extends BasicInputGroupProps {
    label?: LabelProps | string;
    labelPosition?: 'left' | 'top';
    extraText?: string;
    extraTextPosition?: 'bottom' | 'middle';
}

const props = withDefaults(defineProps<InputGroupProps>(), {
    extraTextPosition: 'bottom',
});

const slots = useSlots();
const prefix = cssClasses.PREFIX;
const updater = useFormUpdater();

const formProps = computed(() =>
    updater.getFormProps([
        'labelPosition',
        'labelWidth',
        'labelAlign',
        'showValidateIcon',
        'wrapperCol',
        'labelCol',
        'disabled',
    ])
);

const labelPosition = computed(() => props.labelPosition || formProps.value.labelPosition || 'top');
const labelCol = computed(() => formProps.value.labelCol);
const wrapperCol = computed(() => formProps.value.wrapperCol);
const labelAlign = computed(() => formProps.value.labelAlign);
const appendCol = computed(() => labelCol.value && wrapperCol.value);

const groupCls = computed(() =>
    classNames({
        [`${prefix}-field-group`]: true,
    })
);

const labelColCls = computed(() => (labelCol.value ? `${prefix}-col-${labelAlign.value}` : ''));

const labelContent = computed(() => {
    if (!props.label) return null;
    if (typeof props.label === 'string') {
        return { width: formProps.value.labelWidth, text: props.label } as LabelProps;
    }
    return { width: formProps.value.labelWidth, ...(props.label as LabelProps) } as LabelProps;
});

const groupFieldSet = computed(() => {
    const fields: string[] = [];
    if (slots.default) {
        const children = slots.default();
        children.forEach((child: any) => {
            if (child?.props?.field) {
                fields.push(child.props.field);
            }
        });
    }
    return fields;
});

const extraCls = computed(() =>
    classNames(`${prefix}-field-extra`, {
        [`${prefix}-field-extra-string`]: typeof props.extraText === 'string',
        [`${prefix}-field-extra-middle`]: props.extraTextPosition === 'middle',
        [`${prefix}-field-extra-bottom`]: props.extraTextPosition === 'bottom',
    })
);

const restProps = computed(() => {
    const {
        label: _label,
        labelPosition: _labelPosition,
        extraText: _extraText,
        extraTextPosition: _extraTextPosition,
        ...rest
    } = props;
    return rest;
});

const GroupError = defineComponent({
    name: 'GroupError',
    props: {
        fieldSet: {
            type: Array as PropType<string[]>,
            required: true,
        },
        showValidateIcon: Boolean,
        isInInputGroup: Boolean,
    },
    setup(props) {
        const formState = useFormState();
        const error = computed(() => {
            return props.fieldSet.map((field: string) => ObjectUtil.get(formState.errors, field));
        });

        const hasError = computed(() => !isValid(error.value));

        return () => {
            if (!hasError.value) {
                return null;
            }
            return h(ErrorMessage, {
                error: error.value,
                showValidateIcon: props.showValidateIcon,
                isInInputGroup: props.isInInputGroup,
            });
        };
    },
});
</script>

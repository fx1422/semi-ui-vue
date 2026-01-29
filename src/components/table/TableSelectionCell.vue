<template>
    <span :class="wrapCls">
        <Checkbox
            :checked="props.selected"
            :indeterminate="props.indeterminate"
            :disabled="props.disabled"
            :aria-label="props['aria-label']"
            v-bind="checkboxProps"
            @change="handleChange"
        />
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/table/constants';
import TableSelectionCellFoundation, {
    TableSelectionCellAdapter,
    TableSelectionCellEvent,
} from '@douyinfe/semi-foundation/table/tableSelectionCellFoundation';
import { useFoundation } from '../../_utils/useFoundation';
import Checkbox from '../checkbox';
import type { CheckboxEvent } from '../checkbox/interface';

defineOptions({
    name: 'SemiTableSelectionCell',
});

interface Props {
    columnTitle?: string;
    type?: string;
    onChange?: (checked: boolean, e: Event) => void;
    selected?: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
    prefixCls?: string;
    className?: string;
    // eslint-disable-next-line vue/prop-name-casing
    'aria-label'?: string;
    [key: string]: any; // 允许其他 checkbox props
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    prefixCls: cssClasses.PREFIX,
    onChange: () => {},
});

const adapter = {
    notifyChange: (checked: boolean, e: TableSelectionCellEvent) => {
        props.onChange(checked, e as Event);
    },
} as TableSelectionCellAdapter;

const { foundation } = useFoundation(TableSelectionCellFoundation, adapter);

const checkboxProps = computed(() => {
    // 从 props 中提取 checkbox 相关的属性，排除非 checkbox 属性
    const {
        columnTitle: _columnTitle,
        type: _type,
        onChange: _onChange,
        selected,
        disabled,
        indeterminate,
        prefixCls: _prefixCls,
        className: _className,
        'aria-label': ariaLabel,
        ...restProps
    } = props;
    // 这些变量仅用于从对象中排除，不需要使用
    void _columnTitle;
    void _type;
    void _onChange;
    void _prefixCls;
    void _className;

    return {
        disabled: disabled || false,
        indeterminate: indeterminate || false,
        checked: selected || false,
        'aria-label': ariaLabel,
        ...restProps, // 包含从 getCheckboxProps 返回的其他属性（如 name）
    };
});

const wrapCls = computed(() =>
    classnames(
        `${props.prefixCls}-selection-wrap`,
        {
            [`${props.prefixCls}-selection-disabled`]: props.disabled,
        },
        props.className
    )
);

const handleChange = (e: CheckboxEvent) => {
    foundation.handleChange(e as TableSelectionCellEvent);
};
</script>

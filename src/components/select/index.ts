import BaseSelect from './Select.vue';
import Option from './Option.vue';
import OptionGroup from './OptionGroup.vue';
import { defineComponent, h, inject } from 'vue';
import { FormUpdaterContextKey } from '../form/context';
import Field from '../form/FieldWrapper.vue';
import type { CommonFieldProps } from '../form/interface';

// 导入样式（自动引入）
import './select.scss';

export type { SelectProps, OptionProps, OptionGroupProps, SelectMethods } from './interface';

// 自动增强的 Select 组件
const Select = defineComponent({
    name: 'SemiSelect',
    inheritAttrs: false,
    setup(props, { attrs, slots }) {
        // 检查是否在 Form 内部
        const formUpdater = inject(FormUpdaterContextKey, null);

        // 如果提供了 field 属性且在 Form 内，自动包装 Field
        if (formUpdater && 'field' in attrs && attrs.field) {
            return () => {
                const fieldProps: CommonFieldProps = {
                    field: attrs.field as string,
                    label: attrs.label as CommonFieldProps['label'],
                    rules: attrs.rules as CommonFieldProps['rules'],
                    validate: attrs.validate as CommonFieldProps['validate'],
                    trigger: attrs.trigger as CommonFieldProps['trigger'],
                    initValue: attrs.initValue as CommonFieldProps['initValue'],
                    required: attrs.required as CommonFieldProps['required'],
                    labelPosition: attrs.labelPosition as CommonFieldProps['labelPosition'],
                    labelWidth: attrs.labelWidth as CommonFieldProps['labelWidth'],
                    labelAlign: attrs.labelAlign as CommonFieldProps['labelAlign'],
                    labelCol: attrs.labelCol as CommonFieldProps['labelCol'],
                    wrapperCol: attrs.wrapperCol as CommonFieldProps['wrapperCol'],
                    noLabel: attrs.noLabel as CommonFieldProps['noLabel'],
                    noErrorMessage: attrs.noErrorMessage as CommonFieldProps['noErrorMessage'],
                    helpText: attrs.helpText as CommonFieldProps['helpText'],
                    extraText: attrs.extraText as CommonFieldProps['extraText'],
                    extraTextPosition: attrs.extraTextPosition as CommonFieldProps['extraTextPosition'],
                    fieldClassName: attrs.fieldClassName as CommonFieldProps['fieldClassName'],
                    fieldStyle: attrs.fieldStyle as CommonFieldProps['fieldStyle'],
                    transform: attrs.transform as CommonFieldProps['transform'],
                    convert: attrs.convert as CommonFieldProps['convert'],
                    allowEmpty: attrs.allowEmpty as CommonFieldProps['allowEmpty'],
                    allowEmptyString: attrs.allowEmptyString as CommonFieldProps['allowEmptyString'],
                    emptyValue: attrs.emptyValue as CommonFieldProps['emptyValue'],
                    keepState: attrs.keepState as CommonFieldProps['keepState'],
                    validateStatus: attrs.validateStatus as CommonFieldProps['validateStatus'],
                    name: attrs.name as CommonFieldProps['name'],
                    id: attrs.id as CommonFieldProps['id'],
                };

                // 移除 field 相关 props，避免传给 Select
                const selectAttrs = { ...attrs };
                delete (selectAttrs as any).field;
                delete (selectAttrs as any).label;
                delete (selectAttrs as any).rules;
                delete (selectAttrs as any).validate;
                delete (selectAttrs as any).trigger;
                delete (selectAttrs as any).initValue;
                delete (selectAttrs as any).required;
                delete (selectAttrs as any).labelPosition;
                delete (selectAttrs as any).labelWidth;
                delete (selectAttrs as any).labelAlign;
                delete (selectAttrs as any).labelCol;
                delete (selectAttrs as any).wrapperCol;
                delete (selectAttrs as any).noLabel;
                delete (selectAttrs as any).noErrorMessage;
                delete (selectAttrs as any).helpText;
                delete (selectAttrs as any).extraText;
                delete (selectAttrs as any).extraTextPosition;
                delete (selectAttrs as any).fieldClassName;
                delete (selectAttrs as any).fieldStyle;
                delete (selectAttrs as any).transform;
                delete (selectAttrs as any).convert;
                delete (selectAttrs as any).allowEmpty;
                delete (selectAttrs as any).allowEmptyString;
                delete (selectAttrs as any).emptyValue;
                delete (selectAttrs as any).keepState;
                delete (selectAttrs as any).validateStatus;
                delete (selectAttrs as any).name; // name 和 id 由 fieldBindings 提供
                delete (selectAttrs as any).id;

                return h(Field, fieldProps, {
                    default: (fieldBindings: any) => {
                        // 合并 field 绑定和 select props
                        return h(
                            BaseSelect,
                            {
                                ...props,
                                ...selectAttrs,
                                ...fieldBindings,
                            },
                            slots
                        );
                    },
                });
            };
        }

        return () => h(BaseSelect, { ...props, ...attrs }, slots);
    },
});

const SelectNamespace = Select as typeof Select & {
    Option: typeof Option;
    OptGroup: typeof OptionGroup;
};

SelectNamespace.Option = Option;
SelectNamespace.OptGroup = OptionGroup;

export { Option, OptionGroup };
export default SelectNamespace;

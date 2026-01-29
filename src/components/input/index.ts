import BaseInput from './Input.vue';
import InputGroup from './InputGroup.vue';
import BaseTextArea from './TextArea.vue';
import { defineComponent, h, inject } from 'vue';
import { FormUpdaterContextKey } from '../form/context';
import Field from '../form/FieldWrapper.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './input.scss';

// 自动增强的 Input 组件
const Input = defineComponent({
    name: 'SemiInput',
    inheritAttrs: false,
    setup(props, { attrs, slots }) {
        // 检查是否在 Form 内部
        const formUpdater = inject(FormUpdaterContextKey, null);

        // 如果提供了 field 属性且在 Form 内，自动包装 Field
        if (formUpdater && 'field' in attrs && attrs.field) {
            return () => {
                // Vue attrs 中 kebab-case 和 camelCase 都可能存在，需要兼容处理
                const getAttr = (key: string) => {
                    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    return (attrs as any)[key] ?? (attrs as any)[kebabKey];
                };

                const fieldProps = {
                    field: getAttr('field'),
                    label: getAttr('label'),
                    rules: getAttr('rules'),
                    validate: getAttr('validate'),
                    trigger: getAttr('trigger'),
                    initValue: getAttr('initValue'),
                    required: getAttr('required'),
                    labelPosition: getAttr('labelPosition'),
                    labelWidth: getAttr('labelWidth'),
                    labelAlign: getAttr('labelAlign'),
                    labelCol: getAttr('labelCol'),
                    wrapperCol: getAttr('wrapperCol'),
                    noLabel: getAttr('noLabel'),
                    noErrorMessage: getAttr('noErrorMessage'),
                    helpText: getAttr('helpText'),
                    extraText: getAttr('extraText'),
                    extraTextPosition: getAttr('extraTextPosition'),
                    fieldClassName: getAttr('fieldClassName'),
                    fieldStyle: getAttr('fieldStyle'),
                    transform: getAttr('transform'),
                    convert: getAttr('convert'),
                    allowEmpty: getAttr('allowEmpty'),
                    allowEmptyString: getAttr('allowEmptyString'),
                    emptyValue: getAttr('emptyValue'),
                    keepState: getAttr('keepState'),
                    validateStatus: getAttr('validateStatus'),
                    name: getAttr('name'),
                    id: getAttr('id'),
                };

                // 移除 field 相关 props，避免传给 Input（需要同时删除 camelCase 和 kebab-case）
                const inputAttrs = { ...attrs };
                const removeAttr = (key: string) => {
                    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    delete (inputAttrs as any)[key];
                    delete (inputAttrs as any)[kebabKey];
                };

                removeAttr('field');
                removeAttr('label');
                removeAttr('rules');
                removeAttr('validate');
                removeAttr('trigger');
                removeAttr('initValue');
                removeAttr('required');
                removeAttr('labelPosition');
                removeAttr('labelWidth');
                removeAttr('labelAlign');
                removeAttr('labelCol');
                removeAttr('wrapperCol');
                removeAttr('noLabel');
                removeAttr('noErrorMessage');
                removeAttr('helpText');
                removeAttr('extraText');
                removeAttr('extraTextPosition');
                removeAttr('fieldClassName');
                removeAttr('fieldStyle');
                removeAttr('transform');
                removeAttr('convert');
                removeAttr('allowEmpty');
                removeAttr('allowEmptyString');
                removeAttr('emptyValue');
                removeAttr('keepState');
                removeAttr('validateStatus');
                removeAttr('name'); // name 和 id 由 fieldBindings 提供
                removeAttr('id');

                return h(Field, fieldProps, {
                    default: (fieldBindings: any) => {
                        // 合并 field 绑定和 input props
                        return h(
                            BaseInput,
                            {
                                ...props,
                                ...inputAttrs,
                                ...fieldBindings,
                            },
                            slots
                        );
                    },
                });
            };
        }

        // 否则直接渲染原始 Input
        return () => h(BaseInput, { ...props, ...attrs }, slots);
    },
});

const TextArea = createFieldEnhancer(BaseTextArea, 'SemiTextArea');

export { Input, InputGroup, TextArea };
export type {
    InputProps,
    InputGroupProps,
    TextAreaProps,
    InputSize,
    InputMode,
    ValidateStatus,
    AutosizeRow,
} from './interface';
export default Input;

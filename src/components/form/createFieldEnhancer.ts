import { defineComponent, h, inject, type Component } from 'vue';
import { FormUpdaterContextKey } from './context';
import Field from './FieldWrapper.vue';

export function createFieldEnhancer(BaseComponent: Component, componentName: string) {
    return defineComponent({
        name: componentName,
        inheritAttrs: false,
        setup(props, { attrs, slots }) {
            const formUpdater = inject(FormUpdaterContextKey, null);

            if (formUpdater && 'field' in attrs && attrs.field) {
                return () => {
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

                    const componentAttrs = { ...attrs };
                    const removeAttr = (key: string) => {
                        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                        delete (componentAttrs as any)[key];
                        delete (componentAttrs as any)[kebabKey];
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
                    removeAttr('name');
                    removeAttr('id');

                    return h(Field, fieldProps, {
                        default: (fieldBindings: any) => {
                            return h(
                                BaseComponent,
                                {
                                    ...componentAttrs,
                                    ...fieldBindings,
                                },
                                slots
                            );
                        },
                    });
                };
            }

            return () => h(BaseComponent, { ...attrs }, slots);
        },
    });
}

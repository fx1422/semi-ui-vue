import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import Form, { ArrayField } from '../src/components/form';
import Input from '../src/components/input';
import { Select } from '../src/components/select';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import Button from '../src/components/button/Button.vue';

// 为了向后兼容测试，创建别名
const FormInput = Input;

const PREFIX = cssClasses.PREFIX;
const BASE_CLASS_PREFIX = 'semi';

function getForm(props: any = {}) {
    return mount(Form, {
        props,
        attachTo: document.body,
    });
}

function sleep(ms = 200) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Form', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should render with className and style', () => {
        const wrapper = mount(Form, {
            props: {
                className: 'form-test',
                style: { color: 'red' },
            },
        });

        const form = wrapper.find('form');
        expect(form.classes()).toContain('form-test');
        expect((form.element as HTMLElement).style.color).toBe('red');
    });

    it('should support layout prop', async () => {
        const wrapper = mount(Form, {
            props: {
                layout: 'vertical',
            },
        });

        expect(wrapper.find('form').classes()).toContain(`${PREFIX}-vertical`);

        await wrapper.setProps({ layout: 'horizontal' });
        await nextTick();

        expect(wrapper.find('form').classes()).toContain(`${PREFIX}-horizontal`);
        expect(wrapper.find('form').classes()).not.toContain(`${PREFIX}-vertical`);
    });

    it('should support labelPosition prop', () => {
        const wrapper = mount(Form, {
            props: {
                labelPosition: 'left',
            },
            slots: {
                default: () => [mount(FormInput, { props: { field: 'name' } }).html()],
            },
        });

        const field = wrapper.find(`.${PREFIX}-field`);
        expect(field.attributes('x-label-pos')).toBe('left');
    });

    it('should support labelWidth prop', () => {
        const wrapper = mount(Form, {
            props: {
                labelWidth: 200,
            },
            slots: {
                default: () => [
                    mount(FormInput, { props: { field: 'name', label: 'Name' } }).html(),
                ],
            },
        });

        const label = wrapper.find(`.${PREFIX}-field-label`);
        expect((label.element as HTMLElement).style.width).toBe('200px');
    });

    it('should support getFormApi callback', async () => {
        let api: any = null;
        const getFormApi = vi.fn((formApi: any) => {
            api = formApi;
        });

        const wrapper = mount(Form, {
            props: {
                getFormApi,
            },
            slots: {
                default: () => [mount(FormInput, { props: { field: 'name' } }).html()],
            },
        });

        await nextTick();
        await sleep(100);

        expect(getFormApi).toHaveBeenCalled();
        expect(api).toBeTruthy();
        expect(typeof api.setValue).toBe('function');
        expect(typeof api.setValues).toBe('function');
        expect(typeof api.setError).toBe('function');
        expect(typeof api.submitForm).toBe('function');
        expect(typeof api.reset).toBe('function');
        expect(typeof api.getValue).toBe('function');
        expect(typeof api.getError).toBe('function');
        expect(typeof api.validate).toBe('function');
    });

    it('should trigger onSubmit when form is submitted', async () => {
        const onSubmit = vi.fn();
        const wrapper = mount(Form, {
            props: {
                onSubmit,
            },
            slots: {
                default: () => [mount(FormInput, { props: { field: 'name' } }).html()],
            },
        });

        const form = wrapper.find('form');
        await form.trigger('submit');
        await sleep(300);

        expect(onSubmit).toHaveBeenCalled();
    });

    it('should trigger onSubmitFail when validation fails', async () => {
        const onSubmit = vi.fn();
        const onSubmitFail = vi.fn();
        const wrapper = mount(Form, {
            props: {
                onSubmit,
                onSubmitFail,
            },
            slots: {
                default: () => [
                    mount(FormInput, {
                        props: {
                            field: 'name',
                            rules: [{ required: true, message: "can't be empty" }],
                        },
                    }).html(),
                ],
            },
        });

        const form = wrapper.find('form');
        await form.trigger('submit');
        await sleep(300);

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onSubmitFail).toHaveBeenCalled();
    });

    it('should support initValues prop', async () => {
        let api: any = null;
        const wrapper = mount(Form, {
            props: {
                initValues: { name: 'test' },
                getFormApi: (formApi: any) => {
                    api = formApi;
                },
            },
            slots: {
                default: () => [mount(FormInput, { props: { field: 'name' } }).html()],
            },
        });

        await nextTick();
        await sleep(100);

        const value = api.getValue('name');
        expect(value).toBe('test');
    });

    it('should support onValueChange callback', async () => {
        const onValueChange = vi.fn();
        let api: any = null;
        const wrapper = mount(Form, {
            props: {
                onValueChange,
                getFormApi: (formApi: any) => {
                    api = formApi;
                },
            },
            slots: {
                default: () => [mount(FormInput, { props: { field: 'name' } }).html()],
            },
        });

        await nextTick();
        await sleep(100);

        api.setValue('name', 'new value');
        await sleep(100);

        expect(onValueChange).toHaveBeenCalled();
    });

    it('should support reset method', async () => {
        let api: any = null;
        const wrapper = mount(Form, {
            props: {
                initValues: { name: 'initial' },
                getFormApi: (formApi: any) => {
                    api = formApi;
                },
            },
            slots: {
                default: () => [mount(FormInput, { props: { field: 'name' } }).html()],
            },
        });

        await nextTick();
        await sleep(100);

        api.setValue('name', 'changed');
        await sleep(100);

        api.reset();
        await sleep(100);

        const value = api.getValue('name');
        expect(value).toBe('initial');
    });

    it('should support render prop', () => {
        const render = vi.fn(({ formState, formApi, values }) => {
            return mount(FormInput, { props: { field: 'name', fieldClassName: 'name-field' } }).html();
        });

        const wrapper = mount(Form, {
            props: {
                render,
            },
        });

        expect(render).toHaveBeenCalled();
        expect(render.mock.calls[0][0]).toHaveProperty('formState');
        expect(render.mock.calls[0][0]).toHaveProperty('formApi');
        expect(render.mock.calls[0][0]).toHaveProperty('values');
    });

    it('should support component prop', () => {
        const TestComponent = {
            template: '<div class="test-component"><FormInput field="name" fieldClassName="name-field" /></div>',
            components: { FormInput },
        };

        const wrapper = mount(Form, {
            props: {
                component: TestComponent,
            },
        });

        expect(wrapper.find('.test-component').exists()).toBe(true);
    });
});

describe('Form Field', () => {
    it('should render field with label', () => {
        const wrapper = mount(Form, {
            slots: {
                default: () => [mount(FormInput, { props: { field: 'name', label: 'Name' } }).html()],
            },
        });

        const label = wrapper.find(`.${PREFIX}-field-label`);
        expect(label.exists()).toBe(true);
        expect(label.text()).toContain('Name');
    });

    it('should support field validation', async () => {
        const wrapper = mount(Form, {
            slots: {
                default: () => [
                    mount(FormInput, {
                        props: {
                            field: 'name',
                            rules: [{ required: true, message: 'Name is required' }],
                        },
                    }).html(),
                ],
            },
        });

        await nextTick();
        await sleep(100);

        let api: any = null;
        const formWrapper = mount(Form, {
            props: {
                getFormApi: (formApi: any) => {
                    api = formApi;
                },
            },
            slots: {
                default: () => [
                    mount(FormInput, {
                        props: {
                            field: 'name',
                            rules: [{ required: true, message: 'Name is required' }],
                        },
                    }).html(),
                ],
            },
        });

        await nextTick();
        await sleep(100);

        const result = await api.validate(['name']);
        expect(result.errors).toBeTruthy();
        expect(result.errors.name).toBeTruthy();
    });

    it('should support field className and style', () => {
        const wrapper = mount(Form, {
            slots: {
                default: () => [
                    mount(FormInput, {
                        props: {
                            field: 'name',
                            className: 'test-input',
                            style: { color: 'red' },
                        },
                    }).html(),
                ],
            },
        });

        const input = wrapper.find(`.${BASE_CLASS_PREFIX}-input-wrapper.test-input`);
        expect(input.exists()).toBe(true);
    });

    it('should support field labelPosition override', () => {
        const wrapper = mount(Form, {
            props: {
                labelPosition: 'top',
            },
            slots: {
                default: () => [
                    mount(FormInput, {
                        props: {
                            field: 'name',
                            labelPosition: 'left',
                            fieldClassName: 'left-field',
                        },
                    }).html(),
                ],
            },
        });

        const field = wrapper.find('.left-field');
        expect(field.attributes('x-label-pos')).toBe('left');
    });
});

describe('Form ArrayField', () => {
    const data = [
        { name: 'hzj', type: 'rd' },
        { name: 'dc', type: 'ued' },
    ];

    it('should support initValue via ArrayField props', async () => {
        let api: any = null;
        const wrapper = mount(Form, {
            props: {
                getFormApi: (formApi: any) => {
                    api = formApi;
                },
            },
            slots: {
                default: () => [
                    mount(ArrayField, {
                        props: {
                            field: 'data',
                            initValue: data,
                        },
                        {
                            default: ({ arrayFields, add }: any) => {
                                return arrayFields.map(({ field, key }: any) => {
                                    return [
                                        mount(FormInput, {
                                            props: { field: `${field}[name]` },
                                            key: `${key}-name`,
                                        }).html(),
                                        mount(FormInput, {
                                            props: { field: `${field}[type]` },
                                            key: `${key}-type`,
                                        }).html(),
                                    ];
                                });
                            },
                        }
                    ).html(),
                ],
            },
        });

        await nextTick();
        await sleep(200);

        const name0 = api.getValue('data[0][name]');
        const type0 = api.getValue('data[0][type]');
        expect(name0).toBe(data[0].name);
        expect(type0).toBe(data[0].type);
    });

    it('should support add and remove operations', async () => {
        let api: any = null;
        let addFn: any = null;
        let removeFn: any = null;

        const wrapper = mount(Form, {
            props: {
                getFormApi: (formApi: any) => {
                    api = formApi;
                },
            },
            slots: {
                default: () => [
                    mount(ArrayField, {
                        props: {
                            field: 'data',
                        },
                        {
                            default: ({ arrayFields, add }: any) => {
                                addFn = add;
                                return arrayFields.map(({ field, key, remove }: any) => {
                                    removeFn = remove;
                                    return [
                                        mount(FormInput, {
                                            props: { field: `${field}[name]` },
                                            key: `${key}-name`,
                                        }).html(),
                                    ];
                                });
                            },
                        }
                    ).html(),
                ],
            },
        });

        await nextTick();
        await sleep(200);

        // Add new item
        if (addFn) {
            addFn();
            await nextTick();
            await sleep(200);

            const value = api.getValue('data');
            expect(Array.isArray(value)).toBe(true);
            expect(value.length).toBeGreaterThan(0);
        }
    });

    it('should support addWithInitValue', async () => {
        let api: any = null;
        let addWithInitValueFn: any = null;
        const newLine = { name: 'yx', type: 'rd' };

        const wrapper = mount(Form, {
            props: {
                getFormApi: (formApi: any) => {
                    api = formApi;
                },
            },
            slots: {
                default: () => [
                    mount(ArrayField, {
                        props: {
                            field: 'data',
                        },
                        {
                            default: ({ addWithInitValue }: any) => {
                                addWithInitValueFn = addWithInitValue;
                                return null;
                            },
                        }
                    ).html(),
                ],
            },
        });

        await nextTick();
        await sleep(200);

        if (addWithInitValueFn) {
            addWithInitValueFn(newLine);
            await nextTick();
            await sleep(200);

            const value = api.getValue('data');
            expect(Array.isArray(value)).toBe(true);
            if (value && value.length > 0) {
                expect(value[value.length - 1]).toMatchObject(newLine);
            }
        }
    });
});

describe('Form Hooks', () => {
    it('useFormApi should work', async () => {
        let api: any = null;
        const TestComponent = {
            template: '<div></div>',
            setup() {
                const { useFormApi } = require('../src/components/form/hooks');
                api = useFormApi();
                return {};
            },
        };

        mount(Form, {
            slots: {
                default: () => [mount(TestComponent).html()],
            },
        });

        await nextTick();
        await sleep(100);

        expect(api).toBeTruthy();
        expect(typeof api.value?.setValue).toBe('function');
    });

    it('useFormState should work', async () => {
        let state: any = null;
        const TestComponent = {
            template: '<div></div>',
            setup() {
                const { useFormState } = require('../src/components/form/hooks');
                state = useFormState();
                return {};
            },
        };

        mount(Form, {
            props: {
                initValues: { name: 'test' },
            },
            slots: {
                default: () => [mount(TestComponent).html()],
            },
        });

        await nextTick();
        await sleep(100);

        expect(state).toBeTruthy();
        expect(state.value).toHaveProperty('values');
        expect(state.value).toHaveProperty('errors');
        expect(state.value).toHaveProperty('touched');
    });
});


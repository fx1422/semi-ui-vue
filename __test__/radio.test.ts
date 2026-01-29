import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Radio from '../src/components/radio/Radio.vue';
import RadioGroup from '../src/components/radio/RadioGroup.vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

describe('Radio', () => {
    it('radio should work basically', () => {
        const wrapper = mount(Radio);
        const input = wrapper.find('input');

        expect(input.exists()).toBe(true);
        expect(input.element.checked).toBe(false);
        expect(input.element.disabled).toBe(false);
    });

    it('radio default checked', () => {
        const wrapper = mount(Radio, {
            props: {
                defaultChecked: true,
            },
        });

        const input = wrapper.find('input');
        expect(input.element.checked).toBe(true);
    });

    it('radio default disabled', () => {
        const wrapper = mount(Radio, {
            props: {
                disabled: true,
            },
        });

        const input = wrapper.find('input');
        expect(input.element.disabled).toBe(true);
    });

    it('radio onChange', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Radio, {
            props: {
                onChange,
            },
        });

        const input = wrapper.find('input');
        await input.setValue(true);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].target.checked).toBe(true);
    });

    it('radio advanced mode', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Radio, {
            props: {
                mode: 'advanced',
                onChange,
            },
            slots: {
                default: '允许取消选择',
            },
        });

        const input = wrapper.find('input');

        // Check
        await input.setValue(true);
        expect(onChange).toHaveBeenCalled();

        // Uncheck
        await input.setValue(false);
        expect(onChange).toHaveBeenCalled();
    });

    it('radio button style', () => {
        const wrapper = mount(Radio, {
            props: {
                type: 'button',
            },
        });

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-radio-buttonRadioComponent`).exists()).toBe(true);
    });

    it('radio with children and extra', () => {
        const wrapper = mount(Radio, {
            props: {
                extra: 'Extra content',
            },
            slots: {
                default: 'Radio Label',
            },
        });

        expect(wrapper.text()).toContain('Radio Label');
        expect(wrapper.text()).toContain('Extra content');
    });

    it('radio v-model:checked', async () => {
        const wrapper = mount({
            template: '<Radio v-model:checked="checked" />',
            components: { Radio },
            data() {
                return {
                    checked: false,
                };
            },
        });

        expect(wrapper.vm.checked).toBe(false);

        const input = wrapper.find('input');
        await input.setValue(true);

        expect(wrapper.vm.checked).toBe(true);
    });
});

describe('RadioGroup', () => {
    function createRadioGroup(props = {}, children = null) {
        return mount(RadioGroup, {
            props,
            slots: {
                default: children || `
                    <Radio value="A">A</Radio>
                    <Radio value="B">B</Radio>
                    <Radio value="C">C</Radio>
                `,
            },
            global: {
                components: { Radio },
            },
        });
    }

    it('fire change events when value changes', async () => {
        const onChange = vi.fn();

        const wrapper = mount(RadioGroup, {
            props: {
                onChange,
            },
            slots: {
                default: `
                    <Radio value="A">A</Radio>
                    <Radio value="B">B</Radio>
                    <Radio value="C">C</Radio>
                `,
            },
            global: {
                components: { Radio },
            },
        });

        const inputs = wrapper.findAll('input');

        // Trigger change
        await inputs[0].setValue(true);
        expect(onChange).toHaveBeenCalledTimes(1);

        await inputs[1].setValue(true);
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('both of radio and radioGroup will trigger onchange event when they exists', async () => {
        const onChangeRadio = vi.fn();
        const onChangeGroup = vi.fn();

        const wrapper = mount({
            template: `
                <RadioGroup @change="onChangeGroup">
                    <Radio value="A" @change="onChangeRadio">A</Radio>
                    <Radio value="B" @change="onChangeRadio">B</Radio>
                    <Radio value="C" @change="onChangeRadio">C</Radio>
                </RadioGroup>
            `,
            components: { RadioGroup, Radio },
            setup() {
                return {
                    onChangeRadio,
                    onChangeGroup,
                };
            },
        });

        const inputs = wrapper.findAll('input');

        await inputs[0].setValue(true);
        expect(onChangeRadio).toHaveBeenCalledTimes(1);
        expect(onChangeGroup).toHaveBeenCalledTimes(1);

        await inputs[1].setValue(true);
        expect(onChangeRadio).toHaveBeenCalledTimes(2);
        expect(onChangeGroup).toHaveBeenCalledTimes(2);
    });

    it('should only trigger once when in group with options', async () => {
        const onChange = vi.fn();
        const options = [{ label: 'Bamboo', value: 'Bamboo' }];

        const wrapper = mount(RadioGroup, {
            props: {
                options,
                onChange,
            },
        });

        const input = wrapper.find('input');
        await input.setValue(true);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('RadioGroup with options', () => {
        const options = [
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
            { label: 'C', value: 'C' },
        ];

        const wrapper = mount(RadioGroup, {
            props: {
                options,
            },
        });

        const inputs = wrapper.findAll('input');
        expect(inputs).toHaveLength(3);
    });

    it('RadioGroup disabled', () => {
        const wrapper = mount(RadioGroup, {
            props: {
                disabled: true,
            },
            slots: {
                default: `
                    <Radio value="A">A</Radio>
                    <Radio value="B">B</Radio>
                `,
            },
            global: {
                components: { Radio },
            },
        });

        const inputs = wrapper.findAll('input');
        inputs.forEach((input) => {
            expect(input.element.disabled).toBe(true);
        });
    });

    it('RadioGroup v-model:value', async () => {
        const wrapper = mount({
            template: '<RadioGroup v-model:value="value" :options="options" />',
            components: { RadioGroup },
            data() {
                return {
                    value: 'A',
                    options: [
                        { label: 'A', value: 'A' },
                        { label: 'B', value: 'B' },
                        { label: 'C', value: 'C' },
                    ],
                };
            },
        });

        expect(wrapper.vm.value).toBe('A');

        const inputs = wrapper.findAll('input');
        await inputs[1].setValue(true);

        expect(wrapper.vm.value).toBe('B');
    });

    it('RadioGroup direction', () => {
        const wrapper = mount(RadioGroup, {
            props: {
                direction: 'vertical',
                options: ['A', 'B', 'C'],
            },
        });

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-radioGroup-vertical`).exists()).toBe(true);
    });

    it('RadioGroup type button', () => {
        const wrapper = mount(RadioGroup, {
            props: {
                type: 'button',
                options: ['A', 'B', 'C'],
            },
        });

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-radioGroup-buttonRadio`).exists()).toBe(true);
    });

    it('RadioGroup type card', () => {
        const wrapper = mount(RadioGroup, {
            props: {
                type: 'card',
                options: ['A', 'B', 'C'],
            },
        });

        const radios = wrapper.findAll(`.${BASE_CLASS_PREFIX}-radio-cardRadioGroup`);
        expect(radios.length).toBeGreaterThan(0);
    });

    it('RadioGroup external state change', async () => {
        const wrapper = mount({
            template: `
                <div>
                    <RadioGroup v-model:value="value" :options="options" />
                    <button @click="changeValue">Change</button>
                </div>
            `,
            components: { RadioGroup },
            data() {
                return {
                    value: 'A',
                    options: [
                        { label: 'A', value: 'A' },
                        { label: 'B', value: 'B' },
                        { label: 'C', value: 'C' },
                    ],
                };
            },
            methods: {
                changeValue() {
                    this.value = 'B';
                },
            },
        });

        expect(wrapper.vm.value).toBe('A');

        const button = wrapper.find('button');
        await button.trigger('click');

        expect(wrapper.vm.value).toBe('B');

        // Check if the correct radio is checked
        const inputs = wrapper.findAll('input');
        expect(inputs[1].element.checked).toBe(true);
    });
});


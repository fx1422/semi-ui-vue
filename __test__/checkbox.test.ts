import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import Checkbox from '../src/components/checkbox';

const { CheckboxGroup } = Checkbox;

describe('Checkbox', () => {
    it('renders with default props', () => {
        const wrapper = mount(Checkbox, {
            slots: {
                default: 'Semi Design',
            },
        });
        expect(wrapper.find('.semi-checkbox').exists()).toBe(true);
        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    });

    it('className and style', () => {
        const wrapper = mount(Checkbox, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
            slots: {
                default: 'Semi Design',
            },
        });
        expect(wrapper.find('.semi-checkbox.test').exists()).toBe(true);
        const element = wrapper.find('.semi-checkbox.test').element as HTMLElement;
        expect(element.style.color).toBe('red');
    });

    it('defaultChecked', () => {
        const wrapper = mount(Checkbox, {
            props: {
                defaultChecked: true,
            },
            slots: {
                default: 'Semi Design',
            },
        });
        const input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(true);
        expect(wrapper.find('.semi-checkbox-inner-checked').exists()).toBe(true);
    });

    it('checked - controlled mode', async () => {
        const wrapper = mount(Checkbox, {
            props: {
                checked: true,
            },
            slots: {
                default: 'Semi Design',
            },
        });

        let input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(true);
        expect(wrapper.find('.semi-checkbox-inner-checked').exists()).toBe(true);

        await wrapper.setProps({ checked: false });
        await nextTick();

        input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(false);
        expect(wrapper.find('.semi-checkbox-inner-checked').exists()).toBe(false);

        await wrapper.setProps({ checked: true });
        await nextTick();

        input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(true);
        expect(wrapper.find('.semi-checkbox-inner-checked').exists()).toBe(true);

        // Reset case
        await wrapper.setProps({ checked: undefined });
        await nextTick();

        input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(false);
        expect(wrapper.find('.semi-checkbox-inner-checked').exists()).toBe(false);
    });

    it('v-model:checked - two-way binding', async () => {
        const checked = ref(false);
        const wrapper = mount({
            components: { Checkbox },
            template: '<Checkbox v-model:checked="checked">Checkbox</Checkbox>',
            setup() {
                return { checked };
            },
        });

        let input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(false);

        // Click to change checked
        await wrapper.find('.semi-checkbox').trigger('click');
        await nextTick();

        input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(true);
        expect(checked.value).toBe(true);

        // Change from outside
        checked.value = false;
        await nextTick();

        input = wrapper.find('input').element as HTMLInputElement;
        expect(input.checked).toBe(false);
    });

    it('disabled', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Checkbox, {
            props: {
                disabled: true,
            },
            slots: {
                default: 'Semi Design',
            },
        });

        expect(wrapper.find('.semi-checkbox-disabled').exists()).toBe(true);

        const input = wrapper.find('input').element as HTMLInputElement;
        expect(input.disabled).toBe(true);
    });

    it('onChange event', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Checkbox, {
            props: {
                onChange,
            },
            slots: {
                default: 'Semi Design',
            },
        });

        await wrapper.find('.semi-checkbox').trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalled();
        const event = onChange.mock.calls[0][0];
        expect(event.target.checked).toBe(true);

        await wrapper.find('.semi-checkbox').trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledTimes(2);
        const event2 = onChange.mock.calls[1][0];
        expect(event2.target.checked).toBe(false);
    });

    it('extra prop', () => {
        const extraText = 'Extra information';
        const wrapper = mount(Checkbox, {
            props: {
                extra: extraText,
            },
            slots: {
                default: 'Semi Design',
            },
        });

        expect(wrapper.find('.semi-checkbox-extra').exists()).toBe(true);
        expect(wrapper.find('.semi-checkbox-extra').text()).toBe(extraText);
    });

    it('indeterminate state', () => {
        const wrapper = mount(Checkbox, {
            props: {
                indeterminate: true,
            },
            slots: {
                default: 'Semi Design',
            },
        });

        expect(wrapper.find('.semi-checkbox-indeterminate').exists()).toBe(true);
    });

    it('focus and blur methods', () => {
        const wrapper = mount(Checkbox, {
            slots: {
                default: 'Semi Design',
            },
        });

        const vm = wrapper.vm as any;
        expect(typeof vm.focus).toBe('function');
        expect(typeof vm.blur).toBe('function');

        // Test focus - just verify the methods exist and can be called
        expect(() => vm.focus()).not.toThrow();
        expect(() => vm.blur()).not.toThrow();
    });
});

describe('CheckboxGroup', () => {
    it('renders with options', () => {
        const options = ['Option 1', 'Option 2', 'Option 3'];
        const wrapper = mount(CheckboxGroup, {
            props: {
                options,
            },
        });

        expect(wrapper.findAll('.semi-checkbox').length).toBe(3);
        expect(wrapper.text()).toContain('Option 1');
        expect(wrapper.text()).toContain('Option 2');
        expect(wrapper.text()).toContain('Option 3');
    });

    it('defaultValue', () => {
        const options = ['A', 'B', 'C'];
        const wrapper = mount(CheckboxGroup, {
            props: {
                options,
                defaultValue: ['A', 'C'],
            },
        });

        const checkboxes = wrapper.findAll('input[type="checkbox"]');
        expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true);
        expect((checkboxes[1].element as HTMLInputElement).checked).toBe(false);
        expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true);
    });

    it('controlled value', async () => {
        const options = ['A', 'B', 'C'];
        const wrapper = mount(CheckboxGroup, {
            props: {
                options,
                value: ['A'],
            },
        });

        let checkboxes = wrapper.findAll('input[type="checkbox"]');
        expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true);
        expect((checkboxes[1].element as HTMLInputElement).checked).toBe(false);

        await wrapper.setProps({ value: ['B', 'C'] });
        await nextTick();

        checkboxes = wrapper.findAll('input[type="checkbox"]');
        expect((checkboxes[0].element as HTMLInputElement).checked).toBe(false);
        expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true);
        expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true);
    });

    it('onChange event', async () => {
        const onChange = vi.fn();
        const options = ['A', 'B', 'C'];
        const wrapper = mount(CheckboxGroup, {
            props: {
                options,
            },
        });

        wrapper.vm.$on('change', onChange);

        await wrapper.findAll('.semi-checkbox')[0].trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalled();
        const value = onChange.mock.calls[0][0];
        expect(value).toEqual(['A']);

        await wrapper.findAll('.semi-checkbox')[1].trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledTimes(2);
        const value2 = onChange.mock.calls[1][0];
        expect(value2).toEqual(['A', 'B']);
    });

    it('disabled group', () => {
        const options = ['A', 'B', 'C'];
        const wrapper = mount(CheckboxGroup, {
            props: {
                options,
                disabled: true,
            },
        });

        const checkboxes = wrapper.findAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            expect((checkbox.element as HTMLInputElement).disabled).toBe(true);
        });
    });

    it('direction prop', () => {
        const options = ['A', 'B'];
        const wrapperVertical = mount(CheckboxGroup, {
            props: {
                options,
                direction: 'vertical',
            },
        });

        expect(wrapperVertical.find('.semi-checkboxGroup-vertical').exists()).toBe(true);

        const wrapperHorizontal = mount(CheckboxGroup, {
            props: {
                options,
                direction: 'horizontal',
            },
        });

        expect(wrapperHorizontal.find('.semi-checkboxGroup-horizontal').exists()).toBe(true);
    });

    it('options with objects', () => {
        const options = [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b', disabled: true },
            { label: 'Option C', value: 'c', extra: 'Extra info' },
        ];
        const wrapper = mount(CheckboxGroup, {
            props: {
                options,
            },
        });

        expect(wrapper.text()).toContain('Option A');
        expect(wrapper.text()).toContain('Option B');
        expect(wrapper.text()).toContain('Extra info');

        const checkboxes = wrapper.findAll('.semi-checkbox');
        expect(checkboxes[1].find('.semi-checkbox-disabled').exists()).toBe(true);
    });

    it('v-model support', async () => {
        const options = ['A', 'B', 'C'];
        const value = ref(['A']);

        const wrapper = mount({
            template: `
                <CheckboxGroup
                    :options="options"
                    v-model:value="value"
                />
            `,
            components: { CheckboxGroup },
            setup() {
                return { options, value };
            },
        });

        await wrapper.findAll('.semi-checkbox')[1].trigger('click');
        await nextTick();

        expect(value.value).toEqual(['A', 'B']);
    });

    it('external state change (check all scenario)', async () => {
        const plainOptions = ['Apple', 'Pear', 'Orange', 'Banana'];
        const checkedList = ref(['Apple', 'Orange']);

        const wrapper = mount({
            template: `
                <CheckboxGroup v-model:value="checkedList" :options="plainOptions" />
            `,
            components: { CheckboxGroup },
            setup() {
                return { checkedList, plainOptions };
            },
        });

        // Initially 2 items checked
        expect(checkedList.value.length).toBe(2);
        let checkboxes = wrapper.findAllComponents(Checkbox);
        expect(checkboxes[0].find('input').element.checked).toBe(true);
        expect(checkboxes[1].find('input').element.checked).toBe(false);
        expect(checkboxes[2].find('input').element.checked).toBe(true);
        expect(checkboxes[3].find('input').element.checked).toBe(false);

        // Programmatically select all
        checkedList.value = plainOptions.slice();
        await nextTick();

        // Should all be checked
        expect(checkboxes.length).toBe(4);
        checkboxes.forEach(cb => {
            expect(cb.find('input').element.checked).toBe(true);
        });

        // Programmatically clear all
        checkedList.value = [];
        await nextTick();

        // Should all be unchecked
        checkboxes.forEach(cb => {
            expect(cb.find('input').element.checked).toBe(false);
        });
    });
});


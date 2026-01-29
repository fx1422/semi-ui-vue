import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TextArea from '../src/components/input/TextArea.vue';
import { cssClasses } from '@douyinfe/semi-foundation/input/constants';

const PREFIX = cssClasses.PREFIX;

// 对照 packages/semi-ui/input/__test__/textArea.test.js
describe('TextArea', () => {
    // 对应 React 测试: "TextArea with custom className & style"
    it('should render with custom className and style', () => {
        const wrapper = mount(TextArea, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
        });

        expect(wrapper.classes()).toContain('test');
        expect(wrapper.classes()).toContain(`${PREFIX}-textarea-wrapper`);
        expect(wrapper.element.style.color).toBe('red');
    });

    // 对应 React 测试: "TextArea defaultValue"
    it('should render with defaultValue', () => {
        const defaultValue = 'semi';
        const wrapper = mount(TextArea, {
            props: { defaultValue },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.element.value).toBe(defaultValue);
    });

    // 对应 React 测试: "TextArea onChange trigger when value change"
    it('should trigger onChange when value changes', async () => {
        const onChange = vi.fn();
        const wrapper = mount(TextArea, {
            props: { onChange },
        });

        const textarea = wrapper.find('textarea');
        await textarea.setValue('semi');

        expect(onChange).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalledWith('semi', expect.any(Event));
    });

    // 对应 React 测试: "TextArea show maxCount"
    it('should display maxCount', async () => {
        const wrapper = mount(TextArea, {
            props: { maxCount: 10 },
        });

        let counter = wrapper.find(`.${PREFIX}-textarea-counter`);
        expect(counter.text()).toBe('0/10');

        await wrapper.setProps({ value: 'semi' });
        counter = wrapper.find(`.${PREFIX}-textarea-counter`);
        expect(counter.text()).toBe('4/10');
    });

    // 对应 React 测试: "TextArea with placeholder"
    it('should render with placeholder', () => {
        const placeholderText = 'semi placeholder';
        const wrapper = mount(TextArea, {
            props: { placeholder: placeholderText },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(placeholderText);
    });

    // 对应 React 测试: "TextArea disabled"
    it('should render disabled textarea', () => {
        const wrapper = mount(TextArea, {
            props: { disabled: true },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.classes()).toContain(`${PREFIX}-textarea-disabled`);
        expect(textarea.attributes('disabled')).toBeDefined();
    });

    // 对应 React 测试: "TextArea showClear / onClear"
    it.skip('should show clear button and trigger onClear', async () => {
        const onClear = vi.fn();
        const wrapper = mount(TextArea, {
            props: {
                showClear: true,
                value: '123',
                onClear,
            },
        });

        // Trigger mouse enter to show clear button
        await wrapper.trigger('mouseenter');
        await wrapper.vm.$nextTick();

        const clearBtn = wrapper.find(`.${PREFIX}-clearbtn`);
        expect(clearBtn.exists()).toBe(true);

        await clearBtn.trigger('click');

        expect(onClear).toHaveBeenCalled();
        expect(wrapper.vm.textareaValue).toBe('');
    });

    // 对应 React 测试: "TextArea onEnterPress"
    it('should trigger onEnterPress when Enter is pressed', async () => {
        const onEnterPress = vi.fn();
        const wrapper = mount(TextArea, {
            props: { onEnterPress },
        });

        const textarea = wrapper.find('textarea');
        await textarea.trigger('keydown', { key: 'Enter', keyCode: 13 });

        expect(onEnterPress).toHaveBeenCalled();
    });

    // 对应 React 测试: "TextArea controlled mode"
    it('should support controlled mode', async () => {
        const onChange = vi.fn();
        const wrapper = mount(TextArea, {
            props: {
                value: 'initial',
                onChange,
            },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.element.value).toBe('initial');

        // Update value prop
        await wrapper.setProps({ value: 'updated' });
        expect(textarea.element.value).toBe('updated');
    });

    // 对应 React 测试: "TextArea readonly"
    it('should render readonly textarea', () => {
        const wrapper = mount(TextArea, {
            props: { readonly: true },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.classes()).toContain(`${PREFIX}-textarea-readonly`);
        expect(textarea.attributes('readonly')).toBeDefined();
    });

    // 对应 React 测试: "TextArea rows & cols"
    it('should support rows and cols', () => {
        const wrapper = mount(TextArea, {
            props: {
                rows: 6,
                cols: 30,
            },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('rows')).toBe('6');
        expect(textarea.attributes('cols')).toBe('30');
    });

    // 对应 React 测试: "TextArea validateStatus"
    it('should support different validateStatus', () => {
        const statuses = ['error', 'warning', 'success'];

        statuses.forEach((status) => {
            const wrapper = mount(TextArea, {
                props: { validateStatus: status as any },
            });

            expect(wrapper.classes()).toContain(`${PREFIX}-textarea-wrapper-${status}`);
        });
    });

    // 对应 React 测试: "TextArea borderless"
    it('should support borderless mode', () => {
        const wrapper = mount(TextArea, {
            props: { borderless: true },
        });

        expect(wrapper.classes()).toContain(`${PREFIX}-textarea-borderless`);
    });

    // 对应 React 测试: "TextArea showCounter"
    it('should support showCounter', () => {
        const wrapper = mount(TextArea, {
            props: {
                showCounter: true,
                value: 'test',
            },
        });

        const counter = wrapper.find(`.${PREFIX}-textarea-counter`);
        expect(counter.exists()).toBe(true);
        expect(counter.text()).toBe('4');
    });

    // 对应 React 测试: "TextArea maxCount exceed"
    it('should show exceed style when maxCount is exceeded', async () => {
        const wrapper = mount(TextArea, {
            props: {
                maxCount: 5,
                value: 'too long text',
            },
        });

        const counter = wrapper.find(`.${PREFIX}-textarea-counter`);
        expect(counter.classes()).toContain(`${PREFIX}-textarea-counter-exceed`);
    });

    // 对应 React 测试: "TextArea autoFocus"
    it('should support autoFocus', async () => {
        const wrapper = mount(TextArea, {
            props: { autoFocus: true },
            attachTo: document.body,
        });

        // Wait for next tick to ensure focus is set
        await wrapper.vm.$nextTick();

        const textarea = wrapper.find('textarea');
        expect(document.activeElement).toBe(textarea.element);
    });

    // Additional tests for Vue specific features
    it('should emit update:value for v-model support', async () => {
        const wrapper = mount(TextArea);

        const textarea = wrapper.find('textarea');
        await textarea.setValue('vue model');

        expect(wrapper.emitted('update:value')).toBeTruthy();
        expect(wrapper.emitted('update:value')![0]).toEqual(['vue model']);
    });

    it('should support v-model', async () => {
        const wrapper = mount(TextArea, {
            props: {
                value: 'initial',
                'onUpdate:value': (newValue: string) => {
                    wrapper.setProps({ value: newValue });
                },
            },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.element.value).toBe('initial');

        // Simulate user input using setValue
        await textarea.setValue('updated');

        expect(wrapper.props('value')).toBe('updated');
    });

    it('should expose focus and blur methods', async () => {
        const wrapper = mount(TextArea, {
            attachTo: document.body,
        });

        const vm = wrapper.vm as any;

        // Test focus method
        vm.focus();
        expect(document.activeElement).toBe(wrapper.find('textarea').element);

        // Test blur method
        vm.blur();
        expect(document.activeElement).not.toBe(wrapper.find('textarea').element);
    });

    // Test autosize functionality (basic test)
    it('should support autosize', () => {
        const wrapper = mount(TextArea, {
            props: { autosize: true },
        });

        // Check if ResizeObserver is rendered when autosize is true
        const resizeObserver = wrapper.findComponent({ name: 'index' });
        expect(resizeObserver.exists()).toBe(true);

        const textarea = wrapper.find('textarea');
        expect(textarea.classes()).toContain(`${PREFIX}-textarea-autosize`);
    });

    // Test disabledEnterStartNewLine
    it('should support disabledEnterStartNewLine', async () => {
        const onEnterPress = vi.fn();
        const wrapper = mount(TextArea, {
            props: {
                disabledEnterStartNewLine: true,
                onEnterPress,
            },
        });

        const textarea = wrapper.find('textarea');

        // Mock preventDefault
        const mockPreventDefault = vi.fn();
        await textarea.trigger('keydown', {
            key: 'Enter',
            keyCode: 13,
            shiftKey: false,
            preventDefault: mockPreventDefault,
        });

        // onEnterPress should still be called, but preventDefault should be called to prevent line wrapping
        expect(onEnterPress).toHaveBeenCalled();
        expect(mockPreventDefault).toHaveBeenCalled();
    });
});

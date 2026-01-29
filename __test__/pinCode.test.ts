import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import PinCode from '../src/components/pinCode';
import { cssClasses } from '@douyinfe/semi-foundation/pincode/constants';

const PREFIX = cssClasses.PREFIX;

describe('PinCode', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        if (typeof global.ClipboardEvent === 'undefined') {
            (global as any).ClipboardEvent = class ClipboardEvent extends Event {
                clipboardData: any;
                constructor(type: string, eventInitDict?: any) {
                    super(type, eventInitDict);
                    this.clipboardData = eventInitDict?.clipboardData || null;
                }
            };
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render correctly with default props', () => {
        const wrapper = mount(PinCode);
        expect(wrapper.find(`.${PREFIX}-wrapper`).exists()).toBe(true);
        const inputs = wrapper.findAll('input');
        expect(inputs.length).toBe(6);
    });

    it('should apply custom className', () => {
        const wrapper = mount(PinCode, {
            props: {
                className: 'custom-class',
            },
        });
        expect(wrapper.find(`.${PREFIX}-wrapper.custom-class`).exists()).toBe(true);
    });

    it('should apply custom style', () => {
        const wrapper = mount(PinCode, {
            props: {
                style: { color: 'red' },
            },
        });
        const element = wrapper.find(`.${PREFIX}-wrapper`).element as HTMLElement;
        expect(element.style.color).toBe('red');
    });

    it('should support count prop', () => {
        const wrapper = mount(PinCode, {
            props: {
                count: 4,
            },
        });
        const inputs = wrapper.findAll('input');
        expect(inputs.length).toBe(4);
    });

    it('should support defaultValue prop', async () => {
        const wrapper = mount(PinCode, {
            props: {
                defaultValue: '123456',
            },
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        expect((inputs[0].element as HTMLInputElement).value).toBe('1');
        expect((inputs[1].element as HTMLInputElement).value).toBe('2');
        expect((inputs[2].element as HTMLInputElement).value).toBe('3');
        expect((inputs[3].element as HTMLInputElement).value).toBe('4');
        expect((inputs[4].element as HTMLInputElement).value).toBe('5');
        expect((inputs[5].element as HTMLInputElement).value).toBe('6');
    });

    it('should support controlled value prop', async () => {
        const wrapper = mount(PinCode, {
            props: {
                value: '123456',
            },
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        expect((inputs[0].element as HTMLInputElement).value).toBe('1');
        expect((inputs[5].element as HTMLInputElement).value).toBe('6');
    });

    it('should support v-model', async () => {
        const wrapper = mount(PinCode, {
            props: {
                modelValue: '123456',
            },
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        expect((inputs[0].element as HTMLInputElement).value).toBe('1');
        expect((inputs[5].element as HTMLInputElement).value).toBe('6');
    });

    it('should support size prop', () => {
        const wrapper = mount(PinCode, {
            props: {
                size: 'large',
            },
        });
        const inputs = wrapper.findAll('input');
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('should support disabled prop', () => {
        const wrapper = mount(PinCode, {
            props: {
                disabled: true,
            },
        });
        const inputs = wrapper.findAll('input');
        inputs.forEach((input) => {
            expect((input.element as HTMLInputElement).disabled).toBe(true);
        });
    });

    it('should support autoFocus prop', async () => {
        const wrapper = mount(PinCode, {
            props: {
                autoFocus: true,
            },
            attachTo: document.body,
        });
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const firstInput = wrapper.findAll('input')[0].element as HTMLInputElement;
        expect(document.activeElement).toBe(firstInput);
        wrapper.unmount();
    });

    it('should not auto focus when autoFocus is false', async () => {
        const wrapper = mount(PinCode, {
            props: {
                autoFocus: false,
            },
            attachTo: document.body,
        });
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const firstInput = wrapper.findAll('input')[0].element as HTMLInputElement;
        expect(document.activeElement).not.toBe(firstInput);
        wrapper.unmount();
    });

    it('should handle input and move to next input', async () => {
        const wrapper = mount(PinCode, {
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        firstInput.value = '1';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(firstInput.value).toBe('1');
        expect(document.activeElement).toBe(inputs[1].element);
        wrapper.unmount();
    });

    it.skip('should handle Backspace key', async () => {
        const onChange = vi.fn();
        const wrapper = mount(PinCode, {
            props: {
                defaultValue: '123456',
                onChange,
            },
            attachTo: document.body,
        });
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));
        const inputs = wrapper.findAll('input');
        const secondInput = inputs[1].element as HTMLInputElement;

        secondInput.focus();
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const initialValue = secondInput.value;
        expect(initialValue).toBe('2');

        const keydownEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            keyCode: 8,
            bubbles: true,
            cancelable: true,
        });
        secondInput.dispatchEvent(keydownEvent);
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(onChange).toHaveBeenCalled();
        const currentValue = (inputs[1].element as HTMLInputElement).value;
        expect(currentValue).toBe('');
        expect(document.activeElement).toBe(inputs[0].element);
        wrapper.unmount();
    });

    it.skip('should handle Delete key', async () => {
        const onChange = vi.fn();
        const wrapper = mount(PinCode, {
            props: {
                defaultValue: '123456',
                onChange,
            },
            attachTo: document.body,
        });
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));
        const inputs = wrapper.findAll('input');
        const secondInput = inputs[1].element as HTMLInputElement;

        secondInput.focus();
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const initialValue = secondInput.value;
        expect(initialValue).toBe('2');

        const keydownEvent = new KeyboardEvent('keydown', {
            key: 'Delete',
            keyCode: 46,
            bubbles: true,
            cancelable: true,
        });
        secondInput.dispatchEvent(keydownEvent);
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(onChange).toHaveBeenCalled();
        const currentValue = (inputs[1].element as HTMLInputElement).value;
        expect(currentValue).toBe('');
        expect(document.activeElement).toBe(inputs[2].element);
        wrapper.unmount();
    });

    it('should handle ArrowLeft key', async () => {
        const wrapper = mount(PinCode, {
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const secondInput = inputs[1].element as HTMLInputElement;

        secondInput.focus();
        await secondInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(document.activeElement).toBe(inputs[0].element);
        wrapper.unmount();
    });

    it.skip('should handle ArrowRight key', async () => {
        const wrapper = mount(PinCode, {
            attachTo: document.body,
        });
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(document.activeElement).toBe(firstInput);

        const keydownEvent = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            keyCode: 39,
            bubbles: true,
            cancelable: true,
        });
        firstInput.dispatchEvent(keydownEvent);
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(document.activeElement).toBe(inputs[1].element);
        wrapper.unmount();
    });

    it('should handle paste event', async () => {
        const wrapper = mount(PinCode, {
            attachTo: document.body,
        });
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const clipboardData = {
            getData: vi.fn(() => '123456'),
        } as any;

        const PasteEvent = (global as any).ClipboardEvent || Event;
        const pasteEvent = new PasteEvent('paste', {
            bubbles: true,
        });
        Object.defineProperty(pasteEvent, 'clipboardData', {
            value: clipboardData,
            writable: false,
        });

        await firstInput.dispatchEvent(pasteEvent);
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 500));

        expect((inputs[0].element as HTMLInputElement).value).toBe('1');
        expect((inputs[1].element as HTMLInputElement).value).toBe('2');
        expect((inputs[2].element as HTMLInputElement).value).toBe('3');
        expect((inputs[3].element as HTMLInputElement).value).toBe('4');
        expect((inputs[4].element as HTMLInputElement).value).toBe('5');
        expect((inputs[5].element as HTMLInputElement).value).toBe('6');
        wrapper.unmount();
    });

    it('should trigger onChange when value changes', async () => {
        const onChange = vi.fn();
        const wrapper = mount(PinCode, {
            props: {
                onChange,
            },
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        firstInput.value = '1';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();

        expect(onChange).toHaveBeenCalledWith('1');
        wrapper.unmount();
    });

    it('should trigger onComplete when all inputs are filled', async () => {
        const onComplete = vi.fn();
        const wrapper = mount(PinCode, {
            props: {
                count: 4,
                onComplete,
            },
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');

        for (let i = 0; i < 4; i++) {
            const input = inputs[i].element as HTMLInputElement;
            input.focus();
            input.value = String(i + 1);
            await input.dispatchEvent(new Event('input', { bubbles: true }));
            await nextTick();
            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        await nextTick();
        expect(onComplete).toHaveBeenCalledWith('1234');
        wrapper.unmount();
    });

    it('should validate number format', async () => {
        const wrapper = mount(PinCode, {
            props: {
                format: 'number',
            },
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        firstInput.value = 'a';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();

        expect(firstInput.value).toBe('');
        wrapper.unmount();
    });

    it('should validate mixed format', async () => {
        const wrapper = mount(PinCode, {
            props: {
                format: 'mixed',
            },
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        firstInput.value = 'a';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();

        expect(firstInput.value).toBe('a');
        wrapper.unmount();
    });

    it('should validate with RegExp format', async () => {
        const wrapper = mount(PinCode, {
            props: {
                format: /[A-Z]/,
            },
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        firstInput.value = 'A';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();
        expect(firstInput.value).toBe('A');

        firstInput.value = 'a';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();
        expect(firstInput.value).toBe('A');
        wrapper.unmount();
    });

    it('should validate with function format', async () => {
        const validateFn = vi.fn((char: string) => char === 'x');
        const wrapper = mount(PinCode, {
            props: {
                format: validateFn,
            },
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        firstInput.value = 'x';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();
        expect(firstInput.value).toBe('x');
        expect(validateFn).toHaveBeenCalledWith('x');

        firstInput.value = 'y';
        await firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();
        expect(firstInput.value).toBe('x');
        wrapper.unmount();
    });

    it('should support focus method', async () => {
        const wrapper = mount(PinCode, {
            attachTo: document.body,
        });
        await nextTick();

        const component = wrapper.vm as any;
        component.focus(2);
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const inputs = wrapper.findAll('input');
        expect(document.activeElement).toBe(inputs[2].element);
        wrapper.unmount();
    });

    it('should support blur method', async () => {
        const wrapper = mount(PinCode, {
            attachTo: document.body,
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        const firstInput = inputs[0].element as HTMLInputElement;

        firstInput.focus();
        expect(document.activeElement).toBe(firstInput);

        const component = wrapper.vm as any;
        component.blur(0);
        await nextTick();

        expect(document.activeElement).not.toBe(firstInput);
        wrapper.unmount();
    });

    it('should update value when controlled value changes', async () => {
        const wrapper = mount(PinCode, {
            props: {
                value: '123456',
            },
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        expect((inputs[0].element as HTMLInputElement).value).toBe('1');

        await wrapper.setProps({ value: '654321' });
        await nextTick();
        expect((inputs[0].element as HTMLInputElement).value).toBe('6');
        expect((inputs[5].element as HTMLInputElement).value).toBe('1');
    });

    it('should handle empty value', async () => {
        const wrapper = mount(PinCode, {
            props: {
                value: '',
            },
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        inputs.forEach((input) => {
            expect((input.element as HTMLInputElement).value).toBe('');
        });
    });

    it('should handle value shorter than count', async () => {
        const wrapper = mount(PinCode, {
            props: {
                count: 6,
                value: '123',
            },
        });
        await nextTick();
        const inputs = wrapper.findAll('input');
        expect((inputs[0].element as HTMLInputElement).value).toBe('1');
        expect((inputs[1].element as HTMLInputElement).value).toBe('2');
        expect((inputs[2].element as HTMLInputElement).value).toBe('3');
        expect((inputs[3].element as HTMLInputElement).value).toBe('');
        expect((inputs[4].element as HTMLInputElement).value).toBe('');
        expect((inputs[5].element as HTMLInputElement).value).toBe('');
    });
});

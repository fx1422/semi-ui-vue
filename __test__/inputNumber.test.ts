import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InputNumber from '../src/components/inputNumber';

describe('InputNumber', () => {
    beforeEach(() => {
        // Mock console.warn to avoid warnings in tests
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render correctly with default props', () => {
        const wrapper = mount(InputNumber);
        expect(wrapper.find('.semi-input-number').exists()).toBe(true);
    });

    it('should apply custom className', () => {
        const wrapper = mount(InputNumber, {
            props: {
                className: 'custom-class',
            },
        });
        expect(wrapper.find('.custom-class').exists()).toBe(true);
    });

    it('should support defaultValue prop', async () => {
        const wrapper = mount(InputNumber, {
            props: {
                defaultValue: 10,
            },
        });
        
        await wrapper.vm.$nextTick();
        const input = wrapper.find('input').element as HTMLInputElement;
        expect(input.value).toBe('10');
    });

    it('should support controlled value prop', async () => {
        const wrapper = mount(InputNumber, {
            props: {
                value: 20,
            },
        });
        
        await wrapper.vm.$nextTick();
        const input = wrapper.find('input').element as HTMLInputElement;
        expect(input.value).toBe('20');
    });

    it('should support min and max props', async () => {
        const wrapper = mount(InputNumber, {
            props: {
                min: 0,
                max: 10,
                defaultValue: 5,
            },
        });
        
        const buttons = wrapper.findAll('.semi-input-number-button');
        expect(buttons.length).toBe(2);
        
        const upButton = wrapper.find('.semi-input-number-button-up');
        const downButton = wrapper.find('.semi-input-number-button-down');
        
        expect(upButton.exists()).toBe(true);
        expect(downButton.exists()).toBe(true);
    });

    it('should disable up button when value reaches max', async () => {
        const wrapper = mount(InputNumber, {
            props: {
                max: 10,
                value: 10,
            },
        });
        
        await wrapper.vm.$nextTick();
        const upButton = wrapper.find('.semi-input-number-button-up');
        expect(upButton.classes()).toContain('semi-input-number-button-up-not-allowed');
    });

    it('should disable down button when value reaches min', async () => {
        const wrapper = mount(InputNumber, {
            props: {
                min: 0,
                value: 0,
            },
        });
        
        await wrapper.vm.$nextTick();
        const downButton = wrapper.find('.semi-input-number-button-down');
        expect(downButton.classes()).toContain('semi-input-number-button-down-not-allowed');
    });

    it('should support disabled prop', async () => {
        const wrapper = mount(InputNumber, {
            props: {
                disabled: true,
            },
        });
        
        const input = wrapper.find('input');
        expect(input.attributes('disabled')).toBeDefined();
        
        const buttons = wrapper.findAll('button');
        buttons.forEach(button => {
            expect(button.attributes('disabled')).toBeDefined();
        });
    });

    it('should support step prop', async () => {
        const onChange = vi.fn();
        const wrapper = mount(InputNumber, {
            props: {
                defaultValue: 0,
                step: 10,
                onChange,
            },
        });
        
        await wrapper.vm.$nextTick();
        const upButton = wrapper.find('.semi-input-number-button-up');
        expect(upButton.exists()).toBe(true);
        
        // Verify the step prop is passed correctly
        expect(wrapper.vm.$props.step).toBe(10);
    });

    it('should support precision prop', async () => {
        const wrapper = mount(InputNumber, {
            props: {
                precision: 2,
                defaultValue: 1.234,
            },
        });
        
        await wrapper.vm.$nextTick();
        const input = wrapper.find('input').element as HTMLInputElement;
        // Value should be formatted to 2 decimal places
        expect(input.value).toContain('.');
    });

    it('should support size prop', async () => {
        const sizes = ['small', 'default', 'large'] as const;
        
        for (const size of sizes) {
            const wrapper = mount(InputNumber, {
                props: { size },
            });
            
            const input = wrapper.find('.semi-input');
            if (size !== 'default') {
                expect(input.classes()).toContain(`semi-input-${size}`);
            }
            wrapper.unmount();
        }
    });

    it('should render inner buttons when innerButtons is true', () => {
        const wrapper = mount(InputNumber, {
            props: {
                innerButtons: true,
            },
        });
        
        expect(wrapper.find('.semi-input-number-suffix-btns-inner').exists()).toBe(true);
    });

    it('should hide buttons when hideButtons is true', () => {
        const wrapper = mount(InputNumber, {
            props: {
                hideButtons: true,
            },
        });
        
        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(0);
    });

    it('should emit change event', async () => {
        const onChange = vi.fn();
        const wrapper = mount(InputNumber, {
            props: {
                defaultValue: 0,
                onChange,
            },
        });
        
        const input = wrapper.find('input');
        await input.setValue('10');
        await input.trigger('change');
        
        expect(onChange).toHaveBeenCalled();
    });

    it('should emit focus and blur events', async () => {
        const onFocus = vi.fn();
        const onBlur = vi.fn();
        const wrapper = mount(InputNumber, {
            props: {
                onFocus,
                onBlur,
            },
        });
        
        const input = wrapper.find('input');
        await input.trigger('focus');
        expect(onFocus).toHaveBeenCalled();
        
        await input.trigger('blur');
        expect(onBlur).toHaveBeenCalled();
    });

    it('should have focus and blur methods', () => {
        const wrapper = mount(InputNumber);
        expect(typeof wrapper.vm.focus).toBe('function');
        expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('should support formatter and parser props', async () => {
        const formatter = (value: number | string) => `${value}%`;
        const parser = (value: string) => value.replace('%', '');
        
        const wrapper = mount(InputNumber, {
            props: {
                defaultValue: 100,
                formatter,
                parser,
            },
        });
        
        await wrapper.vm.$nextTick();
        const input = wrapper.find('input').element as HTMLInputElement;
        expect(input.value).toContain('%');
    });

    it('should support showClear prop', () => {
        const wrapper = mount(InputNumber, {
            props: {
                showClear: true,
                defaultValue: 10,
            },
        });
        
        expect(wrapper.vm.$props.showClear).toBe(true);
    });

    it('should support custom style', () => {
        const style = { width: '200px' };
        const wrapper = mount(InputNumber, {
            props: { style },
        });
        
        const container = wrapper.find('.semi-input-number');
        expect(container.attributes('style')).toContain('200px');
    });
});


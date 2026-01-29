import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Switch from '../src/components/switch/Switch.vue';

describe('Switch', () => {
    it('should render with custom className & style', () => {
        const wrapper = mount(Switch, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
        });

        expect(wrapper.classes()).toContain('test');
        expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('should render checkedText and uncheckedText', async () => {
        // Checked switch with checkedText
        const checkedWrapper = mount(Switch, {
            props: {
                checkedText: 'semi',
                uncheckedText: 'design',
                checked: true,
            },
        });

        expect(checkedWrapper.find('.semi-switch-checked-text').exists()).toBe(true);
        expect(checkedWrapper.find('.semi-switch-checked-text').text()).toBe('semi');

        // Unchecked switch with uncheckedText
        const uncheckedWrapper = mount(Switch, {
            props: {
                checkedText: 'semi',
                uncheckedText: 'design',
                checked: false,
            },
        });

        expect(uncheckedWrapper.find('.semi-switch-unchecked-text').exists()).toBe(true);
        expect(uncheckedWrapper.find('.semi-switch-unchecked-text').text()).toBe('design');
    });

    it('should be disabled when props.disabled is true', async () => {
        const wrapper = mount(Switch, {
            props: {
                disabled: true,
            },
        });

        expect(wrapper.classes()).toContain('semi-switch-disabled');
        expect(wrapper.find('input').element.disabled).toBe(true);

        // Update disabled prop
        await wrapper.setProps({ disabled: false });
        expect(wrapper.classes()).not.toContain('semi-switch-disabled');
        expect(wrapper.find('input').element.disabled).toBe(false);
    });

    it('should handle onChange event', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Switch, {
            props: {
                onChange,
            },
        });

        const input = wrapper.find('input');
        await input.setValue(true);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true, expect.any(Event));
    });

    it('should handle v-model:checked', async () => {
        const wrapper = mount({
            template: '<Switch v-model:checked="checked" />',
            components: { Switch },
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

    it('should handle onMouseEnter and onMouseLeave', async () => {
        const onMouseEnter = vi.fn();
        const onMouseLeave = vi.fn();

        const wrapper = mount(Switch, {
            props: {
                defaultChecked: true,
                onMouseenter: onMouseEnter,
                onMouseleave: onMouseLeave,
            },
        });

        await wrapper.trigger('mouseenter');
        expect(onMouseEnter).toHaveBeenCalledTimes(1);

        await wrapper.trigger('mouseleave');
        expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should render different sizes', () => {
        const smallSwitch = mount(Switch, {
            props: {
                size: 'small',
            },
        });
        expect(smallSwitch.classes()).toContain('semi-switch-small');

        const defaultSwitch = mount(Switch, {
            props: {
                size: 'default',
            },
        });
        expect(defaultSwitch.classes()).not.toContain('semi-switch-small');
        expect(defaultSwitch.classes()).not.toContain('semi-switch-large');

        const largeSwitch = mount(Switch, {
            props: {
                size: 'large',
            },
        });
        expect(largeSwitch.classes()).toContain('semi-switch-large');
    });

    it('should work in controlled mode', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Switch, {
            props: {
                checked: false,
                onChange,
            },
        });

        expect(wrapper.classes()).not.toContain('semi-switch-checked');

        const input = wrapper.find('input');
        await input.setValue(true);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true, expect.any(Event));

        // Update checked prop
        await wrapper.setProps({ checked: true });
        expect(wrapper.classes()).toContain('semi-switch-checked');
    });

    it('should render loading state', () => {
        const loadingWrapper = mount(Switch, {
            props: {
                loading: true,
            },
        });

        expect(loadingWrapper.classes()).toContain('semi-switch-loading');
        expect(loadingWrapper.find('.semi-switch-loading-spin').exists()).toBe(true);

        const normalWrapper = mount(Switch, {
            props: {
                loading: false,
            },
        });

        expect(normalWrapper.classes()).not.toContain('semi-switch-loading');
        expect(normalWrapper.find('.semi-switch-loading-spin').exists()).toBe(false);
    });

    it('should not change when loading', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Switch, {
            props: {
                loading: true,
                onChange,
            },
        });

        const input = wrapper.find('input');
        expect(input.element.disabled).toBe(true);

        await input.setValue(true);
        // onChange should not be called when loading
        expect(onChange).not.toHaveBeenCalled();
    });

    it('should expose focus and blur methods', () => {
        const wrapper = mount(Switch);
        const vm = wrapper.vm as any;

        expect(typeof vm.focus).toBe('function');
        expect(typeof vm.blur).toBe('function');
    });

    it('should not show text when size is small', () => {
        const wrapper = mount(Switch, {
            props: {
                size: 'small',
                checked: true,
                checkedText: 'ON',
                uncheckedText: 'OFF',
            },
        });

        // Small size should not show text
        expect(wrapper.find('.semi-switch-checked-text').exists()).toBe(false);
    });

    it('should render checked text slots', () => {
        const wrapper = mount(Switch, {
            props: {
                checked: true,
            },
            slots: {
                checkedText: 'Custom ON',
            },
        });

        expect(wrapper.find('.semi-switch-checked-text').text()).toBe('Custom ON');
    });

    it('should render unchecked text slots', () => {
        const wrapper = mount(Switch, {
            props: {
                checked: false,
            },
            slots: {
                uncheckedText: 'Custom OFF',
            },
        });

        expect(wrapper.find('.semi-switch-unchecked-text').text()).toBe('Custom OFF');
    });
});


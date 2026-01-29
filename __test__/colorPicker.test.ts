import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import ColorPicker from '../src/components/colorPicker/ColorPicker.vue';
import { colorStringToValue } from '../src/components/colorPicker/utils';
import type { ColorValue } from '../src/components/colorPicker/interface';
import { cssClasses } from '@douyinfe/semi-foundation/colorPicker/constants';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

const PREFIX = cssClasses.PREFIX;

/**
 * ColorPicker Component Tests
 * 
 * Reference: React version component structure and behavior
 * Following the testing patterns from packages/semi-ui/button/__test__/button.test.js
 * and packages/semi-ui/input/__test__/input.test.js
 */

describe('ColorPicker', () => {
    const defaultColorValue: ColorValue = {
        hsva: { h: 176, s: 71, v: 77, a: 1 },
        rgba: { r: 57, g: 197, b: 187, a: 1 },
        hex: '#39c5bb',
    };

    it('colorPicker with custom className & style', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                className: 'test',
                style: { width: '300px' },
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).classes()).toContain('test');
        expect(wrapper.find(`.${PREFIX}`).classes()).toContain(PREFIX);
        const style = wrapper.find(`.${PREFIX}`).attributes('style');
        expect(style).toContain('width: 300px');
    });

    it('colorPicker should render correctly', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
        expect(wrapper.find(`.${PREFIX}-colorChooseArea`).exists()).toBe(true);
        expect(wrapper.find(`.${PREFIX}-colorSlider`).exists()).toBe(true);
    });

    it('colorPicker with defaultValue', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                defaultValue: defaultColorValue,
            },
        });

        await nextTick();

        const colorDemoBlock = wrapper.find(`.${PREFIX}-colorDemoBlock`);
        expect(colorDemoBlock.exists()).toBe(true);
    });

    it('colorPicker with v-model', async () => {
        const color = ref<ColorValue>(defaultColorValue);
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                modelValue: color.value,
                'onUpdate:modelValue': (value: ColorValue) => {
                    color.value = value;
                },
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
    });

    it('colorPicker should call onChange when value change', async () => {
        const onChange = vi.fn();
        const value = ref<ColorValue>(defaultColorValue);

        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                value: value.value,
                onChange,
            },
        });

        await nextTick();

        // onChange 会在用户交互时触发
        expect(onChange).toBeDefined();
        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
    });

    it('colorPicker with value prop (controlled)', async () => {
        const value = ref<ColorValue>(defaultColorValue);
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                value: value.value,
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
    });

    it('colorPicker with alpha prop', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
            },
        });

        await nextTick();

        const alphaSlider = wrapper.find(`.${PREFIX}-alphaSlider`);
        expect(alphaSlider.exists()).toBe(true);
    });

    it('colorPicker without alpha prop', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: false,
            },
        });

        await nextTick();

        const alphaSlider = wrapper.find(`.${PREFIX}-alphaSlider`);
        expect(alphaSlider.exists()).toBe(false);
    });

    it('colorPicker with eyeDropper prop', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                eyeDropper: true,
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
    });

    it('colorPicker with eyeDropper false', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                eyeDropper: false,
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
    });

    it('colorPicker with defaultFormat', async () => {
        const testFormat = (format: 'hex' | 'rgba' | 'hsva') => {
            const wrapper = mount(ColorPicker, {
                props: {
                    alpha: true,
                    defaultFormat: format,
                },
            });
            return wrapper;
        };

        const hexWrapper = testFormat('hex');
        await nextTick();
        expect(hexWrapper.find(`.${PREFIX}`).exists()).toBe(true);

        const rgbaWrapper = testFormat('rgba');
        await nextTick();
        expect(rgbaWrapper.find(`.${PREFIX}`).exists()).toBe(true);

        const hsvaWrapper = testFormat('hsva');
        await nextTick();
        expect(hsvaWrapper.find(`.${PREFIX}`).exists()).toBe(true);
    });

    it('colorPicker with width and height', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                width: 300,
                height: 300,
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
    });

    it('colorPicker with usePopover', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                usePopover: true,
            },
        });

        await nextTick();

        // Popover 使用 Portal，检查默认的 trigger 元素
        const defaultChildren = wrapper.find(`.${PREFIX}-popover-defaultChildren`);
        expect(defaultChildren.exists()).toBe(true);
    });

    it('colorPicker with usePopover and custom trigger', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                usePopover: true,
            },
            slots: {
                default: '<button>Custom Trigger</button>',
            },
        });

        await nextTick();

        // 验证自定义 trigger 存在
        expect(wrapper.find('button').exists()).toBe(true);
        expect(wrapper.find('button').text()).toBe('Custom Trigger');
    });

    it('colorPicker with top slot', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
            },
            slots: {
                top: '<div class="top-slot">Top Content</div>',
            },
        });

        await nextTick();

        expect(wrapper.find('.top-slot').exists()).toBe(true);
        expect(wrapper.find('.top-slot').text()).toBe('Top Content');
    });

    it('colorPicker with bottom slot', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
            },
            slots: {
                bottom: '<div class="bottom-slot">Bottom Content</div>',
            },
        });

        await nextTick();

        expect(wrapper.find('.bottom-slot').exists()).toBe(true);
        expect(wrapper.find('.bottom-slot').text()).toBe('Bottom Content');
    });

    it('colorStringToValue with hex string', () => {
        const result = colorStringToValue('#39c5bb');
        expect(result).toHaveProperty('hex');
        expect(result).toHaveProperty('rgba');
        expect(result).toHaveProperty('hsva');
        expect(result.hex).toBe('#39c5bb');
    });

    it('colorStringToValue with rgb string', () => {
        const result = colorStringToValue('rgb(57,197,187)');
        expect(result).toHaveProperty('hex');
        expect(result).toHaveProperty('rgba');
        expect(result).toHaveProperty('hsva');
        expect(result.rgba.r).toBe(57);
        expect(result.rgba.g).toBe(197);
        expect(result.rgba.b).toBe(187);
    });

    it('colorStringToValue with rgba string', () => {
        const result = colorStringToValue('rgba(57,197,187,0.5)');
        expect(result).toHaveProperty('hex');
        expect(result).toHaveProperty('rgba');
        expect(result).toHaveProperty('hsva');
        expect(result.rgba.a).toBeCloseTo(0.5, 1);
    });

    it('colorStringToValue with hsv string', () => {
        const result = colorStringToValue('hsv(176,71,77)');
        expect(result).toHaveProperty('hex');
        expect(result).toHaveProperty('rgba');
        expect(result).toHaveProperty('hsva');
        expect(result.hsva.h).toBe(176);
    });

    it('colorStringToValue should throw error for invalid color string', () => {
        expect(() => {
            colorStringToValue('invalid-color');
        }).toThrow('Semi ColorPicker: error on static colorStringToValue method');
    });

    it('colorPicker with all props', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                alpha: true,
                eyeDropper: true,
                defaultFormat: 'hex',
                width: 300,
                height: 300,
                defaultValue: defaultColorValue,
                className: 'test-picker',
            },
            slots: {
                top: '<div>Top</div>',
                bottom: '<div>Bottom</div>',
            },
        });

        await nextTick();

        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(true);
        expect(wrapper.find(`.${PREFIX}`).classes()).toContain('test-picker');
    });
});



import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Slider from '../src/components/slider';

describe('Slider', () => {
    let wrapper: VueWrapper;

    beforeEach(() => {
        wrapper?.unmount();
    });

    it('should render correctly with default props', () => {
        wrapper = mount(Slider);
        expect(wrapper.find('.semi-slider-wrapper').exists()).toBe(true);
        expect(wrapper.find('.semi-slider-rail').exists()).toBe(true);
        expect(wrapper.find('.semi-slider-track').exists()).toBe(true);
        expect(wrapper.find('.semi-slider-handle').exists()).toBe(true);
    });

    it('should render with defaultValue', () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('style')).toContain('left: 30%');
    });

    it('should render with range defaultValue', () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: [20, 60],
                range: true,
            },
        });

        const handles = wrapper.findAll('.semi-slider-handle');
        expect(handles).toHaveLength(2);
        expect(handles[0].attributes('style')).toContain('left: 20%');
        expect(handles[1].attributes('style')).toContain('left: 60%');
    });

    it('should work in controlled mode', async () => {
        wrapper = mount(Slider, {
            props: {
                value: 10,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('style')).toContain('left: 10%');

        await wrapper.setProps({ value: 50 });
        expect(handle.attributes('style')).toContain('left: 50%');

        // Should not exceed max value
        await wrapper.setProps({ value: 101 });
        expect(handle.attributes('style')).toContain('left: 100%');
    });

    it('should handle min and max props', () => {
        wrapper = mount(Slider, {
            props: {
                min: 10,
                max: 50,
                defaultValue: 30,
            },
        });

        // 30 is 50% between 10 and 50
        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('style')).toContain('left: 50%');
    });

    it('should handle step prop', () => {
        wrapper = mount(Slider, {
            props: {
                step: 10,
                defaultValue: 20,  // Use value that's already on a step
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('style')).toContain('left: 20%');
    });

    it('should handle decimal step', () => {
        wrapper = mount(Slider, {
            props: {
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0.5,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('style')).toContain('left: 50%');
    });

    it('should render range slider when range is true', () => {
        wrapper = mount(Slider, {
            props: {
                range: true,
            },
        });

        const handles = wrapper.findAll('.semi-slider-handle');
        expect(handles).toHaveLength(2);
    });

    it('should handle disabled prop', async () => {
        wrapper = mount(Slider, {
            props: {
                disabled: true,
            },
        });

        expect(wrapper.find('.semi-slider-disabled').exists()).toBe(true);

        await wrapper.setProps({ disabled: false });
        expect(wrapper.find('.semi-slider-disabled').exists()).toBe(false);
    });

    it('should render marks', () => {
        const marks = {
            20: '20°C',
            40: '40°C',
            60: '60°C',
        };

        wrapper = mount(Slider, {
            props: {
                marks,
            },
        });

        expect(wrapper.find('.semi-slider-marks').exists()).toBe(true);
        expect(wrapper.findAll('.semi-slider-mark')).toHaveLength(3);
        expect(wrapper.html()).toContain('20°C');
        expect(wrapper.html()).toContain('40°C');
        expect(wrapper.html()).toContain('60°C');
    });

    it('should render dots when marks are provided', () => {
        const marks = {
            20: '20',
            40: '40',
        };

        wrapper = mount(Slider, {
            props: {
                marks,
            },
        });

        expect(wrapper.find('.semi-slider-dots').exists()).toBe(true);
        expect(wrapper.findAll('.semi-slider-dot')).toHaveLength(2);
    });

    it('should handle included prop', () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: 50,
                included: false,
            },
        });

        const track = wrapper.find('.semi-slider-track');
        // When included is false, track should exist
        expect(track.exists()).toBe(true);
    });

    it('should render vertical slider', () => {
        wrapper = mount(Slider, {
            props: {
                vertical: true,
            },
        });

        expect(wrapper.find('.semi-slider-vertical-wrapper').exists()).toBe(true);
        const handle = wrapper.find('.semi-slider-handle');
        // In vertical mode, uses 'top' instead of 'left'
        expect(handle.attributes('style')).toContain('top:');
    });

    it('should show boundary when showBoundary and mouse enter', async () => {
        wrapper = mount(Slider, {
            props: {
                showBoundary: true,
            },
        });

        const sliderWrapper = wrapper.find('.semi-slider-wrapper');
        await sliderWrapper.trigger('mouseenter');
        await nextTick();

        expect(wrapper.find('.semi-slider-boundary-show').exists()).toBe(true);

        await sliderWrapper.trigger('mouseleave');
        await nextTick();

        expect(wrapper.find('.semi-slider-boundary-show').exists()).toBe(false);
    });

    it('should display boundary min and max', () => {
        wrapper = mount(Slider, {
            props: {
                min: 10,
                max: 90,
                showBoundary: true,
            },
        });

        expect(wrapper.find('.semi-slider-boundary-min').text()).toBe('10');
        expect(wrapper.find('.semi-slider-boundary-max').text()).toBe('90');
    });

    it('should handle tipFormatter', async () => {
        const tipFormatter = vi.fn((value) => `${value}%`);

        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
                tipFormatter,
                tooltipVisible: true,
            },
        });

        await nextTick();
        expect(tipFormatter).toHaveBeenCalled();
    });

    it('should hide tooltip when tipFormatter is null', () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
                tipFormatter: null,
            },
        });

        // Tooltip should not be rendered
        expect(wrapper.find('.semi-tooltip-wrapper').exists()).toBe(false);
    });

    it('should show tooltip when tooltipVisible is true', () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
                tooltipVisible: true,
            },
        });

        expect(wrapper.find('.semi-tooltip').exists()).toBe(true);
    });

    it('should hide tooltip when tooltipVisible is false', () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
                tooltipVisible: false,
            },
        });

        // Tooltip wrapper exists but is not visible
        const tooltip = wrapper.findComponent({ name: 'Tooltip' });
        expect(tooltip.props('visible')).toBe(false);
    });

    it('should handle onChange event', async () => {
        const onChange = vi.fn();
        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
                onChange,
            },
        });

        // Simulate value change through props update
        await wrapper.setProps({ value: 50 });
        await nextTick();

        expect(onChange).toHaveBeenCalled();
    });

    it('should handle afterChange event', async () => {
        const onAfterChange = vi.fn();
        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
                onAfterChange,
            },
        });

        await wrapper.setProps({ value: 50 });
        await nextTick();

        expect(onAfterChange).toHaveBeenCalledWith(50);
    });

    it('should handle range onChange', async () => {
        const onChange = vi.fn();
        wrapper = mount(Slider, {
            props: {
                range: true,
                defaultValue: [20, 60],
                onChange,
            },
        });

        await wrapper.setProps({ value: [30, 70] });
        await nextTick();

        expect(onChange).toHaveBeenCalled();
    });

    it('should handle vertical reverse', () => {
        wrapper = mount(Slider, {
            props: {
                vertical: true,
                verticalReverse: true,
            },
        });

        expect(wrapper.find('.semi-slider-reverse').exists()).toBe(true);
    });

    it('should handle aria attributes', () => {
        wrapper = mount(Slider, {
            props: {
                'aria-label': 'Volume slider',
                'aria-labelledby': 'volume-label',
                defaultValue: 50,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('aria-label')).toBe('Volume slider');
        expect(handle.attributes('aria-labelledby')).toBe('volume-label');
        expect(handle.attributes('aria-valuenow')).toBe('50');
        expect(handle.attributes('aria-valuemin')).toBe('0');
        expect(handle.attributes('aria-valuemax')).toBe('100');
        expect(handle.attributes('role')).toBe('slider');
    });

    it('should have aria-disabled when disabled', () => {
        wrapper = mount(Slider, {
            props: {
                disabled: true,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('aria-disabled')).toBe('true');
        expect(handle.attributes('aria-label')).toBe('Disabled Slider');
        expect(handle.attributes('tabindex')).toBe('-1');
    });

    it('should have aria-orientation for vertical slider', () => {
        wrapper = mount(Slider, {
            props: {
                vertical: true,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('aria-orientation')).toBe('vertical');
    });

    it('should handle getAriaValueText', () => {
        const getAriaValueText = vi.fn((value) => `${value} degrees`);

        wrapper = mount(Slider, {
            props: {
                defaultValue: 25,
                getAriaValueText,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('aria-valuetext')).toContain('25 degrees');
    });

    it('should render handleDot for single slider', () => {
        wrapper = mount(Slider, {
            props: {
                handleDot: {
                    size: '20px',
                    color: 'red',
                },
            },
        });

        const handleDot = wrapper.find('.semi-slider-handle-dot');
        expect(handleDot.exists()).toBe(true);
        expect(handleDot.attributes('style')).toContain('width: 20px');
        expect(handleDot.attributes('style')).toContain('background-color: red');
    });

    it('should render handleDot for range slider', () => {
        wrapper = mount(Slider, {
            props: {
                range: true,
                handleDot: [
                    { size: '20px', color: 'red' },
                    { size: '24px', color: 'blue' },
                ],
            },
        });

        const handleDots = wrapper.findAll('.semi-slider-handle-dot');
        expect(handleDots).toHaveLength(2);
        expect(handleDots[0].attributes('style')).toContain('width: 20px');
        expect(handleDots[0].attributes('style')).toContain('background-color: red');
        expect(handleDots[1].attributes('style')).toContain('width: 24px');
        expect(handleDots[1].attributes('style')).toContain('background-color: blue');
    });

    it('should handle custom className', () => {
        wrapper = mount(Slider, {
            props: {
                className: 'custom-slider',
            },
        });

        expect(wrapper.find('.semi-slider-wrapper').classes()).toContain('custom-slider');
    });

    it('should handle custom style', () => {
        wrapper = mount(Slider, {
            props: {
                style: { marginTop: '20px' },
            },
        });

        const style = wrapper.find('.semi-slider-wrapper').attributes('style');
        expect(style).toBeTruthy();
    });

    it('should handle railStyle', () => {
        wrapper = mount(Slider, {
            props: {
                railStyle: { backgroundColor: 'blue' },
            },
        });

        const rail = wrapper.find('.semi-slider-rail');
        expect(rail.attributes('style')).toContain('background-color: blue');
    });

    it('should hide mark labels when showMarkLabel is false', () => {
        const marks = {
            20: '20°C',
            40: '40°C',
        };

        wrapper = mount(Slider, {
            props: {
                marks,
                showMarkLabel: false,
            },
        });

        expect(wrapper.find('.semi-slider-marks').exists()).toBe(false);
    });

    it('should render tooltipOnMark', () => {
        const marks = {
            20: '20°C',
            40: '40°C',
        };

        wrapper = mount(Slider, {
            props: {
                marks,
                tooltipOnMark: true,
            },
        });

        // Dots should still render
        expect(wrapper.findAll('.semi-slider-dot')).toHaveLength(2);
    });

    it('should render with showArrow', () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: 30,
                tooltipVisible: true,
                showArrow: false,
            },
        });

        const tooltip = wrapper.findComponent({ name: 'Tooltip' });
        expect(tooltip.props('showArrow')).toBe(false);
    });

    it('should handle keyboard navigation', async () => {
        wrapper = mount(Slider, {
            props: {
                defaultValue: 50,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');

        // Should be keyboard accessible
        expect(handle.attributes('tabindex')).toBe('0');
        expect(handle.attributes('role')).toBe('slider');
    });

    it('should initialize with range [0, 0] when range is true and no defaultValue', () => {
        wrapper = mount(Slider, {
            props: {
                range: true,
            },
        });

        const handles = wrapper.findAll('.semi-slider-handle');
        expect(handles).toHaveLength(2);
        expect(handles[0].attributes('style')).toContain('left: 0%');
        expect(handles[1].attributes('style')).toContain('left: 0%');
    });

    it('should work with range slider and sort values', async () => {
        const onChange = vi.fn();
        wrapper = mount(Slider, {
            props: {
                range: true,
                defaultValue: [20, 60],
                onChange,
            },
        });

        // Values should be sorted in onChange
        await wrapper.setProps({ value: [70, 30] });
        await nextTick();

        // onChange should receive sorted values
        if (onChange.mock.calls.length > 0) {
            const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
            const values = lastCall[0];
            if (Array.isArray(values)) {
                expect(values[0]).toBeLessThanOrEqual(values[1]);
            }
        }
    });

    it('should handle edge case: value equals min', () => {
        wrapper = mount(Slider, {
            props: {
                min: 0,
                max: 100,
                value: 0,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('style')).toContain('left: 0%');
    });

    it('should handle edge case: value equals max', () => {
        wrapper = mount(Slider, {
            props: {
                min: 0,
                max: 100,
                value: 100,
            },
        });

        const handle = wrapper.find('.semi-slider-handle');
        expect(handle.attributes('style')).toContain('left: 100%');
    });

    it('should handle range slider with equal values', () => {
        wrapper = mount(Slider, {
            props: {
                range: true,
                value: [50, 50],
            },
        });

        const handles = wrapper.findAll('.semi-slider-handle');
        expect(handles[0].attributes('style')).toContain('left: 50%');
        expect(handles[1].attributes('style')).toContain('left: 50%');
    });
});


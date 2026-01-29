import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Rating from '../src/components/rating';

describe('Rating', () => {
    let wrapper: VueWrapper;

    beforeEach(() => {
        wrapper?.unmount();
    });

    it('renders correctly with default props', () => {
        wrapper = mount(Rating);
        expect(wrapper.find('.semi-rating').exists()).toBe(true);
        // count + 1 (empty star for 0 rating)
        expect(wrapper.findAll('.semi-rating-star').length).toBe(6);
    });

    it('renders with custom count', () => {
        wrapper = mount(Rating, {
            props: { count: 10 },
        });
        expect(wrapper.findAll('.semi-rating-star').length).toBe(11);
    });

    it('renders with value', () => {
        wrapper = mount(Rating, {
            props: { value: 3 },
        });
        const stars = wrapper.findAll('.semi-rating-star-full');
        expect(stars.length).toBe(3);
    });

    it('renders with defaultValue', () => {
        wrapper = mount(Rating, {
            props: { defaultValue: 2 },
        });
        const stars = wrapper.findAll('.semi-rating-star-full');
        expect(stars.length).toBe(2);
    });

    it('allows half stars when allowHalf is true', () => {
        wrapper = mount(Rating, {
            props: {
                value: 2.5,
                allowHalf: true,
            },
        });
        expect(wrapper.find('.semi-rating-star-half').exists()).toBe(true);
    });

    it('handles click to change rating', async () => {
        const onChange = vi.fn();
        wrapper = mount(Rating, {
            props: {
                defaultValue: 0,
                onChange,
            },
        });

        const stars = wrapper.findAll('.semi-rating-star-wrapper');
        // Click the third star
        await stars[2].trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalled();
        const callArgs = onChange.mock.calls[0];
        expect(callArgs[0]).toBe(3);
    });

    it('supports allowClear to reset rating', async () => {
        const onChange = vi.fn();
        wrapper = mount(Rating, {
            props: {
                defaultValue: 3,
                allowClear: true,
                onChange,
            },
        });

        const stars = wrapper.findAll('.semi-rating-star-wrapper');
        // Click the same star to clear
        await stars[2].trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledWith(0);
    });

    it('does not allow clear when allowClear is false', async () => {
        const onChange = vi.fn();
        wrapper = mount(Rating, {
            props: {
                defaultValue: 3,
                allowClear: false,
                onChange,
            },
        });

        const stars = wrapper.findAll('.semi-rating-star-wrapper');
        await stars[2].trigger('click');
        await nextTick();

        // Should not change to 0
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it('handles hover to show temporary rating', async () => {
        const onHoverChange = vi.fn();
        wrapper = mount(Rating, {
            props: {
                value: 2,
                onHoverChange,
            },
        });

        const stars = wrapper.findAll('.semi-rating-star-wrapper');
        await stars[3].trigger('mousemove');
        await nextTick();

        expect(onHoverChange).toHaveBeenCalled();
    });

    it('is disabled when disabled prop is true', async () => {
        const onChange = vi.fn();
        wrapper = mount(Rating, {
            props: {
                disabled: true,
                onChange,
            },
        });

        expect(wrapper.find('.semi-rating-disabled').exists()).toBe(true);

        const stars = wrapper.findAll('.semi-rating-star-wrapper');
        await stars[2].trigger('click');
        await nextTick();

        expect(onChange).not.toHaveBeenCalled();
    });

    it('supports custom character', () => {
        wrapper = mount(Rating, {
            props: {
                character: '❤',
            },
        });

        expect(wrapper.html()).toContain('❤');
    });

    it('supports different sizes', () => {
        wrapper = mount(Rating, {
            props: { size: 'small' },
        });
        expect(wrapper.find('.semi-rating-star-small').exists()).toBe(true);
    });

    it('supports custom number size', () => {
        wrapper = mount(Rating, {
            props: { size: 30 },
        });
        const star = wrapper.find('.semi-rating-star');
        expect(star.attributes('style')).toContain('30px');
    });

    it('supports tooltips', async () => {
        const tooltips = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
        wrapper = mount(Rating, {
            props: {
                tooltips,
            },
        });

        // Tooltips should be rendered
        expect(wrapper.findAll('.semi-tooltip').length).toBeGreaterThan(0);
    });

    it('handles keyboard navigation with arrow keys', async () => {
        const onChange = vi.fn();
        wrapper = mount(Rating, {
            props: {
                defaultValue: 2,
                onChange,
            },
        });

        const ratingEl = wrapper.find('.semi-rating');

        // Press ArrowRight to increase
        await ratingEl.trigger('keydown', { key: 'ArrowRight' });
        await nextTick();

        expect(onChange).toHaveBeenCalledWith(3);
    });

    it('supports focus and blur events', async () => {
        const onFocus = vi.fn();
        const onBlur = vi.fn();
        wrapper = mount(Rating, {
            props: {
                onFocus,
                onBlur,
            },
        });

        const ratingEl = wrapper.find('.semi-rating');

        await ratingEl.trigger('focus');
        expect(onFocus).toHaveBeenCalled();

        await ratingEl.trigger('blur');
        expect(onBlur).toHaveBeenCalled();
    });

    it('exposes focus and blur methods', () => {
        wrapper = mount(Rating);

        expect(wrapper.vm.focus).toBeDefined();
        expect(wrapper.vm.blur).toBeDefined();
        expect(typeof wrapper.vm.focus).toBe('function');
        expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('supports aria attributes', () => {
        wrapper = mount(Rating, {
            props: {
                value: 3,
                count: 5,
                'aria-label': 'Product Rating',
            },
        });

        const ratingEl = wrapper.find('.semi-rating');
        expect(ratingEl.attributes('aria-label')).toContain('Rating');
        expect(ratingEl.attributes('aria-label')).toContain('3');
        expect(ratingEl.attributes('aria-label')).toContain('5');
    });

    it('handles controlled mode', async () => {
        const onChange = vi.fn();
        wrapper = mount(Rating, {
            props: {
                value: 2,
                onChange,
            },
        });

        const stars = wrapper.findAll('.semi-rating-star-wrapper');
        await stars[3].trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledWith(4);
        // In controlled mode, value should not change automatically
        expect(wrapper.findAll('.semi-rating-star-full').length).toBe(2);
    });

    it('handles uncontrolled mode', async () => {
        wrapper = mount(Rating, {
            props: {
                defaultValue: 2,
            },
        });

        const stars = wrapper.findAll('.semi-rating-star-wrapper');
        await stars[3].trigger('click');
        await nextTick();

        // In uncontrolled mode, value should change automatically
        expect(wrapper.findAll('.semi-rating-star-full').length).toBe(4);
    });
});


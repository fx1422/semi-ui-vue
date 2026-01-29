import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Space from '../src/components/space';

describe('Space', () => {
    it('renders with default props', () => {
        const wrapper = mount(Space, {
            slots: {
                default: () => [
                    h('div', 'Item 1'),
                    h('div', 'Item 2'),
                    h('div', 'Item 3'),
                ],
            },
        });

        expect(wrapper.find('.semi-space').exists()).toBe(true);
        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-horizontal');
        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-align-center');
        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-tight-horizontal');
        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-tight-vertical');
    });

    it('spacing - string values', () => {
        const defaultWrapper = mount(Space, {
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });
        expect(defaultWrapper.find('.semi-space').classes()).toContain('semi-space-tight-horizontal');
        expect(defaultWrapper.find('.semi-space').classes()).toContain('semi-space-tight-vertical');

        const looseWrapper = mount(Space, {
            props: { spacing: 'loose' },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });
        expect(looseWrapper.find('.semi-space').classes()).toContain('semi-space-loose-horizontal');
        expect(looseWrapper.find('.semi-space').classes()).toContain('semi-space-loose-vertical');

        const mediumWrapper = mount(Space, {
            props: { spacing: 'medium' },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });
        expect(mediumWrapper.find('.semi-space').classes()).toContain('semi-space-medium-horizontal');
        expect(mediumWrapper.find('.semi-space').classes()).toContain('semi-space-medium-vertical');
    });

    it('spacing - number value', () => {
        const wrapper = mount(Space, {
            props: { spacing: 20 },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        const element = wrapper.find('.semi-space').element as HTMLElement;
        expect(element.style.columnGap).toBe('20px');
        expect(element.style.rowGap).toBe('20px');
    });

    it('spacing - array with numbers', () => {
        const wrapper = mount(Space, {
            props: { spacing: [10, 20] as [number, number] },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        const element = wrapper.find('.semi-space').element as HTMLElement;
        expect(element.style.columnGap).toBe('10px');
        expect(element.style.rowGap).toBe('20px');
    });

    it('spacing - array with strings', () => {
        const wrapper = mount(Space, {
            props: { spacing: ['tight', 'loose'] as ['tight', 'loose'] },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-tight-horizontal');
        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-loose-vertical');
    });

    it('vertical direction', () => {
        const wrapper = mount(Space, {
            props: { vertical: true },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-vertical');
        expect(wrapper.find('.semi-space').classes()).not.toContain('semi-space-horizontal');
    });

    it('wrap prop', () => {
        const wrapper = mount(Space, {
            props: { wrap: true },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        expect(wrapper.find('.semi-space').classes()).toContain('semi-space-wrap');
    });

    it('wrap is false when vertical is true', () => {
        const wrapper = mount(Space, {
            props: { wrap: true, vertical: true },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        expect(wrapper.find('.semi-space').classes()).not.toContain('semi-space-wrap');
    });

    it('align prop', () => {
        const startWrapper = mount(Space, {
            props: { align: 'start' as const },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });
        expect(startWrapper.find('.semi-space').classes()).toContain('semi-space-align-start');

        const endWrapper = mount(Space, {
            props: { align: 'end' as const },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });
        expect(endWrapper.find('.semi-space').classes()).toContain('semi-space-align-end');

        const baselineWrapper = mount(Space, {
            props: { align: 'baseline' as const },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });
        expect(baselineWrapper.find('.semi-space').classes()).toContain('semi-space-align-baseline');
    });

    it('custom className', () => {
        const wrapper = mount(Space, {
            props: { className: 'my-custom-space' },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        expect(wrapper.find('.semi-space').classes()).toContain('my-custom-space');
    });

    it('custom style', () => {
        const wrapper = mount(Space, {
            props: { style: { backgroundColor: 'red' } },
            slots: {
                default: () => [h('div', 'Item 1'), h('div', 'Item 2')],
            },
        });

        const element = wrapper.find('.semi-space').element as HTMLElement;
        expect(element.style.backgroundColor).toBe('red');
    });

    it('filters out null, undefined, and false children', () => {
        const wrapper = mount(Space, {
            slots: {
                default: () => [
                    h('div', 'Item 1'),
                    null,
                    h('div', 'Item 2'),
                    false,
                    h('div', 'Item 3'),
                    undefined,
                ],
            },
        });

        const children = wrapper.findAll('.semi-space > *');
        expect(children.length).toBe(3);
    });

    it('flattens fragment children', () => {
        const wrapper = mount(Space, {
            slots: {
                default: () => [
                    h('div', 'Item 1'),
                    [h('div', 'Item 2'), h('div', 'Item 3')],
                    h('div', 'Item 4'),
                ],
            },
        });

        const children = wrapper.findAll('.semi-space > *');
        expect(children.length).toBe(4);
    });

    it('has x-semi-prop attribute', () => {
        const wrapper = mount(Space, {
            slots: {
                default: () => [h('div', 'Item 1')],
            },
        });

        expect(wrapper.find('.semi-space').attributes('x-semi-prop')).toBe('children');
    });
});


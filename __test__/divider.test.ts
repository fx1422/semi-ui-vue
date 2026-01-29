import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Divider from '../src/components/divider';

describe('Divider', () => {
    it('renders with default props', () => {
        const wrapper = mount(Divider);
        expect(wrapper.find('.semi-divider').exists()).toBe(true);
        expect(wrapper.find('.semi-divider').classes()).toContain('semi-divider-horizontal');
    });

    it('custom className and style', () => {
        const wrapper = mount(Divider, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
        });

        expect(wrapper.find('.semi-divider').classes()).toContain('test');
        const element = wrapper.find('.semi-divider').element as HTMLElement;
        expect(element.style.color).toBe('red');
    });

    it('renders with title', () => {
        const wrapper = mount(Divider, {
            slots: {
                default: () => 'divider title',
            },
        });

        expect(wrapper.text()).toBe('divider title');
        expect(wrapper.find('.semi-divider_inner-text').exists()).toBe(true);
        expect(wrapper.find('.semi-divider_inner-text').attributes('x-semi-prop')).toBe('children');
    });

    it('align prop - center (default)', () => {
        const wrapper = mount(Divider, {
            props: { align: 'center' },
            slots: {
                default: () => 'divider center title',
            },
        });

        expect(wrapper.find('.semi-divider').classes()).toContain('semi-divider-with-text-center');
    });

    it('align prop - left', () => {
        const wrapper = mount(Divider, {
            props: { align: 'left' },
            slots: {
                default: () => 'divider left title',
            },
        });

        expect(wrapper.find('.semi-divider').classes()).toContain('semi-divider-with-text-left');
    });

    it('align prop - right', () => {
        const wrapper = mount(Divider, {
            props: { align: 'right' },
            slots: {
                default: () => 'divider right title',
            },
        });

        expect(wrapper.find('.semi-divider').classes()).toContain('semi-divider-with-text-right');
    });

    it('layout prop - horizontal (default)', () => {
        const wrapper = mount(Divider);
        expect(wrapper.find('.semi-divider').classes()).toContain('semi-divider-horizontal');
        expect(wrapper.find('.semi-divider').classes()).not.toContain('semi-divider-vertical');
    });

    it('layout prop - vertical', () => {
        const wrapper = mount(Divider, {
            props: { layout: 'vertical' },
        });

        expect(wrapper.find('.semi-divider').classes()).toContain('semi-divider-vertical');
        expect(wrapper.find('.semi-divider').classes()).not.toContain('semi-divider-horizontal');
    });

    it('dashed prop', () => {
        const wrapper = mount(Divider, {
            props: { dashed: true },
        });

        expect(wrapper.find('.semi-divider').classes()).toContain('semi-divider-dashed');
    });

    it('margin prop - horizontal layout with number', () => {
        const wrapper = mount(Divider, {
            props: {
                layout: 'horizontal',
                margin: 20,
            },
        });

        const element = wrapper.find('.semi-divider').element as HTMLElement;
        expect(element.style.marginTop).toBe('20px');
        expect(element.style.marginBottom).toBe('20px');
    });

    it('margin prop - horizontal layout with string', () => {
        const wrapper = mount(Divider, {
            props: {
                layout: 'horizontal',
                margin: '2rem',
            },
        });

        const element = wrapper.find('.semi-divider').element as HTMLElement;
        expect(element.style.marginTop).toBe('2rem');
        expect(element.style.marginBottom).toBe('2rem');
    });

    it('margin prop - vertical layout with number', () => {
        const wrapper = mount(Divider, {
            props: {
                layout: 'vertical',
                margin: 16,
            },
        });

        const element = wrapper.find('.semi-divider').element as HTMLElement;
        expect(element.style.marginLeft).toBe('16px');
        expect(element.style.marginRight).toBe('16px');
    });

    it('margin prop - vertical layout with string', () => {
        const wrapper = mount(Divider, {
            props: {
                layout: 'vertical',
                margin: '1em',
            },
        });

        const element = wrapper.find('.semi-divider').element as HTMLElement;
        expect(element.style.marginLeft).toBe('1em');
        expect(element.style.marginRight).toBe('1em');
    });

    it('with-text classes only apply for horizontal layout', () => {
        const horizontalWrapper = mount(Divider, {
            props: { layout: 'horizontal' },
            slots: {
                default: () => 'title',
            },
        });

        expect(horizontalWrapper.find('.semi-divider').classes()).toContain('semi-divider-with-text');

        const verticalWrapper = mount(Divider, {
            props: { layout: 'vertical' },
            slots: {
                default: () => 'title',
            },
        });

        expect(verticalWrapper.find('.semi-divider').classes()).not.toContain('semi-divider-with-text');
    });

    it('text only shows in horizontal layout', () => {
        const horizontalWrapper = mount(Divider, {
            props: { layout: 'horizontal' },
            slots: {
                default: () => 'title',
            },
        });

        expect(horizontalWrapper.find('.semi-divider_inner-text').exists()).toBe(true);

        const verticalWrapper = mount(Divider, {
            props: { layout: 'vertical' },
            slots: {
                default: () => 'title',
            },
        });

        expect(verticalWrapper.find('.semi-divider_inner-text').exists()).toBe(false);
    });

    it('renders with component child (not just text)', () => {
        const wrapper = mount(Divider, {
            slots: {
                default: () => h('span', { class: 'custom-content' }, 'Custom'),
            },
        });

        expect(wrapper.find('.custom-content').exists()).toBe(true);
    });
});


import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Breadcrumb, { BreadcrumbItem } from '../src/components/breadcrumb';
import { IconHome } from '@douyinfe/semi-icons';
import { h } from 'vue';

describe('Breadcrumb', () => {
    it('should render basic breadcrumb', () => {
        const wrapper = mount(Breadcrumb, {
            slots: {
                default: [
                    h(BreadcrumbItem, {}, () => 'Home'),
                    h(BreadcrumbItem, {}, () => 'List'),
                    h(BreadcrumbItem, {}, () => 'Detail'),
                ],
            },
        });

        expect(wrapper.find('nav').exists()).toBe(true);
        expect(wrapper.findAll('.semi-breadcrumb-item-wrap')).toHaveLength(3);
    });

    it('should render with custom className and style', () => {
        const wrapper = mount(Breadcrumb, {
            props: {
                className: 'test-class',
                style: { color: 'red' },
            },
            slots: {
                default: h(BreadcrumbItem, {}, () => 'Home'),
            },
        });

        const nav = wrapper.find('nav');
        expect(nav.classes()).toContain('test-class');
        expect(nav.attributes('style')).toContain('color: red');
    });

    it('should support compact mode', () => {
        const wrapperCompact = mount(Breadcrumb, {
            props: { compact: true },
            slots: { default: h(BreadcrumbItem, {}, () => 'Home') },
        });

        const wrapperLoose = mount(Breadcrumb, {
            props: { compact: false },
            slots: { default: h(BreadcrumbItem, {}, () => 'Home') },
        });

        expect(wrapperCompact.find('.semi-breadcrumb-wrapper-compact').exists()).toBe(true);
        expect(wrapperLoose.find('.semi-breadcrumb-wrapper-loose').exists()).toBe(true);
    });

    it('should render with custom separator', () => {
        const wrapper = mount(Breadcrumb, {
            props: { separator: '>' },
            slots: {
                default: [
                    h(BreadcrumbItem, {}, () => 'Home'),
                    h(BreadcrumbItem, {}, () => 'List'),
                ],
            },
        });

        const separators = wrapper.findAll('.semi-breadcrumb-separator');
        expect(separators.length).toBeGreaterThan(0);
        expect(separators[0].text()).toBe('>');
    });

    it('should render with routes prop', () => {
        const routes = ['Home', 'List', 'Detail'];
        const wrapper = mount(Breadcrumb, {
            props: { routes },
        });

        expect(wrapper.findAll('.semi-breadcrumb-item-wrap')).toHaveLength(3);
    });

    it('should render routes with objects', () => {
        const routes = [
            { name: 'Home', href: '/' },
            { name: 'List', href: '/list' },
            { name: 'Detail' },
        ];
        const wrapper = mount(Breadcrumb, {
            props: { routes },
        });

        expect(wrapper.findAll('.semi-breadcrumb-item-wrap')).toHaveLength(3);
        const links = wrapper.findAll('a');
        expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it('should trigger click event', async () => {
        const onClick = vi.fn();
        const wrapper = mount(Breadcrumb, {
            props: { onClick },
            slots: {
                default: [
                    h(BreadcrumbItem, {}, () => 'Home'),
                    h(BreadcrumbItem, {}, () => 'List'),
                ],
            },
        });

        await wrapper.find('.semi-breadcrumb-item').trigger('click');
        expect(onClick).toHaveBeenCalled();
    });

    it('should support maxItemCount and autoCollapse', () => {
        const wrapper = mount(Breadcrumb, {
            props: {
                maxItemCount: 3,
                autoCollapse: true,
            },
            slots: {
                default: [
                    h(BreadcrumbItem, {}, () => 'Home'),
                    h(BreadcrumbItem, {}, () => 'Level1'),
                    h(BreadcrumbItem, {}, () => 'Level2'),
                    h(BreadcrumbItem, {}, () => 'Level3'),
                    h(BreadcrumbItem, {}, () => 'Detail'),
                ],
            },
        });

        // Should show collapse icon
        expect(wrapper.find('.semi-breadcrumb-collapse').exists()).toBe(true);
        expect(wrapper.find('.semi-icon-more').exists()).toBe(true);
    });

    it('should expand collapsed items on click', async () => {
        const wrapper = mount(Breadcrumb, {
            props: {
                maxItemCount: 3,
                autoCollapse: true,
            },
            slots: {
                default: [
                    h(BreadcrumbItem, {}, () => 'Home'),
                    h(BreadcrumbItem, {}, () => 'Level1'),
                    h(BreadcrumbItem, {}, () => 'Level2'),
                    h(BreadcrumbItem, {}, () => 'Level3'),
                    h(BreadcrumbItem, {}, () => 'Detail'),
                ],
            },
        });

        const collapseButton = wrapper.find('.semi-breadcrumb-item-more');
        expect(collapseButton.exists()).toBe(true);

        await collapseButton.trigger('click');
        // After click, should not show collapse button anymore
        await wrapper.vm.$nextTick();
    });

    it('should support aria-label', () => {
        const wrapper = mount(Breadcrumb, {
            props: { 'aria-label': 'Custom breadcrumb' },
            slots: { default: h(BreadcrumbItem, {}, () => 'Home') },
        });

        expect(wrapper.find('nav').attributes('aria-label')).toBe('Custom breadcrumb');
    });
});

describe('BreadcrumbItem', () => {
    it('should render basic item', () => {
        const wrapper = mount(BreadcrumbItem, {
            slots: { default: 'Home' },
        });

        expect(wrapper.find('.semi-breadcrumb-item-wrap').exists()).toBe(true);
        expect(wrapper.text()).toContain('Home');
    });

    it('should render with href', () => {
        const wrapper = mount(BreadcrumbItem, {
            props: { href: '/home' },
            slots: { default: 'Home' },
        });

        const link = wrapper.find('a');
        expect(link.exists()).toBe(true);
        expect(link.attributes('href')).toBe('/home');
    });

    it('should render active item', () => {
        const wrapper = mount(BreadcrumbItem, {
            props: { active: true },
            slots: { default: 'Home' },
        });

        expect(wrapper.find('.semi-breadcrumb-item-active').exists()).toBe(true);
        expect(wrapper.attributes('aria-current')).toBe('page');
    });

    it('should render with custom separator', () => {
        const wrapper = mount(BreadcrumbItem, {
            props: { separator: '→' },
            slots: { default: 'Home' },
        });

        const separator = wrapper.find('.semi-breadcrumb-separator');
        expect(separator.text()).toBe('→');
    });

    it('should not render separator when shouldRenderSeparator is false', () => {
        const wrapper = mount(BreadcrumbItem, {
            props: { shouldRenderSeparator: false },
            slots: { default: 'Home' },
        });

        expect(wrapper.find('.semi-breadcrumb-separator').exists()).toBe(false);
    });

    it('should trigger click event', async () => {
        const onClick = vi.fn();
        const wrapper = mount(BreadcrumbItem, {
            props: { onClick },
            slots: { default: 'Home' },
        });

        await wrapper.find('.semi-breadcrumb-item').trigger('click');
        expect(onClick).toHaveBeenCalled();
    });

    it('should support noLink prop', () => {
        const wrapper = mount(BreadcrumbItem, {
            props: { noLink: true, href: '/home' },
            slots: { default: 'Home' },
        });

        expect(wrapper.find('.semi-breadcrumb-item-link').exists()).toBe(false);
    });
});


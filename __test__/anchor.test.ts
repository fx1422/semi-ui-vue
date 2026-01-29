import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Anchor from '../src/components/anchor/Anchor.vue';
import Link from '../src/components/anchor/Link.vue';

const BASE_CLASS_PREFIX = 'semi';

function mountAnchor(props = {}) {
    return mount(Anchor, {
        props,
        slots: {
            default: `
                <Link href="#welcome" title="welcome" />
                <Link href="#api" title="api too much to show">
                    <Link href="#docs" title="docs">
                        <Link href="#doc1" title="doc1" />
                        <Link href="#doc2" title="doc2" />
                    </Link>
                </Link>
                <Link href="#contact" title="contact" />
            `,
        },
        global: {
            components: { Link },
        },
    });
}

describe('Anchor', () => {
    it('renders with default props', () => {
        const wrapper = mount(Anchor);
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor`).exists()).toBe(true);
    });

    it('anchor small size', () => {
        const wrapper = mount(Anchor, {
            props: { size: 'small' },
        });
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-size-small`).exists()).toBe(true);
    });

    it('anchor rail theme', () => {
        const wrapper = mount(Anchor, {
            props: { railTheme: 'primary' },
        });
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-slide-bar-primary`).exists()).toBe(true);
    });

    it('anchor with custom className & style', () => {
        const wrapper = mount(Anchor, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
        });
        const anchor = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor`);
        expect(anchor.classes()).toContain('test');
        expect(anchor.element.style.color).toBe('red');
    });

    it('anchor max height and max width', () => {
        const wrapper = mount(Anchor, {
            props: {
                maxHeight: 50,
                maxWidth: 100,
            },
        });
        const anchor = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor`);
        expect(anchor.element.style.maxHeight).toBe('50px');
        expect(anchor.element.style.maxWidth).toBe('100px');
    });

    it('anchor with aria-label', () => {
        const wrapper = mount(Anchor, {
            props: {
                'aria-label': 'Custom navigation',
            },
        });
        const anchor = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor`);
        expect(anchor.attributes('aria-label')).toBe('Custom navigation');
    });

    it('anchor with default aria-label', () => {
        const wrapper = mount(Anchor);
        const anchor = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor`);
        expect(anchor.attributes('aria-label')).toBe('Side navigation');
    });

    it('anchor has navigation role', () => {
        const wrapper = mount(Anchor);
        const anchor = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor`);
        expect(anchor.attributes('role')).toBe('navigation');
    });

    it('anchor renders slide bar', () => {
        const wrapper = mount(Anchor);
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-slide`).exists()).toBe(true);
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-slide-bar`).exists()).toBe(true);
    });

    it('anchor renders link wrapper', () => {
        const wrapper = mount(Anchor);
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link-wrapper`).exists()).toBe(true);
    });

    it('anchor with different railTheme', () => {
        const themes = ['primary', 'tertiary', 'muted'];
        themes.forEach(theme => {
            const wrapper = mount(Anchor, {
                props: { railTheme: theme as any },
            });
            expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-slide-${theme}`).exists()).toBe(true);
        });
    });
});

describe('Anchor.Link', () => {
    it('renders link with title', () => {
        const wrapper = mount(Link, {
            props: {
                href: '#test',
                title: 'Test Link',
            },
        });
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link`).exists()).toBe(true);
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link-title`).exists()).toBe(true);
        expect(wrapper.text()).toContain('Test Link');
    });

    it('link with disabled state', () => {
        const wrapper = mount(Link, {
            props: {
                href: '#test',
                title: 'Test Link',
                disabled: true,
            },
        });
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link-title-disabled`).exists()).toBe(true);
        const linkTitle = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link-title`);
        expect(linkTitle.attributes('aria-disabled')).toBe('true');
    });

    it('link with custom className & style', () => {
        const wrapper = mount(Link, {
            props: {
                href: '#test',
                title: 'Test Link',
                className: 'custom-link',
                style: { fontWeight: 'bold' },
            },
        });
        const link = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link`);
        expect(link.classes()).toContain('custom-link');
        expect(link.element.style.fontWeight).toBe('bold');
    });

    it('link has role attributes', () => {
        const wrapper = mount(Link, {
            props: {
                href: '#test',
                title: 'Test Link',
            },
        });
        expect(wrapper.attributes('role')).toBe('listitem');
        const linkTitle = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link-title`);
        expect(linkTitle.attributes('role')).toBe('link');
        expect(linkTitle.attributes('tabindex')).toBe('0');
    });

    it('link title can be native title attribute', () => {
        const wrapper = mount(Link, {
            props: {
                href: '#test',
                title: 'Test Link',
            },
        });
        const linkTitle = wrapper.find(`.${BASE_CLASS_PREFIX}-anchor-link-title`);
        expect(linkTitle.attributes('title')).toBe('Test Link');
    });
});


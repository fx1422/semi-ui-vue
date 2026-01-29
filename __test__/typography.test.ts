import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { Typography, Text, Title, Paragraph } from '../src/components/typography';
import { cssClasses } from '@douyinfe/semi-foundation/typography/constants';

const PREFIX = cssClasses.PREFIX;

// 对照 packages/semi-ui/typography/__test__/typography.test.js
describe('Typography', () => {
    // 测试 Typography 基础组件
    it('should render Typography with default props', () => {
        const wrapper = mount(Typography, {
            slots: {
                default: 'Typography Content',
            },
        });

        expect(wrapper.classes()).toContain(PREFIX);
        expect(wrapper.text()).toBe('Typography Content');
        expect(wrapper.element.tagName.toLowerCase()).toBe('article');
    });

    it('should support custom component', () => {
        const wrapper = mount(Typography, {
            props: {
                component: 'section',
            },
            slots: {
                default: 'Content',
            },
        });

        expect(wrapper.element.tagName.toLowerCase()).toBe('section');
    });

    it('should support custom className and style', () => {
        const wrapper = mount(Typography, {
            props: {
                className: 'custom-class',
                style: { color: 'red' },
            },
            slots: {
                default: 'Content',
            },
        });

        expect(wrapper.classes()).toContain('custom-class');
        expect(wrapper.classes()).toContain(PREFIX);
        expect(wrapper.element.style.color).toBe('red');
    });
});

describe('Text', () => {
    it('should render Text with default props', () => {
        const wrapper = mount(Text, {
            slots: {
                default: 'Text Content',
            },
        });

        expect(wrapper.text()).toBe('Text Content');
        expect(wrapper.find('span').exists()).toBe(true);
    });

    it('should support different types', () => {
        const types = ['primary', 'secondary', 'tertiary', 'quaternary', 'warning', 'danger', 'success'] as const;

        types.forEach((type) => {
            const wrapper = mount(Text, {
                props: { type },
                slots: { default: 'Text' },
            });
            expect(wrapper.classes()).toContain(`${PREFIX}-${type}`);
        });
    });

    it('should support different sizes', () => {
        const sizes = ['normal', 'small', 'inherit'] as const;

        sizes.forEach((size) => {
            const wrapper = mount(Text, {
                props: { size },
                slots: { default: 'Text' },
            });
            expect(wrapper.classes()).toContain(`${PREFIX}-${size}`);
        });
    });

    it('should support strong', () => {
        const wrapper = mount(Text, {
            props: { strong: true },
            slots: { default: 'Strong Text' },
        });

        expect(wrapper.find('strong').exists()).toBe(true);
        expect(wrapper.find('strong').text()).toBe('Strong Text');
    });

    it('should support mark', () => {
        const wrapper = mount(Text, {
            props: { mark: true },
            slots: { default: 'Marked Text' },
        });

        expect(wrapper.find('mark').exists()).toBe(true);
        expect(wrapper.find('mark').text()).toBe('Marked Text');
    });

    it('should support code', () => {
        const wrapper = mount(Text, {
            props: { code: true },
            slots: { default: 'Code Text' },
        });

        expect(wrapper.find('code').exists()).toBe(true);
        expect(wrapper.find('code').text()).toBe('Code Text');
    });

    it('should support underline', () => {
        const wrapper = mount(Text, {
            props: { underline: true },
            slots: { default: 'Underline Text' },
        });

        expect(wrapper.find('u').exists()).toBe(true);
        expect(wrapper.find('u').text()).toBe('Underline Text');
    });

    it('should support delete', () => {
        const wrapper = mount(Text, {
            props: { delete: true },
            slots: { default: 'Deleted Text' },
        });

        expect(wrapper.find('del').exists()).toBe(true);
        expect(wrapper.find('del').text()).toBe('Deleted Text');
    });

    it('should support link', () => {
        const wrapper = mount(Text, {
            props: {
                link: { href: 'https://example.com', target: '_blank' },
            },
            slots: { default: 'Link Text' },
        });

        const link = wrapper.find('a');
        expect(link.exists()).toBe(true);
        expect(link.attributes('href')).toBe('https://example.com');
        expect(link.attributes('target')).toBe('_blank');
    });

    it('should support disabled', () => {
        const wrapper = mount(Text, {
            props: { disabled: true },
            slots: { default: 'Disabled Text' },
        });

        expect(wrapper.classes()).toContain(`${PREFIX}-disabled`);
    });

    it('should support link as boolean', () => {
        const wrapper = mount(Text, {
            props: { link: true },
            slots: { default: 'Link Text' },
        });

        expect(wrapper.find('a').exists()).toBe(true);
    });

    it('should render as span when link and disabled', () => {
        const wrapper = mount(Text, {
            props: {
                link: { href: 'https://example.com' },
                disabled: true,
            },
            slots: { default: 'Disabled Link' },
        });

        // disabled link 应该渲染为 span，不是 a
        expect(wrapper.find('a').exists()).toBe(false);
        expect(wrapper.element.tagName.toLowerCase()).toBe('span');
    });

    it('should support weight', () => {
        const wrapper = mount(Text, {
            props: { weight: 600 },
            slots: { default: 'Text' },
        });

        expect(wrapper.element.style.fontWeight).toBe('600');
    });

    it('should support weight as string', () => {
        const wrapper = mount(Text, {
            props: { weight: 'bold' },
            slots: { default: 'Text' },
        });

        expect(wrapper.classes()).toContain(`${PREFIX}-weight-bold`);
    });
});

describe('Title', () => {
    it('should render Title with default heading', () => {
        const wrapper = mount(Title, {
            slots: {
                default: 'Title Content',
            },
        });

        expect(wrapper.find('h1').exists()).toBe(true);
        expect(wrapper.text()).toBe('Title Content');
    });

    it('should support different heading levels', () => {
        const headings = [1, 2, 3, 4, 5, 6] as const;

        headings.forEach((heading) => {
            const wrapper = mount(Title, {
                props: { heading },
                slots: { default: `Heading ${heading}` },
            });
            expect(wrapper.find(`h${heading}`).exists()).toBe(true);
            expect(wrapper.classes()).toContain(`${PREFIX}-h${heading}`);
        });
    });

    it('should support all text decorations', () => {
        const wrapper = mount(Title, {
            props: {
                heading: 2,
                strong: true,
                mark: true,
                underline: true,
            },
            slots: { default: 'Title' },
        });

        expect(wrapper.find('h2').exists()).toBe(true);
        expect(wrapper.find('strong').exists()).toBe(true);
        expect(wrapper.find('mark').exists()).toBe(true);
        expect(wrapper.find('u').exists()).toBe(true);
    });

    it('should support weight', () => {
        const wrapper = mount(Title, {
            props: {
                heading: 1,
                weight: 700,
            },
            slots: { default: 'Bold Title' },
        });

        expect(wrapper.element.style.fontWeight).toBe('700');
    });
});

describe('Paragraph', () => {
    it('should render Paragraph with default props', () => {
        const wrapper = mount(Paragraph, {
            slots: {
                default: 'Paragraph Content',
            },
        });

        expect(wrapper.find('p').exists()).toBe(true);
        expect(wrapper.classes()).toContain(`${PREFIX}-paragraph`);
        expect(wrapper.text()).toBe('Paragraph Content');
    });

    it('should support different sizes', () => {
        const sizes = ['normal', 'small'] as const;

        sizes.forEach((size) => {
            const wrapper = mount(Paragraph, {
                props: { size },
                slots: { default: 'Paragraph' },
            });
            expect(wrapper.classes()).toContain(`${PREFIX}-${size}`);
        });
    });

    it('should support spacing', () => {
        const spacings = ['normal', 'extended'] as const;

        spacings.forEach((spacing) => {
            const wrapper = mount(Paragraph, {
                props: { spacing },
                slots: { default: 'Paragraph' },
            });
            expect(wrapper.classes()).toContain(`${PREFIX}-spacing-${spacing}`);
        });
    });

    it('should support all decorations', () => {
        const wrapper = mount(Paragraph, {
            props: {
                strong: true,
                mark: true,
                code: true,
                delete: true,
            },
            slots: { default: 'Paragraph' },
        });

        expect(wrapper.find('p').exists()).toBe(true);
        expect(wrapper.find('strong').exists()).toBe(true);
        expect(wrapper.find('mark').exists()).toBe(true);
        expect(wrapper.find('code').exists()).toBe(true);
        expect(wrapper.find('del').exists()).toBe(true);
    });
});


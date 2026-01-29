import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Highlight from '../src/components/highlight/Highlight.vue';
import { cssClasses } from '@douyinfe/semi-foundation/highlight/constants';

const PREFIX = cssClasses.PREFIX;

// 对照 React Highlight 组件的测试（参考其他组件的测试模式）
describe('Highlight', () => {
    it('should render with default props', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test'],
                sourceString: 'This is a test string',
            },
        });

        expect(wrapper.exists()).toBe(true);
    });

    it('should highlight search words', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test'],
                sourceString: 'This is a test string',
            },
        });

        // Should contain highlighted text
        const html = wrapper.html();
        expect(html).toContain('test');
    });

    it('should render with custom className', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test'],
                sourceString: 'This is a test string',
                className: 'custom-class',
            },
        });

        expect(wrapper.classes()).toContain('custom-class');
    });

    it('should render with custom style', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test'],
                sourceString: 'This is a test string',
                style: { color: 'red' },
            },
        });

        expect((wrapper.element as HTMLElement).style.color).toBe('red');
    });

    it('should handle multiple search words', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test', 'string'],
                sourceString: 'This is a test string',
            },
        });

        const html = wrapper.html();
        expect(html).toContain('test');
        expect(html).toContain('string');
    });

    it('should handle empty search words', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: [],
                sourceString: 'This is a test string',
            },
        });

        expect(wrapper.text()).toBe('This is a test string');
    });

    it('should handle empty sourceString', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test'],
                sourceString: '',
            },
        });

        expect(wrapper.text()).toBe('');
    });

    it('should be case sensitive when caseSensitive is true', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['Test'],
                sourceString: 'This is a test string',
                caseSensitive: true,
            },
        });

        // Case sensitive search should not match lowercase 'test'
        const html = wrapper.html();
        // Should not highlight 'test' when searching for 'Test'
        expect(html).not.toContain('semi-highlight');
    });

    it('should not be case sensitive by default', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['Test'],
                sourceString: 'This is a test string',
                caseSensitive: false,
            },
        });

        // Should highlight 'test' when searching for 'Test' (case insensitive)
        const html = wrapper.html();
        expect(html).toContain('semi-highlight');
    });

    it('should use custom highlightClassName', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test'],
                sourceString: 'This is a test string',
                highlightClassName: 'custom-highlight',
            },
        });

        const html = wrapper.html();
        expect(html).toContain('custom-highlight');
    });

    it('should use custom highlightStyle', () => {
        const wrapper = mount(Highlight, {
            props: {
                searchWords: ['test'],
                sourceString: 'This is a test string',
                highlightStyle: { backgroundColor: 'yellow' },
            },
        });

        const html = wrapper.html();
        expect(html).toContain('background-color');
    });
});


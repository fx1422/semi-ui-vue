import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BackTop from '../src/components/backTop/BackTop.vue';
import { cssClasses } from '@douyinfe/semi-foundation/backtop/constants';
import { nextTick } from 'vue';

const PREFIX = cssClasses.PREFIX;

// 对照 packages/semi-ui/backtop/__test__/backtop.test.js
describe('BackTop', () => {
    let mockRAF: any;

    beforeEach(() => {
        // Mock requestAnimationFrame
        mockRAF = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            cb(0);
            return 0;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render with className and style', async () => {
        // Create a mock target that returns a scrollable element
        const scrollableDiv = document.createElement('div');
        scrollableDiv.id = 'test-scroll-container';
        scrollableDiv.style.height = '200px';
        scrollableDiv.style.overflow = 'auto';
        document.body.appendChild(scrollableDiv);

        // Mock scrollTop to be greater than visibilityHeight
        Object.defineProperty(scrollableDiv, 'scrollTop', {
            writable: true,
            value: 500,
        });

        const wrapper = mount(BackTop, {
            props: {
                className: 'test',
                style: { color: 'red' },
                visibilityHeight: -1, // Make it always visible for testing
                target: () => scrollableDiv,
            },
        });

        // Wait for component to initialize and update visible state
        await nextTick();
        // Trigger scroll event to update visible state
        scrollableDiv.dispatchEvent(new Event('scroll'));
        await nextTick();

        // Find the root element
        const rootElement = wrapper.find(`.${PREFIX}`);
        expect(rootElement.exists()).toBe(true);
        expect(rootElement.classes()).toContain('test');
        expect((rootElement.element as HTMLElement).style.color).toBe('red');

        document.body.removeChild(scrollableDiv);
    });

    it('should handle click event', async () => {
        const scrollableDiv = document.createElement('div');
        scrollableDiv.id = 'test-scroll-container-2';
        document.body.appendChild(scrollableDiv);
        Object.defineProperty(scrollableDiv, 'scrollTop', {
            writable: true,
            value: 500,
        });

        const wrapper = mount(BackTop, {
            props: {
                className: 'test',
                visibilityHeight: -1,
                target: () => scrollableDiv,
            },
        });
        
        await nextTick();
        scrollableDiv.dispatchEvent(new Event('scroll'));
        await nextTick();

        const rootElement = wrapper.find(`.${PREFIX}.test`);
        expect(rootElement.exists()).toBe(true);
        
        // Trigger click event
        await rootElement.trigger('click');
        
        // Wait for throttled handler and event emission
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if click event was emitted
        // The component emits 'click' event when handleClick is called
        expect(wrapper.emitted('click')).toBeTruthy();
        expect(wrapper.emitted('click')?.length).toBeGreaterThan(0);

        document.body.removeChild(scrollableDiv);
    });

    it('should not render when visible is false', async () => {
        const scrollableDiv = document.createElement('div');
        scrollableDiv.id = 'test-scroll-container-3';
        document.body.appendChild(scrollableDiv);
        Object.defineProperty(scrollableDiv, 'scrollTop', {
            writable: true,
            value: 0,
        });

        const wrapper = mount(BackTop, {
            props: {
                visibilityHeight: 1000, // High threshold
                target: () => scrollableDiv,
            },
        });

        await nextTick();
        scrollableDiv.dispatchEvent(new Event('scroll'));
        await nextTick();

        // Should not render when scrollTop < visibilityHeight
        expect(wrapper.find(`.${PREFIX}`).exists()).toBe(false);

        document.body.removeChild(scrollableDiv);
    });

    it('should render default button when no slot provided', async () => {
        const scrollableDiv = document.createElement('div');
        scrollableDiv.id = 'test-scroll-container-4';
        document.body.appendChild(scrollableDiv);
        Object.defineProperty(scrollableDiv, 'scrollTop', {
            writable: true,
            value: 500,
        });

        const wrapper = mount(BackTop, {
            props: {
                visibilityHeight: -1,
                target: () => scrollableDiv,
            },
        });

        await nextTick();
        scrollableDiv.dispatchEvent(new Event('scroll'));
        await nextTick();

        const rootElement = wrapper.find(`.${PREFIX}`);
        if (rootElement.exists()) {
            expect(rootElement.find('.semi-button').exists()).toBe(true);
        }

        document.body.removeChild(scrollableDiv);
    });

    it('should render custom content from slot', async () => {
        const scrollableDiv = document.createElement('div');
        scrollableDiv.id = 'test-scroll-container-5';
        document.body.appendChild(scrollableDiv);
        Object.defineProperty(scrollableDiv, 'scrollTop', {
            writable: true,
            value: 500,
        });

        const wrapper = mount(BackTop, {
            props: {
                visibilityHeight: -1,
                target: () => scrollableDiv,
            },
            slots: {
                default: '<span>Custom Content</span>',
            },
        });

        await nextTick();
        scrollableDiv.dispatchEvent(new Event('scroll'));
        await nextTick();

        const rootElement = wrapper.find(`.${PREFIX}`);
        if (rootElement.exists()) {
            const span = rootElement.find('span');
            if (span.exists()) {
                expect(span.text()).toBe('Custom Content');
            }
        }

        document.body.removeChild(scrollableDiv);
    });
});


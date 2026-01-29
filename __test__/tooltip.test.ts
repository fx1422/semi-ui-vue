import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Tooltip from '../src/components/tooltip';
import Button from '../src/components/button';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

describe('Tooltip', () => {
    let wrapper: VueWrapper<any>;

    beforeEach(() => {
        // Clean up any existing tooltips in the DOM
        const tooltips = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-portal-inner`);
        tooltips.forEach((tooltip) => tooltip.remove());
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    it('should render tooltip with default props', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Test content',
            },
            slots: {
                default: 'Hover me',
            },
        });

        expect(wrapper.exists()).toBe(true);
        expect(wrapper.text()).toContain('Hover me');
    });

    it('should show tooltip on hover trigger', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Test content',
                trigger: 'hover',
                motion: false,
            },
            slots: {
                default: '<button>Hover me</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Find the trigger wrapper
        const trigger = wrapper.find('.semi-tooltip-trigger');
        expect(trigger.exists()).toBe(true);

        // Hover over trigger
        await trigger.trigger('mouseenter');
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if portal is inserted
        const portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeTruthy();

        // Check content
        const content = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-content`);
        expect(content?.textContent).toContain('Test content');
    });

    it('should show tooltip on click trigger', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Click content',
                trigger: 'click',
                motion: false,
            },
            slots: {
                default: '<button>Click me</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const trigger = wrapper.find('.semi-tooltip-trigger');

        // Click trigger
        await trigger.trigger('click');
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if portal is inserted
        const portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeTruthy();
    });

    it('should show tooltip on focus trigger', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Focus content',
                trigger: 'focus',
                motion: false,
            },
            slots: {
                default: '<input placeholder="Focus me" />',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const trigger = wrapper.find('.semi-tooltip-trigger');

        // Focus trigger
        await trigger.trigger('focus');
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if portal is inserted
        const portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeTruthy();
    });

    it('should respect visible prop (controlled mode)', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Controlled content',
                trigger: 'custom',
                visible: true,
                motion: false,
            },
            slots: {
                default: '<button>Controlled</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should be visible immediately
        let portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeTruthy();

        // Update to hidden
        await wrapper.setProps({ visible: false });
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should be hidden
        portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeFalsy();
    });

    it('should support different positions', async () => {
        const positions = ['top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

        for (const position of positions) {
            wrapper = mount(Tooltip, {
                props: {
                    content: `${position} content`,
                    position,
                    visible: true,
                    trigger: 'custom',
                    motion: false,
                },
                slots: {
                    default: '<button>Test</button>',
                },
                attachTo: document.body,
            });

            await nextTick();
            await new Promise((resolve) => setTimeout(resolve, 100));

            const tooltipWrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-wrapper`);
            expect(tooltipWrapper).toBeTruthy();
            expect(tooltipWrapper?.getAttribute('x-placement')).toBe(position);

            wrapper.unmount();
            await nextTick();
        }
    });

    it('should hide tooltip on click outside', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Test content',
                trigger: 'click',
                motion: false,
            },
            slots: {
                default: '<button>Click me</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const trigger = wrapper.find('.semi-tooltip-trigger');

        // Click to show
        await trigger.trigger('click');
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        let portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeTruthy();

        // Click outside
        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeFalsy();
    });

    it('should respect mouseEnterDelay and mouseLeaveDelay', async () => {
        vi.useFakeTimers();

        wrapper = mount(Tooltip, {
            props: {
                content: 'Delayed content',
                trigger: 'hover',
                mouseEnterDelay: 500,
                mouseLeaveDelay: 300,
                motion: false,
            },
            slots: {
                default: '<button>Hover me</button>',
            },
            attachTo: document.body,
        });

        await nextTick();

        const trigger = wrapper.find('.semi-tooltip-trigger');

        // Hover over trigger
        await trigger.trigger('mouseenter');
        await nextTick();

        // Should not be visible immediately
        let portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeFalsy();

        // Fast forward time
        vi.advanceTimersByTime(500);
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should be visible after delay
        portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeTruthy();

        vi.useRealTimers();
    });

    it('should emit visibleChange event', async () => {
        const onVisibleChange = vi.fn();

        wrapper = mount(Tooltip, {
            props: {
                content: 'Test content',
                trigger: 'click',
                motion: false,
                onVisibleChange,
            },
            slots: {
                default: '<button>Click me</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const trigger = wrapper.find('.semi-tooltip-trigger');

        // Click to show
        await trigger.trigger('click');
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));

        expect(onVisibleChange).toHaveBeenCalledWith(true);

        // Click outside to hide
        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(onVisibleChange).toHaveBeenCalledWith(false);
    });

    it('should show/hide arrow based on showArrow prop', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Test content',
                trigger: 'custom',
                visible: true,
                showArrow: true,
                motion: false,
            },
            slots: {
                default: '<button>Test</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        let arrow = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-icon-arrow`);
        expect(arrow).toBeTruthy();

        // Update to hide arrow
        await wrapper.setProps({ showArrow: false });
        await nextTick();

        arrow = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-icon-arrow`);
        expect(arrow).toBeFalsy();
    });

    it('should apply custom className and style', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Styled content',
                trigger: 'custom',
                visible: true,
                className: 'custom-tooltip',
                style: { backgroundColor: 'red', color: 'white' },
                motion: false,
            },
            slots: {
                default: '<button>Test</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const tooltipWrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-wrapper`);
        expect(tooltipWrapper?.classList.contains('custom-tooltip')).toBe(true);

        const style = (tooltipWrapper as HTMLElement)?.style;
        expect(style?.backgroundColor).toBe('red');
        expect(style?.color).toBe('white');
    });

    it('should support clickToHide prop', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Click to hide content',
                trigger: 'click',
                clickToHide: true,
                motion: false,
            },
            slots: {
                default: '<button>Test</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const trigger = wrapper.find('.semi-tooltip-trigger');

        // Click to show
        await trigger.trigger('click');
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        let portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeTruthy();

        // Click inside tooltip
        const tooltipWrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-wrapper`);
        (tooltipWrapper as HTMLElement)?.click();
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should be hidden
        portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal-inner`);
        expect(portal).toBeFalsy();
    });

    it('should support autoAdjustOverflow prop', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Auto adjust content',
                trigger: 'custom',
                visible: true,
                position: 'top',
                autoAdjustOverflow: true,
                motion: false,
            },
            slots: {
                default: '<button>Test</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const tooltipWrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-wrapper`);
        expect(tooltipWrapper).toBeTruthy();
        // The position might be adjusted based on viewport, but we can't easily test the exact value
    });

    it('should support render function as content', async () => {
        const renderContent = () => 'Rendered content';

        wrapper = mount(Tooltip, {
            props: {
                content: renderContent,
                trigger: 'custom',
                visible: true,
                motion: false,
            },
            slots: {
                default: '<button>Test</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const content = document.querySelector(`.${BASE_CLASS_PREFIX}-tooltip-content`);
        expect(content?.textContent).toContain('Rendered content');
    });

    it('should expose rePosition method', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Test content',
                trigger: 'custom',
                visible: true,
                motion: false,
            },
            slots: {
                default: '<button>Test</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.vm.rePosition).toBeDefined();
        expect(typeof wrapper.vm.rePosition).toBe('function');

        // Call rePosition
        wrapper.vm.rePosition();
        await nextTick();
        // If no error is thrown, the method works
    });

    it('should expose focusTrigger method', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Test content',
            },
            slots: {
                default: '<button>Test</button>',
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.vm.focusTrigger).toBeDefined();
        expect(typeof wrapper.vm.focusTrigger).toBe('function');
    });

    it('should work with Button component', async () => {
        wrapper = mount(Tooltip, {
            props: {
                content: 'Button tooltip',
                trigger: 'hover',
                motion: false,
            },
            slots: {
                default: () => mount(Button, { slots: { default: 'Click me' } }).html(),
            },
            attachTo: document.body,
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.exists()).toBe(true);
    });
});


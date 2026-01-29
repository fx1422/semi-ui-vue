import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Toast, { ToastFactory } from '../src/components/toast';
import useToast from '../src/components/toast/useToast';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

// Helper function to wait for toast to appear
// Use polling to check if toast is ready instead of fixed timeout
// Similar to React version, but Vue needs to wait for component initialization
const waitForToast = async (maxWait = 800) => {
    await nextTick();
    
    // Poll for toast to appear, checking every 50ms
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
        const wrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        if (wrapper && toast) {
            // Toast is ready
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
};

// Helper function to wait for toast to disappear (including animation)
const waitForToastToClose = async () => {
    await nextTick();
    // Wait for animation to complete (typically 200-300ms)
    await new Promise((resolve) => setTimeout(resolve, 400));
};

describe('Toast', () => {
    beforeEach(() => {
        // Clean up any existing toasts in the DOM (similar to React version)
        const tw = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        if (tw && tw.firstElementChild) {
            // Clear innerHTML like React version does
            (tw.firstElementChild as HTMLElement).innerHTML = '';
        }
        // Also remove wrapper if exists
        const toasts = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        toasts.forEach((toast) => toast.remove());
        // Reset global config
        Toast.config({});
    });

    afterEach(async () => {
        // Clean up all toasts
        try {
            Toast.destroyAll();
            await waitForToastToClose();
        } catch (e) {
            // Ignore cleanup errors
        }
        // Clean up DOM
        const toasts = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        toasts.forEach((toast) => {
            try {
                toast.remove();
            } catch (e) {
                // Ignore removal errors
            }
        });
        // Reset config
        Toast.config({});
    });

    it('should create toast with info method', async () => {
        // Use motion: false like React version for faster tests
        const id = Toast.info({ content: 'Test info message', motion: false });
        expect(id).toBeTruthy();
        expect(typeof id).toBe('string');

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-info`);
        expect(toast).toBeTruthy();
        expect(toast?.textContent).toContain('Test info message');
    });

    it('should create toast with success method', async () => {
        const id = Toast.success('Test success message');
        expect(id).toBeTruthy();

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();
        expect(toast?.classList.contains(`${BASE_CLASS_PREFIX}-toast-success`)).toBe(true);
    });

    it('should create toast with error method', async () => {
        const id = Toast.error('Test error message');
        expect(id).toBeTruthy();

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();
        expect(toast?.classList.contains(`${BASE_CLASS_PREFIX}-toast-error`)).toBe(true);
    });

    it('should create toast with warning method', async () => {
        const id = Toast.warning('Test warning message');
        expect(id).toBeTruthy();

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();
        expect(toast?.classList.contains(`${BASE_CLASS_PREFIX}-toast-warning`)).toBe(true);
    });

    it('should create toast with open method', async () => {
        const id = Toast.open('Test open message');
        expect(id).toBeTruthy();

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();
    });

    it('should create toast with object config', async () => {
        const id = Toast.info({
            content: 'Test content',
            duration: 5,
            showClose: true,
        });
        expect(id).toBeTruthy();

        await waitForToast();

        const content = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-content`);
        expect(content?.textContent).toContain('Test content');
    });

    it('should close toast by id', async () => {
        const id = Toast.info('Test message');
        expect(id).toBeTruthy();

        await waitForToast();

        let toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();

        Toast.close(id);
        await waitForToastToClose();

        toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeFalsy();
    });

    it('should destroy all toasts', async () => {
        Toast.info('Message 1');
        Toast.success('Message 2');
        Toast.error('Message 3');

        await waitForToast();

        let toasts = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toasts.length).toBeGreaterThan(0);

        Toast.destroyAll();
        await waitForToastToClose();

        toasts = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toasts.length).toBe(0);
    });

    it('should support custom position (top)', async () => {
        Toast.config({ top: 100 });
        const id = Toast.info('Top positioned toast');

        await waitForToast();

        const wrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        expect(wrapper).toBeTruthy();
        const style = (wrapper as HTMLElement)?.style;
        expect(style?.top).toBe('100px');
    });

    it('should support custom position (bottom)', async () => {
        Toast.config({ bottom: 50 });
        const id = Toast.info('Bottom positioned toast');

        await waitForToast();

        const wrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        expect(wrapper).toBeTruthy();
        const style = (wrapper as HTMLElement)?.style;
        expect(style?.bottom).toBe('50px');
    });

    it('should support custom zIndex', async () => {
        Toast.config({ zIndex: 9999 });
        const id = Toast.info('Custom zIndex toast');

        await waitForToast();

        const wrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        expect(wrapper).toBeTruthy();
        const style = (wrapper as HTMLElement)?.style;
        expect(style?.zIndex).toBe('9999');
    });

    it('should support custom duration', async () => {
        vi.useFakeTimers();

        Toast.config({ duration: 2 });
        const id = Toast.info('Short duration toast');

        // With fake timers, we need to advance time manually
        await nextTick();
        vi.advanceTimersByTime(500);

        let toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();

        // Fast forward time to trigger auto-close
        vi.advanceTimersByTime(2000);
        await nextTick();
        vi.advanceTimersByTime(400); // Wait for animation

        toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeFalsy();

        vi.useRealTimers();
    }, 10000);

    it('should support custom theme', async () => {
        Toast.config({ theme: 'light' });
        const id = Toast.info('Light theme toast');

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();
        expect(toast?.classList.contains(`${BASE_CLASS_PREFIX}-toast-light`)).toBe(true);
    }, 10000);

    it('should support custom getPopupContainer', async () => {
        const container = document.createElement('div');
        container.id = 'custom-toast-container';
        document.body.appendChild(container);

        Toast.config({
            getPopupContainer: () => container,
        });

        const id = Toast.info('Custom container toast');

        await waitForToast(600);

        const wrapper = container.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        expect(wrapper).toBeTruthy();

        // Clean up
        Toast.destroyAll();
        await waitForToastToClose();
        document.body.removeChild(container);
    }, 10000);

    it('should support showClose prop', async () => {
        const id = Toast.info({
            content: 'Toast with close button',
            showClose: true,
        });

        await waitForToast();

        const closeButton = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-close-button`);
        expect(closeButton).toBeTruthy();
    }, 10000);

    it('should support hideClose prop', async () => {
        const id = Toast.info({
            content: 'Toast without close button',
            showClose: false,
        });

        await waitForToast();

        const closeButton = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-close-button`);
        expect(closeButton).toBeFalsy();
    }, 10000);

    it('should support custom icon', async () => {
        const id = Toast.info({
            content: 'Toast with custom icon',
            icon: '🚀',
        });

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast?.textContent).toContain('🚀');
    }, 10000);

    it('should support onClose callback', async () => {
        const onClose = vi.fn();
        const id = Toast.info({
            content: 'Toast with onClose',
            onClose,
        });

        await waitForToast();

        Toast.close(id);
        await waitForToastToClose();

        expect(onClose).toHaveBeenCalled();
    }, 10000);

    it('should support custom className', async () => {
        const id = Toast.info({
            content: 'Custom className toast',
            className: 'custom-toast-class',
        });

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast?.classList.contains('custom-toast-class')).toBe(true);
    }, 10000);

    it('should support custom style', async () => {
        const id = Toast.info({
            content: 'Custom style toast',
            style: { backgroundColor: 'red', color: 'white' },
        });

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`) as HTMLElement;
        expect(toast).toBeTruthy();
        expect(toast?.style.backgroundColor).toBe('red');
        expect(toast?.style.color).toBe('white');
    }, 10000);

    it('should support stack mode', async () => {
        const id1 = Toast.info({
            content: 'Stack toast 1',
            stack: true,
        });
        const id2 = Toast.info({
            content: 'Stack toast 2',
            stack: true,
        });

        await waitForToast(600);

        const toasts = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toasts.length).toBeGreaterThanOrEqual(2);
    }, 10000);

    it('should support textMaxWidth', async () => {
        const id = Toast.info({
            content: 'Long message that should be wrapped',
            textMaxWidth: 200,
        });

        await waitForToast();

        const content = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-content-text`) as HTMLElement;
        expect(content).toBeTruthy();
        expect(content?.style.maxWidth).toBe('200px');
    }, 10000);

    it('should create multiple toasts', async () => {
        const id1 = Toast.info('Message 1');
        const id2 = Toast.success('Message 2');
        const id3 = Toast.error('Message 3');

        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();
        expect(id3).toBeTruthy();
        expect(id1).not.toBe(id2);
        expect(id2).not.toBe(id3);

        await waitForToast(600);

        const toasts = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toasts.length).toBeGreaterThanOrEqual(3);
    }, 10000);

    it('should work with ToastFactory.create', async () => {
        const toastInstance = ToastFactory.create({
            top: 200,
            zIndex: 5000,
        });

        const id = toastInstance.info('Factory created toast');

        await waitForToast();

        const wrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        expect(wrapper).toBeTruthy();
        const style = (wrapper as HTMLElement)?.style;
        expect(style?.top).toBe('200px');
        expect(style?.zIndex).toBe('5000');
    }, 10000);

    it('should support useToast hook', async () => {
        const [toast, ContextHolder] = useToast();

        const wrapper = mount(ContextHolder, {
            attachTo: document.body,
        });

        await nextTick();

        const id = toast.info('Hook toast message');
        expect(id).toBeTruthy();

        await waitForToast();

        const toastElement = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toastElement).toBeTruthy();

        wrapper.unmount();
    }, 10000);

    it('should support useToast hook with all methods', async () => {
        const [toast, ContextHolder] = useToast();

        const wrapper = mount(ContextHolder, {
            attachTo: document.body,
        });

        await nextTick();

        toast.success('Success');
        toast.info('Info');
        toast.warning('Warning');
        toast.error('Error');
        toast.open('Open');

        await waitForToast(600);

        const toasts = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toasts.length).toBeGreaterThanOrEqual(5);

        wrapper.unmount();
    }, 10000);

    it('should support useToast hook close method', async () => {
        const [toast, ContextHolder] = useToast();

        const wrapper = mount(ContextHolder, {
            attachTo: document.body,
        });

        await nextTick();

        const id = toast.info('Hook toast to close');
        expect(id).toBeTruthy();

        await waitForToast();

        let toastElement = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toastElement).toBeTruthy();

        toast.close(id);
        await waitForToastToClose();

        toastElement = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toastElement).toBeFalsy();

        wrapper.unmount();
    }, 10000);

    it('should handle position conflicts (top vs bottom)', async () => {
        Toast.config({ top: 100, bottom: 50 });
        const id = Toast.info('Position conflict test');

        await waitForToast();

        const wrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        const style = (wrapper as HTMLElement)?.style;
        // bottom should take precedence
        expect(style?.bottom).toBe('50px');
        expect(style?.top).toBe('unset');
    }, 10000);

    it('should handle position conflicts (left vs right)', async () => {
        Toast.config({ left: 100, right: 50 });
        const id = Toast.info('Position conflict test');

        await waitForToast();

        const wrapper = document.querySelector(`.${BASE_CLASS_PREFIX}-toast-wrapper`);
        const style = (wrapper as HTMLElement)?.style;
        // right should take precedence
        expect(style?.right).toBe('50px');
        expect(style?.left).toBe('unset');
    }, 10000);

    it('should support motion prop', async () => {
        const id = Toast.info({
            content: 'No motion toast',
            motion: false,
        });

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();
    }, 10000);

    it('should support direction prop', async () => {
        const id = Toast.info({
            content: 'RTL toast',
            direction: 'rtl',
        });

        await waitForToast();

        const toast = document.querySelector(`.${BASE_CLASS_PREFIX}-toast`);
        expect(toast).toBeTruthy();
        expect(toast?.getAttribute('dir')).toBe('rtl');
    }, 10000);
});


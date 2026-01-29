import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick, h } from 'vue';
import Modal from '../src/components/modal';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

const prefixCls = `${BASE_CLASS_PREFIX}-modal`;

// Helper function to wait for modal to render
async function waitForModal() {
    await nextTick();
    await nextTick();
    // Wait a bit longer for createApp().mount() to complete
    await new Promise(resolve => setTimeout(resolve, 150));
}

// Helper function to clean up portals
function cleanupPortals() {
    const portals = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-portal`);
    portals.forEach(portal => {
        if (portal.parentNode) {
            portal.parentNode.removeChild(portal);
        }
    });
}

describe('Modal Imperative Calls', () => {
    beforeEach(() => {
        const div = document.createElement('div');
        div.setAttribute('id', 'container');
        document.body.appendChild(div);
    });

    afterEach(() => {
        const container = document.getElementById('container');
        if (container) {
            document.body.removeChild(container);
        }
        cleanupPortals();
        document.body.innerHTML = '';
    });

    it('should render confirm modal with title and content', async () => {
        Modal.confirm({ title: 'Semi', content: 'Content', motion: false });

        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}-confirm`);
        expect(modal).toBeTruthy();
        expect(modal?.querySelector(`.${prefixCls}-title`)?.textContent).toBe('Semi');
        expect(modal?.querySelector(`.${prefixCls}-confirm-content`)?.textContent).toBe('Content');
    });

    it('should render different types: info, success, error, warning', async () => {
        // Test info
        Modal.info({ title: 'Info', content: 'Info Content', motion: false });
        await waitForModal();
        
        let modal = document.querySelector(`.${prefixCls}-confirm`);
        expect(modal?.querySelector(`.${prefixCls}-confirm-icon.${prefixCls}-info-icon`)).toBeTruthy();
        
        cleanupPortals();

        // Test success
        Modal.success({ title: 'Success', content: 'Success Content', motion: false });
        await waitForModal();
        
        modal = document.querySelector(`.${prefixCls}-confirm`);
        expect(modal?.querySelector(`.${prefixCls}-confirm-icon.${prefixCls}-success-icon`)).toBeTruthy();
        
        cleanupPortals();

        // Test error
        Modal.error({ title: 'Error', content: 'Error Content', motion: false });
        await waitForModal();
        
        modal = document.querySelector(`.${prefixCls}-confirm`);
        expect(modal?.querySelector(`.${prefixCls}-error-icon`)).toBeTruthy();
        
        cleanupPortals();

        // Test warning
        Modal.warning({ title: 'Warning', content: 'Warning Content', motion: false });
        await waitForModal();
        
        modal = document.querySelector(`.${prefixCls}-confirm`);
        expect(modal?.querySelector(`.${prefixCls}-confirm-icon.${prefixCls}-warning-icon`)).toBeTruthy();
    });

    it('should render with custom icon', async () => {
        const customIcon = h('span', { class: 'custom-test-icon' }, '🎯');
        
        Modal.confirm({
            title: 'Custom Icon',
            content: 'Content',
            icon: customIcon,
            motion: false,
        });
        
        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}-confirm`);
        expect(modal?.querySelector('.custom-test-icon')).toBeTruthy();
        expect(modal?.querySelector('.custom-test-icon')?.textContent).toBe('🎯');
    });

    it('should call onOk and onCancel callbacks', async () => {
        const onOk = vi.fn();
        const onCancel = vi.fn();
        
        Modal.confirm({
            title: 'Confirm',
            content: 'Content',
            onOk,
            onCancel,
            motion: false,
        });
        
        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}-confirm`);
        const buttons = modal?.querySelectorAll(`.${BASE_CLASS_PREFIX}-button`);
        
        expect(buttons).toBeTruthy();
        expect(buttons?.length).toBeGreaterThanOrEqual(2);
        
        // Click cancel button (usually the first visible button)
        (buttons?.[0] as HTMLElement)?.click();
        expect(onCancel).toHaveBeenCalled();
        
        // Click ok button (usually the last button)
        (buttons?.[buttons.length - 1] as HTMLElement)?.click();
        expect(onOk).toHaveBeenCalled();
    });

    it('should show loading state when onOk returns Promise', async () => {
        const onOk = vi.fn(() => new Promise(resolve => {
            setTimeout(() => resolve(true), 1000);
        }));
        
        Modal.confirm({
            title: 'Async Confirm',
            content: 'Content',
            onOk,
            motion: false,
        });
        
        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}-confirm`);
        const buttons = modal?.querySelectorAll(`.${BASE_CLASS_PREFIX}-button`);
        const okButton = buttons?.[buttons.length - 1] as HTMLElement;
        
        expect(okButton).toBeTruthy();
        expect(okButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`)).toBe(false);
        
        okButton?.click();
        
        // 等待多次 nextTick 和更长时间，确保 loading 状态更新
        await nextTick();
        await nextTick();
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        expect(onOk).toHaveBeenCalled();
        // 检查 loading 类名或 disabled 状态
        const hasLoading = okButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`) || 
                          okButton?.getAttribute('disabled') !== null ||
                          okButton?.querySelector(`.${BASE_CLASS_PREFIX}-button-loading-spinner`);
        expect(hasLoading).toBeTruthy();
        
        // Wait for promise to resolve
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        // 等待 loading 状态清除
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(okButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`)).toBe(false);
    });

    it('should show loading state when onCancel returns Promise', async () => {
        const onCancel = vi.fn(() => new Promise(resolve => {
            setTimeout(() => resolve(true), 1000);
        }));
        
        Modal.confirm({
            title: 'Async Cancel',
            content: 'Content',
            onCancel,
            motion: false,
        });
        
        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}-confirm`);
        const buttons = modal?.querySelectorAll(`.${BASE_CLASS_PREFIX}-button`);
        const cancelButton = buttons?.[0] as HTMLElement;
        
        expect(cancelButton).toBeTruthy();
        expect(cancelButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`)).toBe(false);
        
        cancelButton?.click();
        
        // 等待多次 nextTick 和更长时间，确保 loading 状态更新
        await nextTick();
        await nextTick();
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        expect(onCancel).toHaveBeenCalled();
        // 检查 loading 类名或 disabled 状态
        const hasLoading = cancelButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`) || 
                          cancelButton?.getAttribute('disabled') !== null ||
                          cancelButton?.querySelector(`.${BASE_CLASS_PREFIX}-button-loading-spinner`);
        expect(hasLoading).toBeTruthy();
        
        // Wait for promise to resolve
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        // 等待 loading 状态清除
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(cancelButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`)).toBe(false);
    });

    it('should update modal content', async () => {
        const instance = Modal.confirm({
            title: 'Original Title',
            content: 'Original Content',
            motion: false,
        });
        
        await waitForModal();

        let modal = document.querySelector(`.${prefixCls}-confirm`);
        const titleText = modal?.querySelector(`.${prefixCls}-confirm-title-text`);
        expect(titleText?.textContent).toBe('Original Title');
        expect(modal?.querySelector(`.${prefixCls}-confirm-content`)?.textContent).toBe('Original Content');
        
        // Update content
        instance.update({
            title: 'Updated Title',
            content: 'Updated Content',
        });
        
        // 等待更长时间让更新完成
        await nextTick();
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 200));

        modal = document.querySelector(`.${prefixCls}-confirm`);
        const updatedTitleText = modal?.querySelector(`.${prefixCls}-confirm-title-text`);
        expect(updatedTitleText?.textContent).toBe('Updated Title');
        expect(modal?.querySelector(`.${prefixCls}-confirm-content`)?.textContent).toBe('Updated Content');
    });

    it('should destroy modal', async () => {
        const instance = Modal.confirm({
            title: 'To Be Destroyed',
            content: 'Content',
            motion: false,
        });
        
        await waitForModal();

        expect(document.querySelector(`.${prefixCls}-confirm`)).toBeTruthy();
        
        instance.destroy();
        
        await waitForModal();

        expect(document.querySelector(`.${prefixCls}-confirm`)).toBeFalsy();
    });

    it('should destroy all modals', async () => {
        Modal.info({ title: 'Info 1', content: 'Content 1', motion: false });
        Modal.success({ title: 'Success 1', content: 'Content 2', motion: false });
        Modal.warning({ title: 'Warning 1', content: 'Content 3', motion: false });
        
        await waitForModal();

        const modals = document.querySelectorAll(`.${prefixCls}-confirm`);
        expect(modals.length).toBe(3);
        
        Modal.destroyAll();
        
        await waitForModal();

        expect(document.querySelectorAll(`.${prefixCls}-confirm`).length).toBe(0);
    });

    it('should hide cancel button for info/success/error/warning', async () => {
        Modal.info({ title: 'Info', content: 'Content', motion: false });
        await waitForModal();

        let modal = document.querySelector(`.${prefixCls}-confirm`);
        let buttons = modal?.querySelectorAll(`.${BASE_CLASS_PREFIX}-button`);
        
        // Should only have OK button (and close button if closable)
        expect(buttons?.length).toBeLessThanOrEqual(2);
        
        cleanupPortals();

        // Confirm should have both OK and Cancel
        Modal.confirm({ title: 'Confirm', content: 'Content', motion: false });
        await waitForModal();

        modal = document.querySelector(`.${prefixCls}-confirm`);
        buttons = modal?.querySelectorAll(`.${BASE_CLASS_PREFIX}-button`);
        
        // Should have both Cancel and OK buttons (and close button if closable)
        expect(buttons?.length).toBeGreaterThanOrEqual(2);
    });

    // Test the fixed mask and motion behavior
    it('should render with mask by default', async () => {
        Modal.info({ title: 'With Mask', content: 'Content', motion: false });
        
        await waitForModal();

        const mask = document.querySelector(`.${prefixCls}-mask`);
        expect(mask).toBeTruthy();
        expect(window.getComputedStyle(mask as HTMLElement).display).not.toBe('none');
    });

    it('should render without mask when mask is false', async () => {
        Modal.info({ title: 'Without Mask', content: 'Content', mask: false, motion: false });
        
        await waitForModal();

        const mask = document.querySelector(`.${prefixCls}-mask`);
        expect(mask).toBeFalsy();
    });

    it('should have correct motion behavior', async () => {
        Modal.info({ title: 'With Motion', content: 'Content', motion: true });
        
        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}`);
        expect(modal).toBeTruthy();
        
        // Should not have inline border style (which was causing the unexpected border issue)
        const modalElement = modal as HTMLElement;
        const borderWidth = window.getComputedStyle(modalElement).borderWidth;
        
        // The border should be controlled by CSS, not inline styles
        expect(modalElement.style.border).toBe('');
    });

    it('should apply custom width and height', async () => {
        Modal.info({
            title: 'Custom Size',
            content: 'Content',
            width: 600,
            height: 400,
            motion: false,
        });
        
        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}`) as HTMLElement;
        expect(modal?.style.width).toBe('600px');
        expect(modal?.style.height).toBe('400px');
    });

    it('should apply custom className and style', async () => {
        Modal.info({
            title: 'Custom Style',
            content: 'Content',
            className: 'custom-modal',
            style: { backgroundColor: 'red' },
            motion: false,
        });
        
        await waitForModal();

        // className 应该应用到 .semi-modal-confirm 元素上
        const confirmModal = document.querySelector(`.${prefixCls}-confirm`) as HTMLElement;
        expect(confirmModal?.classList.contains('custom-modal')).toBe(true);
        
        // style 应该应用到 .semi-modal 元素上
        const modal = document.querySelector(`.${prefixCls}`) as HTMLElement;
        expect(modal?.style.backgroundColor).toBe('red');
    });

    it('should handle onCancel when close button is clicked', async () => {
        const onCancel = vi.fn();
        
        Modal.info({
            title: 'Closable',
            content: 'Content',
            closable: true,
            onCancel,
            motion: false,
        });
        
        await waitForModal();

        const closeButton = document.querySelector(`.${prefixCls}-close`) as HTMLElement;
        expect(closeButton).toBeTruthy();
        
        closeButton?.click();
        
        await nextTick();
        
        expect(onCancel).toHaveBeenCalled();
    });
});


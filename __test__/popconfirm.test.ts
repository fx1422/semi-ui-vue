import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Popconfirm from '../src/components/popconfirm/Popconfirm.vue';
import Button from '../src/components/button/Button.vue';

describe('Popconfirm', () => {
    let wrapper: VueWrapper;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
        // Clear any remaining popconfirm elements
        document.querySelectorAll('.semi-popconfirm').forEach((el) => el.remove());
    });

    it('should render correctly', async () => {
        wrapper = mount({
            components: { Popconfirm, Button },
            template: `
                <Popconfirm
                    title="确定是否要保存此修改？"
                    content="此修改将不可逆"
                    trigger="click"
                    :default-visible="false"
                >
                    <Button class="trigger">Save</Button>
                </Popconfirm>
            `,
        });

        await nextTick();

        // Initially, popconfirm should be hidden
        expect(document.querySelectorAll('.semi-popconfirm').length).toBe(0);

        // Click trigger to show popconfirm
        const trigger = wrapper.find('.trigger');
        await trigger.trigger('click');
        await nextTick();
        await sleep(100);

        // Popconfirm should now be visible
        expect(document.querySelectorAll('.semi-popconfirm').length).toBeGreaterThan(0);
    });

    it('should not show when disabled', async () => {
        wrapper = mount({
            components: { Popconfirm, Button },
            template: `
                <Popconfirm
                    title="确定是否要保存此修改？"
                    content="此修改将不可逆"
                    trigger="click"
                    :default-visible="true"
                    :disabled="true"
                >
                    <Button class="trigger">Save</Button>
                </Popconfirm>
            `,
        });

        await nextTick();

        // Popconfirm should not show when disabled
        expect(document.querySelectorAll('.semi-popconfirm').length).toBe(0);
    });

    it('should work in controlled mode', async () => {
        const onVisibleChange = vi.fn();

        wrapper = mount({
            components: { Popconfirm, Button },
            data() {
                return {
                    visible: true,
                };
            },
            methods: {
                onVisibleChange,
            },
            template: `
                <Popconfirm
                    title="确定是否要保存此修改？"
                    content="此修改将不可逆"
                    :visible="visible"
                    trigger="custom"
                    @visibleChange="onVisibleChange"
                >
                    <Button class="trigger" @click="visible = !visible">Save</Button>
                </Popconfirm>
            `,
        });

        await nextTick();
        await sleep(100);

        // Popconfirm should be visible initially
        expect(document.querySelectorAll('.semi-popconfirm').length).toBeGreaterThan(0);

        // Click button to hide popconfirm
        const trigger = wrapper.find('.trigger');
        await trigger.trigger('click');
        await nextTick();

        expect(onVisibleChange).toHaveBeenCalled();
    });

    it('should call onConfirm and onCancel', async () => {
        const onConfirm = vi.fn();
        const onCancel = vi.fn();

        wrapper = mount({
            components: { Popconfirm, Button },
            methods: {
                onConfirm,
                onCancel,
            },
            template: `
                <Popconfirm
                    title="确定是否要保存此修改？"
                    content="此修改将不可逆"
                    trigger="click"
                    :default-visible="true"
                    @confirm="onConfirm"
                    @cancel="onCancel"
                >
                    <Button class="trigger">Save</Button>
                </Popconfirm>
            `,
        });

        await nextTick();
        await sleep(100);

        // Find and click cancel button
        const cancelBtn = document.querySelector('[data-type="cancel"]') as HTMLElement;
        expect(cancelBtn).toBeTruthy();
        cancelBtn.click();
        await nextTick();

        expect(onCancel).toHaveBeenCalled();

        // Show again and test confirm
        const trigger = wrapper.find('.trigger');
        await trigger.trigger('click');
        await nextTick();
        await sleep(100);

        const confirmBtn = document.querySelector('[data-type="ok"]') as HTMLElement;
        expect(confirmBtn).toBeTruthy();
        confirmBtn.click();
        await nextTick();

        expect(onConfirm).toHaveBeenCalled();
    });

    it('should support custom text', async () => {
        wrapper = mount({
            components: { Popconfirm, Button },
            template: `
                <Popconfirm
                    title="确定是否要保存此修改？"
                    ok-text="OK"
                    cancel-text="Cancel"
                    trigger="click"
                    :default-visible="true"
                >
                    <Button class="trigger">Save</Button>
                </Popconfirm>
            `,
        });

        await nextTick();
        await sleep(100);

        const cancelBtn = document.querySelector('[data-type="cancel"]') as HTMLElement;
        const confirmBtn = document.querySelector('[data-type="ok"]') as HTMLElement;

        expect(cancelBtn?.textContent).toContain('Cancel');
        expect(confirmBtn?.textContent).toContain('OK');
    });

    it('should support async confirm and cancel', async () => {
        const asyncConfirm = vi.fn(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(true), 100);
            });
        });

        const asyncCancel = vi.fn(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(true), 100);
            });
        });

        wrapper = mount({
            components: { Popconfirm, Button },
            methods: {
                asyncConfirm,
                asyncCancel,
            },
            template: `
                <Popconfirm
                    title="确定是否要保存此修改？"
                    trigger="click"
                    :default-visible="true"
                    @confirm="asyncConfirm"
                    @cancel="asyncCancel"
                >
                    <Button class="trigger">Save</Button>
                </Popconfirm>
            `,
        });

        await nextTick();
        await sleep(100);

        // Click confirm button
        const confirmBtn = document.querySelector('[data-type="ok"]') as HTMLElement;
        confirmBtn.click();
        await nextTick();

        expect(asyncConfirm).toHaveBeenCalled();

        // Button should show loading
        const confirmBtnAfterClick = document.querySelector('[data-type="ok"]') as HTMLElement;
        expect(confirmBtnAfterClick.classList.contains('semi-button-loading')).toBeTruthy();

        // Wait for promise to resolve
        await sleep(150);
    });

    it('should support different positions', async () => {
        const positions = ['top', 'topLeft', 'topRight', 'left', 'right', 'bottom', 'bottomLeft', 'bottomRight'];

        for (const position of positions) {
            wrapper = mount({
                components: { Popconfirm, Button },
                template: `
                    <Popconfirm
                        title="确定是否要删除？"
                        :position="'${position}'"
                        trigger="click"
                        :default-visible="true"
                    >
                        <Button>Delete</Button>
                    </Popconfirm>
                `,
            });

            await nextTick();
            await sleep(100);

            // Check if popconfirm is visible
            const popconfirm = document.querySelector('.semi-popconfirm');
            expect(popconfirm).toBeTruthy();

            wrapper.unmount();
            document.querySelectorAll('.semi-popconfirm').forEach((el) => el.remove());
            await sleep(50);
        }
    });

    it('should support custom icon', async () => {
        wrapper = mount({
            components: { Popconfirm, Button },
            template: `
                <Popconfirm
                    title="确定是否要删除？"
                    trigger="click"
                    :default-visible="true"
                    :icon="null"
                >
                    <Button>Delete</Button>
                </Popconfirm>
            `,
        });

        await nextTick();
        await sleep(100);

        // No icon should be present
        const icon = document.querySelector('.semi-popconfirm-header-icon');
        expect(icon).toBeFalsy();
    });

    it('should support showCloseIcon', async () => {
        wrapper = mount({
            components: { Popconfirm, Button },
            template: `
                <Popconfirm
                    title="确定是否要删除？"
                    trigger="click"
                    :default-visible="true"
                    :show-close-icon="true"
                >
                    <Button>Delete</Button>
                </Popconfirm>
            `,
        });

        await nextTick();
        await sleep(100);

        // Close icon should be present
        const closeBtn = document.querySelector('.semi-popconfirm-btn-close');
        expect(closeBtn).toBeTruthy();
    });

    it('should hide close icon when showCloseIcon is false', async () => {
        wrapper = mount({
            components: { Popconfirm, Button },
            template: `
                <Popconfirm
                    title="确定是否要删除？"
                    trigger="click"
                    :default-visible="true"
                    :show-close-icon="false"
                >
                    <Button>Delete</Button>
                </Popconfirm>
            `,
        });

        await nextTick();
        await sleep(100);

        // Close icon should not be present
        const closeBtn = document.querySelector('.semi-popconfirm-btn-close');
        expect(closeBtn).toBeFalsy();
    });
});


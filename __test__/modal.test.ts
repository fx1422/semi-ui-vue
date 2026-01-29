import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import Modal from '../src/components/modal';
import Button from '../src/components/button/Button.vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

const prefixCls = `${BASE_CLASS_PREFIX}-modal`;

describe('Modal', () => {
    beforeEach(() => {
        const div = document.createElement('div');
        div.setAttribute('id', 'container');
        document.body.appendChild(div);
    });

    afterEach(() => {
        const div = document.getElementById('container');
        if (div) {
            document.body.removeChild(div);
        }
        document.body.innerHTML = '';
    });

    it('should render modal when visible', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                title: 'Test Modal',
            },
            slots: {
                default: () => 'Modal Content',
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        expect(document.querySelector(`.${prefixCls}`)).toBeTruthy();
        expect(document.querySelector(`.${prefixCls}-title`)?.textContent).toBe('Test Modal');
        expect(document.querySelector(`.${prefixCls}-body`)?.textContent).toBe('Modal Content');

        wrapper.unmount();
    });

    it('should apply className and style', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                className: 'test-modal',
                style: { color: 'red' },
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const modal = document.querySelector(`.${prefixCls}`);
        expect(modal?.classList.contains('test-modal')).toBe(true);
        expect((modal as HTMLElement)?.style.color).toBe('red');

        wrapper.unmount();
    });

    it('should apply bodyStyle and maskStyle', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                bodyStyle: { color: 'pink' },
                maskStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const body = document.querySelector(`.${prefixCls}-body`) as HTMLElement;
        const mask = document.querySelector(`.${prefixCls}-mask`) as HTMLElement;

        expect(body?.style.color).toBe('pink');
        expect(mask?.style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');

        wrapper.unmount();
    });

    it('should handle zIndex prop', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                zIndex: 2000,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const portal = document.querySelector(`.${BASE_CLASS_PREFIX}-portal`) as HTMLElement;
        expect(portal?.style.zIndex).toBe('2000');

        wrapper.unmount();
    });

    it('should call onOk when ok button is clicked', async () => {
        const onOk = vi.fn();
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                onOk,
            },
            attachTo: document.getElementById('container'),
        });

        // 等待 Portal 组件完全初始化
        await new Promise(resolve => setTimeout(resolve, 50));

        const okButton = document.querySelector('[aria-label="confirm"]') as HTMLElement;
        expect(okButton).toBeTruthy(); // 先检查按钮是否存在
        okButton?.click();

        expect(onOk).toHaveBeenCalled();

        wrapper.unmount();
    });

    it('should call onCancel when cancel button is clicked', async () => {
        const onCancel = vi.fn();
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                onCancel,
            },
            attachTo: document.getElementById('container'),
        });

        // 等待 Portal 组件完全初始化
        await new Promise(resolve => setTimeout(resolve, 50));

        const cancelButton = document.querySelector('[aria-label="cancel"]') as HTMLElement;
        expect(cancelButton).toBeTruthy();
        cancelButton?.click();

        expect(onCancel).toHaveBeenCalled();

        wrapper.unmount();
    });

    it('should call onCancel when close button is clicked', async () => {
        const onCancel = vi.fn();
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                closable: true,
                onCancel,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const closeButton = document.querySelector(`.${prefixCls}-close`) as HTMLElement;
        closeButton?.click();

        expect(onCancel).toHaveBeenCalled();

        wrapper.unmount();
    });

    it('should hide cancel button when hasCancel is false', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                hasCancel: false,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const cancelButton = document.querySelector('[aria-label="cancel"]');
        expect(cancelButton).toBeFalsy();

        wrapper.unmount();
    });

    it('should render custom footer', async () => {
        const customFooter = h('div', { class: 'custom-footer' }, 'Custom Footer');

        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                footer: customFooter,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const footer = document.querySelector('.custom-footer');
        expect(footer?.textContent).toBe('Custom Footer');

        wrapper.unmount();
    });

    it('should render custom header', async () => {
        const customHeader = h('div', { class: 'custom-header' }, 'Custom Header');

        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                header: customHeader,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const header = document.querySelector('.custom-header');
        expect(header?.textContent).toBe('Custom Header');

        wrapper.unmount();
    });

    it('should handle different sizes', async () => {
        const sizes = ['small', 'medium', 'large', 'full-width'] as const;

        for (const size of sizes) {
            const wrapper = mount(Modal, {
                props: {
                    visible: true,
                    motion: false,
                    size,
                },
                attachTo: document.getElementById('container'),
            });

            await nextTick();
            await nextTick();

            const modal = document.querySelector(`.${prefixCls}`);
            expect(modal?.classList.contains(`${prefixCls}-${size}`)).toBe(true);

            wrapper.unmount();
        }
    });

    it('should apply centered class when centered is true', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                centered: true,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const wrap = document.querySelector(`.${prefixCls}-wrap`);
        expect(wrap?.classList.contains(`${prefixCls}-wrap-center`)).toBe(true);

        wrapper.unmount();
    });

    it('should handle fullScreen prop', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                fullScreen: true,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const modal = document.querySelector(`.${prefixCls}`);
        expect(modal?.classList.contains(`${prefixCls}-fullscreen`)).toBe(true);

        wrapper.unmount();
    });

    it('should render with custom okText and cancelText', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                okText: 'Confirm',
                cancelText: 'Abort',
            },
            attachTo: document.getElementById('container'),
        });

        // 等待 Portal 组件完全初始化
        await new Promise(resolve => setTimeout(resolve, 50));

        const okButton = document.querySelector('[aria-label="confirm"]');
        const cancelButton = document.querySelector('[aria-label="cancel"]');

        expect(okButton).toBeTruthy();
        expect(cancelButton).toBeTruthy();
        expect(okButton?.textContent).toContain('Confirm');
        expect(cancelButton?.textContent).toContain('Abort');

        wrapper.unmount();
    });

    it('should disable body scroll when visible', async () => {
        const originalOverflow = document.body.style.overflow;

        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        expect(document.body.style.overflow).toBe('hidden');

        wrapper.unmount();
        document.body.style.overflow = originalOverflow;
    });

    it('should render with icon', async () => {
        const iconVNode = h('span', { class: 'custom-icon' }, '⚠️');

        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                icon: iconVNode,
                title: 'Warning',
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const icon = document.querySelector('.custom-icon');
        expect(icon?.textContent).toBe('⚠️');

        wrapper.unmount();
    });

    it('should handle width and height props', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                width: 600,
                height: 400,
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        const modal = document.querySelector(`.${prefixCls}`) as HTMLElement;
        expect(modal?.style.width).toBe('600px');
        expect(modal?.style.height).toBe('400px');

        wrapper.unmount();
    });

    it('should render with visible prop', async () => {
        const wrapper = mount(Modal, {
            props: {
                visible: true,
                motion: false,
                title: 'Visible Prop Modal',
            },
            slots: {
                default: () => 'Modal Content',
            },
            attachTo: document.getElementById('container'),
        });

        await nextTick();
        await nextTick();

        console.log('Testing visible prop - DOM content:', document.body.innerHTML);

        const modal = document.querySelector(`.${prefixCls}`);
        expect(modal).toBeTruthy();
        expect(document.querySelector(`.${prefixCls}-title`)?.textContent).toBe('Visible Prop Modal');

        wrapper.unmount();
    });
});


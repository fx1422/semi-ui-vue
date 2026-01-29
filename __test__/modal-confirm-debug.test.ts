import { describe, it } from 'vitest';
import { nextTick, h } from 'vue';
import Modal from '../src/components/modal';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

const prefixCls = `${BASE_CLASS_PREFIX}-modal`;

async function waitForModal() {
    await nextTick();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
}

describe('Modal Debug - DOM Structure', () => {
    afterEach(() => {
        const portals = document.querySelectorAll(`.${BASE_CLASS_PREFIX}-portal`);
        portals.forEach((portal) => {
            if (portal.parentNode) {
                portal.parentNode.removeChild(portal);
            }
        });
        document.body.innerHTML = '';
    });

    it('debug custom icon DOM structure', async () => {
        const customIcon = h('span', { class: 'custom-test-icon' }, '🎯');

        Modal.confirm({
            title: 'Custom Icon',
            content: 'Content',
            icon: customIcon,
            motion: false,
        });

        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}-confirm`);
        console.log('=== Modal Element ===');
        console.log('Modal:', modal);
        console.log('Modal className:', modal?.className);

        console.log('\n=== All elements with custom-test-icon ===');
        const customIcons = document.querySelectorAll('.custom-test-icon');
        console.log('Count:', customIcons.length);
        customIcons.forEach((el, i) => {
            console.log(`${i}:`, el, 'textContent:', el.textContent);
        });

        console.log('\n=== Icon wrapper ===');
        const iconWrapper = document.querySelector(`.${prefixCls}-icon-wrapper`);
        console.log('Icon wrapper:', iconWrapper);
        console.log('Icon wrapper innerHTML:', iconWrapper?.innerHTML);

        console.log('\n=== All semi-modal-confirm-icon ===');
        const confirmIcons = document.querySelectorAll(`.${prefixCls}-confirm-icon`);
        confirmIcons.forEach((el, i) => {
            console.log(`${i}:`, el, 'className:', el.className);
        });
    });

    it('debug className DOM structure', async () => {
        Modal.info({
            title: 'Custom Style',
            content: 'Content',
            className: 'custom-modal',
            style: { backgroundColor: 'red' },
            motion: false,
        });

        await waitForModal();

        const modal = document.querySelector(`.${prefixCls}`) as HTMLElement;
        console.log('=== Modal Element ===');
        console.log('Modal:', modal);
        console.log('Modal className:', modal?.className);
        console.log('Modal classList:', Array.from(modal?.classList || []));
        console.log('Modal style.backgroundColor:', modal?.style.backgroundColor);

        const confirmModal = document.querySelector(`.${prefixCls}-confirm`) as HTMLElement;
        console.log('\n=== Confirm Modal Element ===');
        console.log('Confirm Modal:', confirmModal);
        console.log('Confirm Modal className:', confirmModal?.className);
        console.log('Confirm Modal classList:', Array.from(confirmModal?.classList || []));
    });

    it('debug loading state', async () => {
        const onOk = vi.fn(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve(true), 1000);
                })
        );

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

        console.log('=== Before Click ===');
        console.log('OK Button:', okButton);
        console.log('OK Button className:', okButton?.className);
        console.log('Has loading class:', okButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`));

        okButton?.click();

        await nextTick();
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log('\n=== After Click ===');
        console.log('OK Button className:', okButton?.className);
        console.log('Has loading class:', okButton?.classList.contains(`${BASE_CLASS_PREFIX}-button-loading`));
        console.log('onOk called:', onOk.mock.calls.length);
    });

    it('debug update method', async () => {
        const instance = Modal.confirm({
            title: 'Original Title',
            content: 'Original Content',
            motion: false,
        });

        await waitForModal();

        let modal = document.querySelector(`.${prefixCls}-confirm`);
        console.log('=== Before Update ===');
        console.log('Title element:', modal?.querySelector(`.${prefixCls}-title`));
        console.log('Title text:', modal?.querySelector(`.${prefixCls}-title`)?.textContent);
        console.log('Title-text element:', modal?.querySelector(`.${prefixCls}-confirm-title-text`));
        console.log('Title-text text:', modal?.querySelector(`.${prefixCls}-confirm-title-text`)?.textContent);

        instance.update({
            title: 'Updated Title',
            content: 'Updated Content',
        });

        await waitForModal();

        modal = document.querySelector(`.${prefixCls}-confirm`);
        console.log('\n=== After Update ===');
        console.log('Title element:', modal?.querySelector(`.${prefixCls}-title`));
        console.log('Title text:', modal?.querySelector(`.${prefixCls}-title`)?.textContent);
        console.log('Title-text element:', modal?.querySelector(`.${prefixCls}-confirm-title-text`));
        console.log('Title-text text:', modal?.querySelector(`.${prefixCls}-confirm-title-text`)?.textContent);
    });
});

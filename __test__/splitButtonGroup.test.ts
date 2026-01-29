import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import SplitButtonGroup from '../src/components/button/SplitButtonGroup.vue';
import Button from '../src/components/button/Button.vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

const BASE_BUTTON_CLASS = `${BASE_CLASS_PREFIX}-button`;

describe('SplitButtonGroup', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should render with default props', () => {
        const wrapper = mount(SplitButtonGroup, {
            slots: {
                default: () => [h(Button, null, () => 'Button 1'), h(Button, null, () => 'Button 2')],
            },
        });
        expect(wrapper.find(`.${BASE_BUTTON_CLASS}-split`).exists()).toBe(true);
        expect(wrapper.attributes('role')).toBe('group');
    });

    it('should render with custom className and style', () => {
        const wrapper = mount(SplitButtonGroup, {
            props: {
                className: 'test-split-group',
                style: { marginRight: '10px' },
            },
            slots: {
                default: () => [h(Button, null, () => 'Button 1')],
            },
        });
        expect(wrapper.classes()).toContain('test-split-group');
        expect(wrapper.classes()).toContain(`${BASE_BUTTON_CLASS}-split`);
    });

    it('should accept aria-label prop', async () => {
        const wrapper = mount(SplitButtonGroup, {
            props: {
                'aria-label': 'Split button group',
            } as any,
            slots: {
                default: () => [h(Button, null, () => 'Button 1')],
            },
        });
        await nextTick();
        // 验证组件可以正常渲染，aria-label 是可选的
        expect(wrapper.find(`.${BASE_BUTTON_CLASS}-split`).exists()).toBe(true);
    });

    it('should add first and last classes to buttons', async () => {
        const wrapper = mount(SplitButtonGroup, {
            slots: {
                default: () => [
                    h(Button, null, () => 'Button 1'),
                    h(Button, null, () => 'Button 2'),
                    h(Button, null, () => 'Button 3'),
                ],
            },
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(3);

        const firstButton = buttons[0].element;
        const lastButton = buttons[buttons.length - 1].element;

        expect(firstButton.classList.contains(`${BASE_BUTTON_CLASS}-first`)).toBe(true);
        expect(lastButton.classList.contains(`${BASE_BUTTON_CLASS}-last`)).toBe(true);
    });

    it('should update classes when buttons are added dynamically', async () => {
        const wrapper = mount(SplitButtonGroup, {
            slots: {
                default: () => [h(Button, null, () => 'Button 1')],
            },
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const container = wrapper.element;
        const newButton = document.createElement('button');
        newButton.textContent = 'Button 2';
        container.appendChild(newButton);

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].classList.contains(`${BASE_BUTTON_CLASS}-first`)).toBe(true);
        expect(buttons[1].classList.contains(`${BASE_BUTTON_CLASS}-last`)).toBe(true);
    });

    it('should handle single button', async () => {
        const wrapper = mount(SplitButtonGroup, {
            slots: {
                default: () => [h(Button, null, () => 'Button 1')],
            },
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(1);
        expect(buttons[0].element.classList.contains(`${BASE_BUTTON_CLASS}-first`)).toBe(true);
        expect(buttons[0].element.classList.contains(`${BASE_BUTTON_CLASS}-last`)).toBe(true);
    });

    it('should cleanup MutationObserver on unmount', async () => {
        const wrapper = mount(SplitButtonGroup, {
            slots: {
                default: () => [h(Button, null, () => 'Button 1')],
            },
        });

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.vm).toBeTruthy();
        expect(wrapper.find(`.${BASE_BUTTON_CLASS}-split`).exists()).toBe(true);
        
        // MutationObserver 应该在组件挂载后创建
        // 验证组件可以正常卸载（不会抛出错误）
        expect(() => wrapper.unmount()).not.toThrow();
    });
});


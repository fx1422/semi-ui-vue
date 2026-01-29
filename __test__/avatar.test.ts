import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Avatar from '../src/components/avatar/Avatar.vue';
import AvatarGroup from '../src/components/avatar/AvatarGroup.vue';
import { cssClasses } from '@douyinfe/semi-foundation/avatar/constants';
import { h } from 'vue';

const PREFIX = cssClasses.PREFIX;

// 对照 packages/semi-ui/avatar/__test__/avatar.test.js
describe('Avatar', () => {
    // 对应 React 测试: "size"
    it('should render different sizes', () => {
        const sizes = ['extra-extra-small', 'extra-small', 'small', 'default', 'medium', 'large', 'extra-large'];

        sizes.forEach((size) => {
            const wrapper = mount(Avatar, {
                props: { size },
                slots: { default: 'U' },
            });

            if (size !== 'medium') {
                expect(wrapper.classes()).toContain(`${PREFIX}-${size}`);
            } else {
                // medium 是默认值
                expect(wrapper.classes()).toContain(PREFIX);
            }
        });
    });

    // 对应 React 测试: custom size
    it('should support custom sizes', () => {
        const wrapper1 = mount(Avatar, {
            props: { size: 40 },
            slots: { default: 'U' },
        });
        expect(wrapper1.attributes('style')).toContain('width: 40px');
        expect(wrapper1.attributes('style')).toContain('height: 40px');

        const wrapper2 = mount(Avatar, {
            props: { size: '60px' },
            slots: { default: 'U' },
        });
        expect(wrapper2.attributes('style')).toContain('width: 60px');
        expect(wrapper2.attributes('style')).toContain('height: 60px');
    });

    // 对应 React 测试: "color"
    it('should render different colors', () => {
        const colors = [
            'amber',
            'blue',
            'cyan',
            'green',
            'grey',
            'indigo',
            'light-blue',
            'light-green',
            'lime',
            'orange',
            'pink',
            'purple',
            'red',
            'teal',
            'violet',
            'yellow',
        ];

        colors.forEach((color) => {
            const wrapper = mount(Avatar, {
                props: { color: color as any },
                slots: { default: 'U' },
            });
            expect(wrapper.classes()).toContain(`${PREFIX}-${color}`);
        });
    });

    // 对应 React 测试: "src"
    it('should render image avatar', () => {
        const src = 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png';
        const wrapper = mount(Avatar, {
            props: { src },
        });

        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe(src);
    });

    // 对应 React 测试: "shape"
    it('should render different shapes', () => {
        const circleWrapper = mount(Avatar, {
            props: { shape: 'circle' },
            slots: { default: 'U' },
        });
        expect(circleWrapper.classes()).toContain(`${PREFIX}-circle`);

        const squareWrapper = mount(Avatar, {
            props: { shape: 'square' },
            slots: { default: 'U' },
        });
        expect(squareWrapper.classes()).toContain(`${PREFIX}-square`);
    });

    // 对应 React 测试: "className & style"
    it('should render with custom className and style', () => {
        const wrapper = mount(Avatar, {
            props: {
                className: 'test-avatar',
                style: { color: 'red' },
            },
            slots: { default: 'A' },
        });

        expect(wrapper.classes()).toContain('test-avatar');
        expect(wrapper.attributes('style')).toContain('color: red');
    });

    // 对应 React 测试: "gap & scale"
    it('should apply gap and scale for text content', async () => {
        const wrapper = mount(Avatar, {
            props: { gap: 10 },
            slots: { default: 'Semi' },
        });

        await wrapper.vm.$nextTick();

        const contentSpan = wrapper.find(`.${PREFIX}-content`);
        if (contentSpan.exists()) {
            const style = contentSpan.attributes('style');
            expect(style).toMatch(/transform.*scale/);
        }
    });

    // 对应 React 测试: "onError"
    it('should trigger error event when image fails to load', async () => {
        const onError = vi.fn();
        const wrapper = mount(Avatar, {
            props: {
                src: 'https://invalid-url.com/image.png',
                onError,
            },
        });

        const img = wrapper.find('img');
        await img.trigger('error');

        // Note: 在 Vue 中事件是通过 emits 触发的
        expect(wrapper.emitted()).toHaveProperty('error');
    });

    // 对应 React 测试: "onClick"
    it('should handle click event', async () => {
        const onClick = vi.fn();
        const wrapper = mount(Avatar, {
            props: { onClick },
            slots: { default: 'U' },
        });

        await wrapper.trigger('click');
        expect(wrapper.emitted()).toHaveProperty('click');
    });

    // 对应 React 测试: "onClick, topSlot"
    it('should handle click with topSlot', async () => {
        const onClick = vi.fn();
        const wrapper = mount(Avatar, {
            props: {
                onClick,
                topSlot: { text: '直播' },
            },
            slots: { default: 'U' },
        });

        await wrapper.find(`.${PREFIX}-wrapper`).trigger('click');
        expect(wrapper.emitted()).toHaveProperty('click');
    });

    // 对应 React 测试: "onMouseEnter"
    it('should handle mouse enter event', async () => {
        const onMouseEnter = vi.fn();
        const wrapper = mount(Avatar, {
            props: { onMouseEnter },
            slots: { default: 'U' },
        });

        await wrapper.trigger('mouseenter');
        expect(wrapper.emitted()).toHaveProperty('mouseenter');
    });

    // 对应 React 测试: "onMouseEnter, topSlot"
    it('should handle mouse enter with topSlot', async () => {
        const onMouseEnter = vi.fn();
        const wrapper = mount(Avatar, {
            props: {
                onMouseEnter,
                topSlot: { text: '直播' },
            },
            slots: { default: 'U' },
        });

        await wrapper.find(`.${PREFIX}-wrapper`).trigger('mouseenter');
        expect(wrapper.emitted()).toHaveProperty('mouseenter');
    });

    // 对应 React 测试: "onMouseLeave"
    it('should handle mouse leave event', async () => {
        const onMouseLeave = vi.fn();
        const wrapper = mount(Avatar, {
            props: { onMouseLeave },
            slots: { default: 'U' },
        });

        await wrapper.trigger('mouseleave');
        expect(wrapper.emitted()).toHaveProperty('mouseleave');
    });

    // 对应 React 测试: "onMouseLeave, topSlot"
    it('should handle mouse leave with topSlot', async () => {
        const onMouseLeave = vi.fn();
        const wrapper = mount(Avatar, {
            props: {
                onMouseLeave,
                topSlot: { text: '直播' },
            },
            slots: { default: 'U' },
        });

        await wrapper.find(`.${PREFIX}-wrapper`).trigger('mouseleave');
        expect(wrapper.emitted()).toHaveProperty('mouseleave');
    });

    // 对应 React 测试: "hoverMask"
    it('should show hover mask', async () => {
        const wrapper = mount(Avatar, {
            props: { hoverMask: 'Edit' },
            slots: { default: 'U' },
        });

        await wrapper.trigger('mouseenter');
        await wrapper.vm.$nextTick();

        const hoverElement = wrapper.find(`.${PREFIX}-hover`);
        expect(hoverElement.exists()).toBe(true);
    });

    it('should render border decoration', () => {
        const wrapper1 = mount(Avatar, {
            props: { border: true },
            slots: { default: 'U' },
        });
        expect(wrapper1.find(`.${PREFIX}-additionalBorder`).exists()).toBe(true);

        const wrapper2 = mount(Avatar, {
            props: { border: { color: '#f00', motion: true } },
            slots: { default: 'U' },
        });
        expect(wrapper2.findAll(`.${PREFIX}-additionalBorder`).length).toBeGreaterThan(0);
        expect(wrapper2.find(`.${PREFIX}-additionalBorder-animated`).exists()).toBe(true);
    });

    it('should render bottomSlot', () => {
        const wrapper = mount(Avatar, {
            props: {
                bottomSlot: {
                    text: '🔥',
                    bgColor: 'red',
                    textColor: 'white',
                },
            },
            slots: { default: 'U' },
        });

        expect(wrapper.find(`.${PREFIX}-bottom_slot`).exists()).toBe(true);
    });

    it('should render topSlot', () => {
        const wrapper = mount(Avatar, {
            props: {
                topSlot: {
                    text: '直播',
                    textColor: 'white',
                },
            },
            slots: { default: 'U' },
        });

        expect(wrapper.find(`.${PREFIX}-top_slot`).exists()).toBe(true);
    });
});

describe('AvatarGroup', () => {
    it('should render avatar group', () => {
        const wrapper = mount(AvatarGroup, {
            slots: {
                default: () => [h(Avatar, {}, () => 'U'), h(Avatar, {}, () => 'A'), h(Avatar, {}, () => 'B')],
            },
        });

        expect(wrapper.classes()).toContain(`${PREFIX}-group`);
        expect(wrapper.findAllComponents(Avatar).length).toBe(3);
    });

    it('should limit display count with maxCount', () => {
        const wrapper = mount(AvatarGroup, {
            props: { maxCount: 2 },
            slots: {
                default: () => [
                    h(Avatar, {}, () => 'U'),
                    h(Avatar, {}, () => 'A'),
                    h(Avatar, {}, () => 'B'),
                    h(Avatar, {}, () => 'C'),
                ],
            },
        });

        // Should render 2 avatars + 1 more indicator
        const avatars = wrapper.findAll('[role="listitem"]');
        expect(avatars.length).toBe(3);

        // Check for +N indicator
        expect(wrapper.html()).toContain('+2');
    });

    it('should apply overlapFrom', () => {
        const wrapper1 = mount(AvatarGroup, {
            props: { overlapFrom: 'start' },
            slots: {
                default: () => [h(Avatar, {}, () => 'U'), h(Avatar, {}, () => 'A')],
            },
        });
        expect(wrapper1.html()).toContain(`${PREFIX}-item-start-0`);

        const wrapper2 = mount(AvatarGroup, {
            props: { overlapFrom: 'end' },
            slots: {
                default: () => [h(Avatar, {}, () => 'U'), h(Avatar, {}, () => 'A')],
            },
        });
        expect(wrapper2.html()).toContain(`${PREFIX}-item-end-0`);
    });

    it('should pass size and shape to children', () => {
        const wrapper = mount(AvatarGroup, {
            props: {
                size: 'large',
                shape: 'square',
            },
            slots: {
                default: () => [h(Avatar, {}, () => 'U'), h(Avatar, {}, () => 'A')],
            },
        });

        expect(wrapper.html()).toContain(`${PREFIX}-large`);
        expect(wrapper.html()).toContain(`${PREFIX}-square`);
    });
});

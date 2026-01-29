import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';
import Skeleton from '../src/components/skeleton';

const { Avatar, Image, Title, Button, Paragraph } = Skeleton;

describe('Skeleton', () => {
    it('basic loading', async () => {
        const wrapper = mount(Skeleton, {
            props: {
                loading: true,
            },
            slots: {
                placeholder: '<div class="placeholder-content">placeholder</div>',
                default: '<div class="content">content</div>',
            },
        });

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-skeleton`).exists()).toBe(true);
        expect(wrapper.find('.placeholder-content').exists()).toBe(true);
        expect(wrapper.find('.content').exists()).toBe(false);

        await wrapper.setProps({ loading: false });
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-skeleton`).exists()).toBe(false);
        expect(wrapper.find('.placeholder-content').exists()).toBe(false);
        expect(wrapper.find('.content').exists()).toBe(true);
    });

    it('kits render', () => {
        const avatarWrapper = mount(Avatar);
        const imageWrapper = mount(Image);
        const titleWrapper = mount(Title);
        const buttonWrapper = mount(Button);
        const paragraphWrapper = mount(Paragraph);

        expect(avatarWrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-avatar`).exists()).toBe(true);
        expect(imageWrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-image`).exists()).toBe(true);
        expect(titleWrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-title`).exists()).toBe(true);
        expect(buttonWrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-button`).exists()).toBe(true);
        expect(paragraphWrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-paragraph`).exists()).toBe(true);
    });

    it('active animation', () => {
        const wrapper = mount(Skeleton, {
            props: {
                active: true,
                loading: true,
            },
            slots: {
                placeholder: () => Avatar,
            },
        });

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-active`).exists()).toBe(true);
    });

    it('avatar with different sizes', () => {
        const sizes = ['extra-extra-small', 'extra-small', 'small', 'default', 'medium', 'large', 'extra-large'] as const;

        sizes.forEach(size => {
            const wrapper = mount(Avatar, {
                props: { size },
            });

            expect(wrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-avatar-${size}`).exists()).toBe(true);
        });
    });

    it('avatar with different shapes', () => {
        const shapes = ['circle', 'square'] as const;

        shapes.forEach(shape => {
            const wrapper = mount(Avatar, {
                props: { shape },
            });

            expect(wrapper.find(`.${BASE_CLASS_PREFIX}-skeleton-avatar-${shape}`).exists()).toBe(true);
        });
    });

    it('paragraph with custom rows', () => {
        const wrapper = mount(Paragraph, {
            props: { rows: 5 },
        });

        const listItems = wrapper.findAll('li');
        expect(listItems).toHaveLength(5);
    });

    it('should apply custom className and style', () => {
        const wrapper = mount(Skeleton, {
            props: {
                className: 'custom-class',
                style: { marginTop: '20px' },
                loading: true,
            },
            slots: {
                placeholder: () => Avatar,
            },
        });

        const skeleton = wrapper.find(`.${BASE_CLASS_PREFIX}-skeleton`);
        expect(skeleton.classes()).toContain('custom-class');
        expect(skeleton.attributes('style')).toContain('margin-top: 20px');
    });
});


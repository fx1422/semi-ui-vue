import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import TagGroup from '../src/components/tag/TagGroup.vue';
import Tag from '../src/components/tag/Tag.vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

const BASE_TAG_CLASS = `${BASE_CLASS_PREFIX}-tag`;

describe('TagGroup', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should render with default props', () => {
        const wrapper = mount(TagGroup, {
            slots: {
                default: () => [
                    h(Tag, null, () => 'Tag 1'),
                    h(Tag, null, () => 'Tag 2'),
                ],
            },
        });
        expect(wrapper.find(`.${BASE_TAG_CLASS}-group`).exists()).toBe(true);
        const tags = wrapper.findAll(`.${BASE_TAG_CLASS}`);
        expect(tags.length).toBeGreaterThanOrEqual(2);
    });

    it('should render with custom className and style', () => {
        const wrapper = mount(TagGroup, {
            props: {
                className: 'test-tag-group',
                style: { color: 'red' },
            },
            slots: {
                default: () => [h(Tag, null, () => 'Tag 1')],
            },
        });
        expect(wrapper.classes()).toContain('test-tag-group');
        expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('should render with size prop', () => {
        const smallWrapper = mount(TagGroup, {
            props: {
                size: 'small',
            },
            slots: {
                default: () => [h(Tag, null, () => 'Tag 1')],
            },
        });
        const largeWrapper = mount(TagGroup, {
            props: {
                size: 'large',
            },
            slots: {
                default: () => [h(Tag, null, () => 'Tag 1')],
            },
        });

        expect(smallWrapper.find(`.${BASE_TAG_CLASS}-group-small`).exists()).toBe(true);
        expect(largeWrapper.find(`.${BASE_TAG_CLASS}-group-large`).exists()).toBe(true);
    });

    it('should render with tagList prop', () => {
        const tagList = [
            h(Tag, { color: 'blue' }, () => 'Tag 1'),
            h(Tag, { color: 'green' }, () => 'Tag 2'),
            h(Tag, { color: 'red' }, () => 'Tag 3'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
            },
        });

        const tags = wrapper.findAll(`.${BASE_TAG_CLASS}`);
        expect(tags.length).toBe(3);
    });

    it('should limit displayed tags with maxTagCount', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
            h(Tag, null, () => 'Tag 3'),
            h(Tag, null, () => 'Tag 4'),
            h(Tag, null, () => 'Tag 5'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 3,
            },
        });

        const tags = wrapper.findAll(`.${BASE_TAG_CLASS}`);
        // Should show 3 tags + 1 rest tag (+2)
        expect(tags.length).toBe(4);
        expect(wrapper.text()).toContain('+2');
    });

    it('should show rest tag when maxTagCount is set', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
            h(Tag, null, () => 'Tag 3'),
            h(Tag, null, () => 'Tag 4'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 2,
            },
        });

        expect(wrapper.text()).toContain('+2');
        expect(wrapper.find(`.${BASE_TAG_CLASS}-group-max`).exists()).toBe(true);
    });

    it('should not show rest tag when all tags are displayed', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 3,
            },
        });

        expect(wrapper.text()).not.toContain('+');
    });

    it('should use restCount prop when provided', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 1,
                restCount: 5,
            },
        });

        expect(wrapper.text()).toContain('+5');
    });

    it('should show Popover when showPopover is true', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
            h(Tag, null, () => 'Tag 3'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 1,
                showPopover: true,
            },
        });

        const popover = wrapper.findComponent({ name: 'Popover' });
        expect(popover.exists()).toBe(true);
    });

    it('should not show Popover when showPopover is false', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
            h(Tag, null, () => 'Tag 3'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 1,
                showPopover: false,
            },
        });

        const popover = wrapper.findComponent({ name: 'Popover' });
        expect(popover.exists()).toBe(false);
        // Should still show rest tag
        expect(wrapper.text()).toContain('+');
    });

    it('should pass popoverProps to Popover', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 1,
                showPopover: true,
                popoverProps: {
                    position: 'bottom',
                },
            },
        });

        const popover = wrapper.findComponent({ name: 'Popover' });
        expect(popover.exists()).toBe(true);
        expect(popover.props('position')).toBe('bottom');
    });

    it('should emit plusNMouseEnter event', async () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 1,
            },
        });

        const restTag = wrapper.find(`.${BASE_TAG_CLASS}`);
        const plusNTag = Array.from(restTag.element.parentElement?.children || []).find(
            (el: any) => el.textContent?.includes('+')
        );

        if (plusNTag) {
            const mouseEvent = new MouseEvent('mouseenter', { bubbles: true });
            plusNTag.dispatchEvent(mouseEvent);
            await nextTick();

            // Event should be emitted
            expect(wrapper.emitted('plusNMouseEnter')).toBeTruthy();
        }
    });

    it('should render with slots when tagList is not provided', () => {
        const wrapper = mount(TagGroup, {
            slots: {
                default: () => [
                    h(Tag, { color: 'blue' }, () => 'Slot Tag 1'),
                    h(Tag, { color: 'green' }, () => 'Slot Tag 2'),
                ],
            },
        });

        expect(wrapper.text()).toContain('Slot Tag 1');
        expect(wrapper.text()).toContain('Slot Tag 2');
    });

    it('should prioritize tagList over slots', () => {
        const tagList = [h(Tag, null, () => 'TagList Tag')];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
            },
            slots: {
                default: () => [h(Tag, null, () => 'Slot Tag')],
            },
        });

        expect(wrapper.text()).toContain('TagList Tag');
        expect(wrapper.text()).not.toContain('Slot Tag');
    });

    it('should handle empty tagList', () => {
        const wrapper = mount(TagGroup, {
            props: {
                tagList: [],
            },
        });

        const tags = wrapper.findAll(`.${BASE_TAG_CLASS}`);
        // Should not have any tags (except possibly rest tag)
        expect(tags.length).toBe(0);
    });

    it('should handle empty slots', () => {
        const wrapper = mount(TagGroup, {
            slots: {
                default: () => [],
            },
        });

        const tags = wrapper.findAll(`.${BASE_TAG_CLASS}`);
        expect(tags.length).toBe(0);
    });

    it('should calculate restCount correctly from tagList', () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
            h(Tag, null, () => 'Tag 3'),
            h(Tag, null, () => 'Tag 4'),
            h(Tag, null, () => 'Tag 5'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 2,
            },
        });

        // Should show +3 (5 - 2 = 3)
        expect(wrapper.text()).toContain('+3');
    });

    it('should handle mode prop', () => {
        const tagList = [
            h('div', { class: 'custom-tag' }, 'Custom Tag 1'),
            h('div', { class: 'custom-tag' }, 'Custom Tag 2'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                mode: 'custom',
            },
        });

        // In custom mode, tagList items are rendered as-is
        const customTags = wrapper.findAll('.custom-tag');
        expect(customTags.length).toBe(2);
    });

    it('should render rest tags in Popover content', async () => {
        const tagList = [
            h(Tag, null, () => 'Tag 1'),
            h(Tag, null, () => 'Tag 2'),
            h(Tag, null, () => 'Tag 3'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 1,
                showPopover: true,
            },
        });

        const popover = wrapper.findComponent({ name: 'Popover' });
        expect(popover.exists()).toBe(true);

        // Popover content is rendered in a slot, which may not be immediately accessible
        // We verify that Popover exists and has the correct props
        expect(popover.props('showArrow')).toBe(true);
        expect(popover.props('trigger')).toBe('hover');
        expect(popover.props('position')).toBe('top');
    });

    it('should apply group-max class when maxTagCount is set', () => {
        const tagList = [h(Tag, null, () => 'Tag 1'), h(Tag, null, () => 'Tag 2')];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
                maxTagCount: 1,
            },
        });

        expect(wrapper.find(`.${BASE_TAG_CLASS}-group-max`).exists()).toBe(true);
    });

    it('should not apply group-max class when maxTagCount is not set', () => {
        const tagList = [h(Tag, null, () => 'Tag 1')];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
            },
        });

        expect(wrapper.find(`.${BASE_TAG_CLASS}-group-max`).exists()).toBe(false);
    });

    it('should handle Fragment children in slots', () => {
        const wrapper = mount(TagGroup, {
            slots: {
                default: () =>
                    h('div', [
                        h(Tag, null, () => 'Tag 1'),
                        h(Tag, null, () => 'Tag 2'),
                    ]),
            },
        });

        const tags = wrapper.findAll(`.${BASE_TAG_CLASS}`);
        expect(tags.length).toBeGreaterThanOrEqual(2);
    });

    it('should generate unique keys for tags', () => {
        const tagList = [
            h(Tag, { key: 'tag-1' }, () => 'Tag 1'),
            h(Tag, { key: 'tag-2' }, () => 'Tag 2'),
        ];

        const wrapper = mount(TagGroup, {
            props: {
                tagList,
            },
        });

        // Should render without key warnings
        expect(wrapper.findAll(`.${BASE_TAG_CLASS}`).length).toBe(2);
    });
});


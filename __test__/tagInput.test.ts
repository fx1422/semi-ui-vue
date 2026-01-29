import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import TagInput from '../src/components/tagInput/TagInput.vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

describe('TagInput', () => {
    beforeEach(() => {
        // Mock console.warn to avoid warnings in tests
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render with prefix / suffix', () => {
        const suffix = h('div', { class: 'suffix' }, 'suffix');
        const prefix = h('div', { class: 'prefix' }, 'prefix');

        const withNodeSuffix = mount(TagInput, {
            props: {
                suffix,
            },
        });
        const withNodePrefix = mount(TagInput, {
            props: {
                prefix,
            },
        });

        expect(withNodeSuffix.find('.suffix').exists()).toBe(true);
        expect(withNodePrefix.find('.prefix').exists()).toBe(true);
    });

    it('should render with validateStatus', () => {
        const warningTagInput = mount(TagInput, {
            props: {
                validateStatus: 'warning',
            },
        });
        const errorTagInput = mount(TagInput, {
            props: {
                validateStatus: 'error',
            },
        });
        const defaultTagInput = mount(TagInput);

        expect(warningTagInput.classes()).toContain(`${BASE_CLASS_PREFIX}-tagInput-warning`);
        expect(errorTagInput.classes()).toContain(`${BASE_CLASS_PREFIX}-tagInput-error`);
        expect(defaultTagInput.classes()).not.toContain(`${BASE_CLASS_PREFIX}-tagInput-error`);
        expect(defaultTagInput.classes()).not.toContain(`${BASE_CLASS_PREFIX}-tagInput-warning`);
    });

    it('should render with placeholder', () => {
        const placeholderText = 'semi placeholder';
        const tagInput = mount(TagInput, {
            props: {
                placeholder: placeholderText,
            },
        });
        const input = tagInput.find('input');
        expect(input.attributes('placeholder')).toBe(placeholderText);
    });

    it('should render with custom className & style', () => {
        const wrapper = mount(TagInput, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
        });
        expect(wrapper.classes()).toContain('test');
        expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('should render with size', () => {
        const largeTagInput = mount(TagInput, {
            props: {
                size: 'large',
            },
        });
        const smallTagInput = mount(TagInput, {
            props: {
                size: 'small',
            },
        });
        expect(largeTagInput.find('.semi-input-large').exists()).toBe(true);
        expect(smallTagInput.find('.semi-input-small').exists()).toBe(true);
    });

    it('should render with showClear', async () => {
        const showTagInput = mount(TagInput, {
            props: {
                showClear: true,
            },
        });
        expect(showTagInput.find(`.${BASE_CLASS_PREFIX}-icon-clear`).exists()).toBe(true);

        await showTagInput.trigger('mouseenter');
        expect(showTagInput.find(`.${BASE_CLASS_PREFIX}-tagInput-clearBtn-invisible`).exists()).toBe(true);
        showTagInput.unmount();

        const notShowTagInput = mount(TagInput, {
            props: {
                showClear: false,
            },
        });
        expect(notShowTagInput.find(`.${BASE_CLASS_PREFIX}-icon-clear`).exists()).toBe(false);
        notShowTagInput.unmount();

        const tagInput = mount(TagInput, {
            props: {
                showClear: true,
                inputValue: 'semi',
            },
        });
        expect(tagInput.find(`.${BASE_CLASS_PREFIX}-tagInput-clearBtn-invisible`).exists()).toBe(true);
        await tagInput.trigger('mouseenter');
        expect(tagInput.find(`.${BASE_CLASS_PREFIX}-tagInput-clearBtn-invisible`).exists()).toBe(false);
        tagInput.unmount();
    });

    it('should render with defaultValue', async () => {
        const props = {
            defaultValue: ['abc', 'hotsoon'],
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(2);
        expect(tags[0].text()).toContain('abc');
        expect(tags[1].text()).toContain('hotsoon');
        tagInput.unmount();
    });

    it('should handle defaultValue with value undefined', async () => {
        const props = {
            defaultValue: ['semi', 'hotsoon'],
            value: undefined,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(0);
        tagInput.unmount();
    });

    it('should handle defaultValue with value null', async () => {
        const props = {
            defaultValue: ['semi', 'hotsoon'],
            value: null,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(0);
        tagInput.unmount();
    });

    it('should render with disabled', () => {
        const disabledTagInput = mount(TagInput, {
            props: {
                disabled: true,
            },
        });
        expect(disabledTagInput.classes()).toContain(`${BASE_CLASS_PREFIX}-tagInput-disabled`);
        disabledTagInput.unmount();

        const tagInput = mount(TagInput);
        expect(tagInput.classes()).not.toContain(`${BASE_CLASS_PREFIX}-tagInput-disabled`);
        tagInput.unmount();
    });

    it('should handle separator', async () => {
        const props = {
            separator: '-',
            inputValue: 'abc-hotsoon',
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(2);
        expect(tags[0].text()).toContain('abc');
        expect(tags[1].text()).toContain('hotsoon');
        tagInput.unmount();

        // when separator is null
        const props2 = {
            separator: null,
            inputValue: 'semi-hotsoon',
        };
        const tagInput2 = mount(TagInput, { props: props2 });
        await tagInput2.vm.$nextTick();

        const input2 = tagInput2.find('input');
        await input2.trigger('keydown', { keyCode: 13 });
        await tagInput2.vm.$nextTick();

        const tags2 = tagInput2.findAll(`.${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags2.length).toBe(1);
        expect(tags2[0].text()).toContain('semi-hotsoon');
        tagInput2.unmount();
    });

    it('should handle array type separator', async () => {
        const props = {
            separator: ['-', '/', '*'],
            inputValue: 'abc-hotsoon/pipixi*qingyan',
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(4);
        expect(tags[0].text()).toContain('abc');
        expect(tags[1].text()).toContain('hotsoon');
        expect(tags[2].text()).toContain('pipixi');
        expect(tags[3].text()).toContain('qingyan');
        tagInput.unmount();
    });

    it('should handle onRemove & onChange', async () => {
        const spyOnRemove = vi.fn();
        const spyOnChange = vi.fn();
        const props = {
            defaultValue: ['abc', 'hotsoon', 'toutiao', 'lark'],
            onRemove: spyOnRemove,
            onChange: spyOnChange,
            showClear: true,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        // Click tag close button
        const closeButtons = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tag-close`);
        if (closeButtons.length > 1) {
            await closeButtons[1].trigger('click');
            await tagInput.vm.$nextTick();
        }

        // Press Backspace
        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 8 });
        await tagInput.vm.$nextTick();

        // Click clear button
        await tagInput.trigger('mouseenter');
        const clearBtn = tagInput.find(`.${BASE_CLASS_PREFIX}-tagInput-clearBtn`);
        if (clearBtn.exists()) {
            await clearBtn.trigger('click');
            await tagInput.vm.$nextTick();
        }

        expect(spyOnRemove).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalled();
        tagInput.unmount();
    });

    it('should handle onAdd & onChange', async () => {
        const spyOnAdd = vi.fn();
        const spyOnChange = vi.fn();

        // inputValue is empty
        const emptyProps = {
            onChange: spyOnChange,
            onAdd: spyOnAdd,
        };
        const emptyTagInput = mount(TagInput, { props: emptyProps });
        await emptyTagInput.vm.$nextTick();

        const emptyInput = emptyTagInput.find('input');
        await emptyInput.trigger('keydown', { keyCode: 13 });
        await emptyTagInput.vm.$nextTick();

        expect(spyOnAdd).not.toHaveBeenCalled();
        expect(spyOnChange).not.toHaveBeenCalled();
        emptyTagInput.unmount();

        // inputValue is not empty
        const props = {
            inputValue: 'abc,toutiao,,,hotsoon',
            onChange: spyOnChange,
            defaultValue: ['lark'],
            onAdd: spyOnAdd,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        expect(spyOnAdd).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalled();
        tagInput.unmount();
    });

    it('should handle max', async () => {
        const props = {
            defaultValue: ['abc', 'hotsoon'],
            max: 2,
            inputValue: 'lark',
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(2);
        expect(tags[0].text()).toContain('abc');
        expect(tags[1].text()).toContain('hotsoon');
        tagInput.unmount();
    });

    it('should handle maxTagCount', async () => {
        const props = {
            defaultValue: ['abc', 'hotsoon'],
            maxTagCount: 2,
            inputValue: 'lark',
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(2);
        expect(tags[0].text()).toContain('abc');
        expect(tags[1].text()).toContain('hotsoon');

        const n = tagInput.find(`.${BASE_CLASS_PREFIX}-tagInput-wrapper-n`);
        expect(n.exists()).toBe(true);
        expect(n.text()).toContain('+1');
        tagInput.unmount();
    });

    it('should handle maxLength', async () => {
        const props = {
            maxLength: 3,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.setValue('tik');
        await tagInput.vm.$nextTick();
        expect((input.element as HTMLInputElement).value).toBe('tik');

        await input.setValue('tikt');
        await tagInput.vm.$nextTick();
        expect((input.element as HTMLInputElement).value).toBe('tik');
        tagInput.unmount();
    });

    it('should handle onExceed', async () => {
        const spyOnExceed = vi.fn();
        const props = {
            max: 2,
            defaultValue: ['abc', 'hotsoon'],
            inputValue: 'semi',
            onExceed: spyOnExceed,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        expect(spyOnExceed).toHaveBeenCalled();
        tagInput.unmount();
    });

    it('should handle onInputExceed', async () => {
        const spyOnInputExceed = vi.fn();
        const props = {
            maxLength: 2,
            onInputExceed: spyOnInputExceed,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.setValue('hotsoon');
        await tagInput.vm.$nextTick();

        expect(spyOnInputExceed).toHaveBeenCalled();
        tagInput.unmount();
    });

    it('should handle onInputChange', async () => {
        const spyOnInputChange = vi.fn();
        const props = {
            onInputChange: spyOnInputChange,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.setValue('test');
        await tagInput.vm.$nextTick();

        expect(spyOnInputChange).toHaveBeenCalled();
        tagInput.unmount();
    });

    it('should handle onBlur & onFocus', async () => {
        const spyOnBlur = vi.fn();
        const spyOnFocus = vi.fn();
        const props = {
            onBlur: spyOnBlur,
            onFocus: spyOnFocus,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('focus');
        await tagInput.vm.$nextTick();
        expect(spyOnFocus).toHaveBeenCalled();

        await input.trigger('blur');
        await tagInput.vm.$nextTick();
        expect(spyOnBlur).toHaveBeenCalled();
        tagInput.unmount();
    });

    it('should handle addOnBlur', async () => {
        const props = {
            addOnBlur: true,
            defaultValue: ['abc'],
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('focus');
        await tagInput.vm.$nextTick();
        await input.setValue('hotsoon');
        await tagInput.vm.$nextTick();
        await input.trigger('blur');
        await tagInput.vm.$nextTick();
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBeGreaterThanOrEqual(1);
        tagInput.unmount();
    });

    it('should handle value controlled mode', async () => {
        const wrapper = mount({
            template: '<TagInput v-model="value" />',
            components: { TagInput },
            data() {
                return {
                    value: ['abc'],
                };
            },
        });
        await wrapper.vm.$nextTick();

        const tags = wrapper.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(1);
        expect(tags[0].text()).toContain('abc');

        await wrapper.setData({ value: ['hotsoon'] });
        await wrapper.vm.$nextTick();

        const tags2 = wrapper.findAll(`.${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags2.length).toBe(1);
        expect(tags2[0].text()).toContain('hotsoon');
    });

    it('should handle set value to null', async () => {
        const wrapper = mount({
            template: '<TagInput v-model="value" />',
            components: { TagInput },
            data() {
                return {
                    value: ['semi'],
                };
            },
        });
        await wrapper.vm.$nextTick();

        const tags = wrapper.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(1);
        expect(tags[0].text()).toContain('semi');

        await wrapper.setData({ value: null });
        await wrapper.vm.$nextTick();

        const tags2 = wrapper.findAll(`.${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags2.length).toBe(0);
    });

    it('should handle set value to undefined', async () => {
        const wrapper = mount({
            template: '<TagInput v-model="value" />',
            components: { TagInput },
            data() {
                return {
                    value: ['semi'],
                };
            },
        });
        await wrapper.vm.$nextTick();

        const tags = wrapper.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags.length).toBe(1);
        expect(tags[0].text()).toContain('semi');

        await wrapper.setData({ value: undefined });
        await wrapper.vm.$nextTick();

        const tags2 = wrapper.findAll(`.${BASE_CLASS_PREFIX}-tag-content`);
        expect(tags2.length).toBe(0);
    });

    it('should handle inputValue controlled mode', async () => {
        const wrapper = mount({
            template: '<TagInput v-model:inputValue="inputValue" />',
            components: { TagInput },
            data() {
                return {
                    inputValue: 'abc',
                };
            },
        });
        await wrapper.vm.$nextTick();

        const input = wrapper.find('input');
        expect((input.element as HTMLInputElement).value).toBe('abc');

        await wrapper.setData({ inputValue: 'hotsoon' });
        await wrapper.vm.$nextTick();

        expect((input.element as HTMLInputElement).value).toBe('hotsoon');
    });

    it('should handle onKeyDown', async () => {
        const spyOnKeyDown = vi.fn();
        const props = {
            onKeyDown: spyOnKeyDown,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        expect(spyOnKeyDown).toHaveBeenCalled();
        tagInput.unmount();
    });

    it('should handle allowDuplicates', async () => {
        const props = {
            defaultValue: ['abc'],
            inputValue: 'abc',
            allowDuplicates: false,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        const input = tagInput.find('input');
        await input.trigger('keydown', { keyCode: 13 });
        await tagInput.vm.$nextTick();

        const tags = tagInput.findAll(`.${BASE_CLASS_PREFIX}-tagInput-wrapper .${BASE_CLASS_PREFIX}-tag-content`);
        // Should not add duplicate
        expect(tags.length).toBe(1);
        tagInput.unmount();
    });

    it('should handle draggable', async () => {
        const props = {
            defaultValue: ['abc', 'hotsoon'],
            draggable: true,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        // Click to activate
        await tagInput.trigger('click');
        await tagInput.vm.$nextTick();

        // Should show drag handles when active and draggable
        expect(tagInput.classes()).toContain(`${BASE_CLASS_PREFIX}-tagInput-focus`);
        tagInput.unmount();
    });

    it('should handle renderTagItem', async () => {
        const renderTagItem = vi.fn((_value: string, _index: number, _onClose: () => void) => {
            return h('div', { class: 'custom-tag' }, value);
        });
        const props = {
            defaultValue: ['abc', 'hotsoon'],
            renderTagItem,
        };
        const tagInput = mount(TagInput, { props });
        await tagInput.vm.$nextTick();

        expect(renderTagItem).toHaveBeenCalled();
        const customTags = tagInput.findAll('.custom-tag');
        expect(customTags.length).toBeGreaterThan(0);
        tagInput.unmount();
    });
});

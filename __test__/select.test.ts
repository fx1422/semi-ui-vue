import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Select from '../src/components/select';
import { Option } from '../src/components/select';
import KeyCode from '@douyinfe/semi-foundation/utils/keyCode';

const { OptGroup } = Select;

const defaultList = [
    { value: 'abc', label: 'Abc' },
    { value: 'hotsoon', label: 'Hotsoon' },
    { value: 'pipixia', label: 'Pipixia' },
    { value: 'toutiao', label: 'TopBuzz' },
];

function getOptions(list = defaultList) {
    return list.map((optionOpts) =>
        h(Option, {
            value: optionOpts.value,
            label: optionOpts.label,
        })
    );
}

const commonProps = {
    // Turn off animation and delay during testing
    motion: false,
    mouseEnterDelay: 0,
    mouseLeaveDelay: 0,
};

interface SelectProps {
    optionList?: typeof defaultList;
    children?: any;
    [key: string]: any;
}

function getSelect(props: SelectProps = {}) {
    if (!props.optionList && !props.children) {
        props.children = getOptions();
    }

    return mount(Select, {
        props: { ...commonProps, ...props },
        attachTo: document.getElementById('container') || document.body,
        slots: props.children
            ? {
                  default: () => props.children,
              }
            : undefined,
    });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Select', () => {
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

    it('custom className & style', () => {
        const props = {
            className: 'test',
            style: {
                color: 'red',
            },
        };
        const wrapper = getSelect(props);
        expect(wrapper.classes()).toContain('test');
        expect((wrapper.find('div.test').element as HTMLElement).style.color).toBe('red');
        wrapper.unmount();
    });

    it('with placeholder', () => {
        const props = { placeholder: 'semi' };
        const select = getSelect(props);
        const placeholder = select.find('.semi-select-selection-placeholder');
        expect(placeholder.exists()).toBe(true);
        expect(placeholder.text()).toBe('semi');
        select.unmount();
    });

    it('with validateStatus', async () => {
        const props: any = {};
        const select = getSelect(props);
        expect(select.find('.semi-select-error').exists()).toBe(false);
        expect(select.find('.semi-select-warning').exists()).toBe(false);

        await select.setProps({ validateStatus: 'error' });
        expect(select.find('.semi-select-error').exists()).toBe(true);

        await select.setProps({ validateStatus: 'warning' });
        expect(select.find('.semi-select-warning').exists()).toBe(true);
        select.unmount();
    });

    it('different size', async () => {
        const props: any = {};
        const select = getSelect(props);
        expect(select.find('.semi-select-large').exists()).toBe(false);
        expect(select.find('.semi-select-small').exists()).toBe(false);

        await select.setProps({ size: 'large' });
        expect(select.find('.semi-select-large').exists()).toBe(true);

        await select.setProps({ size: 'small' });
        expect(select.find('.semi-select-small').exists()).toBe(true);
        select.unmount();
    });

    it('custom dropdownClassName & dropdownStyle', () => {
        const props = {
            dropdownClassName: 'ddc',
            dropdownStyle: {
                color: 'red',
            },
            defaultOpen: true,
        };
        const select = getSelect(props);
        expect(select.find('.ddc').exists()).toBe(true);
        expect((select.find('.ddc').element as HTMLElement).style.color).toBe('red');
        select.unmount();
    });

    it('defaultValue (not candidate in optionList)', () => {
        // single select
        const props = {
            defaultValue: 'semi',
        };
        const select = getSelect(props);
        expect(select.find('.semi-select-selection-text').text()).toBe('semi');
        select.unmount();

        // multiple select
        const mProps = {
            multiple: true,
            defaultValue: ['semi', 'ies'],
        };
        const mSelect = getSelect(mProps);
        const tags = mSelect.findAll('.semi-select-selection .semi-tag-content');
        expect(tags.length).toBe(2);
        expect(tags[0].text()).toBe('semi');
        expect(tags[1].text()).toBe('ies');
        mSelect.unmount();
    });

    it('defaultValue (can match in optionList)', () => {
        // single select
        const props = {
            defaultValue: 'abc',
        };
        const select = getSelect(props);
        expect(select.find('.semi-select-selection-text').text()).toBe('Abc');
        select.unmount();

        // multiple select
        const mProps = {
            defaultValue: ['abc', 'hotsoon'],
            multiple: true,
        };
        const mSelect = getSelect(mProps);
        const tags = mSelect.findAll('.semi-select-selection .semi-tag-content');
        expect(tags.length).toBe(2);
        expect(tags[0].text()).toBe('Abc');
        expect(tags[1].text()).toBe('Hotsoon');
        mSelect.unmount();
    });

    it('showClear', async () => {
        const props = {
            defaultValue: 'semi',
            showClear: true,
        };
        const select = getSelect(props);

        // Clear button should not show initially
        expect(select.find('.semi-icon-clear').exists()).toBe(false);

        // Show clear button on mouse enter
        await select.find('.semi-select').trigger('mouseenter');
        await nextTick();
        expect(select.find('.semi-clear').exists()).toBe(true);
        select.unmount();

        // Empty select should not show clear
        const emptyProps = { showClear: true };
        const emptySelect = getSelect(emptyProps);
        await emptySelect.find('.semi-select').trigger('mouseenter');
        expect(emptySelect.find('.semi-clear').exists()).toBe(false);
        emptySelect.unmount();
    });

    it('showArrow = false', () => {
        const props = {
            defaultValue: 'semi',
            showArrow: false,
        };
        const select = getSelect(props);
        expect(select.find('.semi-icon-chevron_down').exists()).toBe(false);
        select.unmount();
    });

    it('defaultOpen', async () => {
        const props = {
            defaultOpen: true,
        };
        const select = getSelect(props);
        await nextTick();
        await sleep(100);

        // Options are rendered in Portal, check in document
        const optionList = document.querySelector('.semi-select-option-list');
        expect(optionList).toBeTruthy();
        
        const options = document.querySelectorAll('.semi-select-option');
        expect(options.length).toBe(4);
        expect(options[0].textContent).toContain('Abc');
        expect(options[1].textContent).toContain('Hotsoon');
        select.unmount();
    });

    it('pass options via props.optionList', async () => {
        const props = {
            defaultOpen: true,
            optionList: defaultList,
        };
        const select = getSelect(props);
        await nextTick();

        const candidate = select.findAll('.semi-select-option');
        expect(candidate.length).toBe(4);
        expect(candidate[0].text()).toBe('Abc');
        expect(candidate[1].text()).toBe('Hotsoon');
        select.unmount();
    });

    it('can choose more than one option when multiple is true', async () => {
        const props = {
            multiple: true,
            defaultValue: ['abc', 'hotsoon'],
            defaultOpen: true,
        };
        const select = getSelect(props);
        await nextTick();

        let selection = select.findAll('.semi-select-content-wrapper .semi-tag');
        expect(selection.length).toBe(2);

        const targetOption = select.findAll('.semi-select-option')[3];
        await targetOption.trigger('click');
        await nextTick();

        selection = select.findAll('.semi-select-content-wrapper .semi-tag');
        expect(selection.length).toBe(3);
        select.unmount();
    });

    it('multiple with maxTagCount', async () => {
        const props = {
            multiple: true,
            defaultValue: ['abc', 'hotsoon'],
            maxTagCount: 2,
            defaultOpen: true,
        };
        const select = getSelect(props);
        await nextTick();

        const targetOption = select.findAll('.semi-select-option')[3];
        await targetOption.trigger('click');
        await nextTick();

        const tagGroup = select.find('.semi-tag-group');
        expect(tagGroup.exists()).toBe(true);
        const tags = tagGroup.findAll('.semi-tag');
        expect(tags.length).toBeGreaterThanOrEqual(2);
        select.unmount();
    });

    it('multiple with max, should call onExceed when selected over max', async () => {
        const onExceed = vi.fn();
        const props = {
            multiple: true,
            defaultValue: ['abc', 'hotsoon'],
            max: 2,
            onExceed: onExceed,
            defaultOpen: true,
        };
        const select = getSelect(props);
        await nextTick();

        const targetOption = select.findAll('.semi-select-option')[3];
        await targetOption.trigger('click');
        await nextTick();

        const selection = select.findAll('.semi-select-content-wrapper .semi-tag');
        expect(selection.length).toBe(2);
        expect(onExceed).toHaveBeenCalledOnce();
        select.unmount();
    });

    it('slots', async () => {
        const innerTopSlot = h('div', { class: 'inner-slot' }, 'inner');
        const outerTopSlot = h('div', { class: 'outer-slot' }, 'outer');

        const props = {
            innerTopSlot,
            outerTopSlot,
            defaultOpen: true,
        };
        const select = getSelect(props);
        await nextTick();

        expect(select.find('.inner-slot').exists()).toBe(true);
        expect(select.find('.outer-slot').exists()).toBe(true);
        select.unmount();
    });

    it('loading', async () => {
        const props = {
            defaultOpen: true,
            loading: true,
        };
        const select = getSelect(props);
        await nextTick();

        expect(select.find('.semi-spin').exists()).toBe(true);
        expect(select.find('.semi-select-option').exists()).toBe(false);
        select.unmount();
    });

    it('should open optionList when click selector', async () => {
        const props = {};
        const select = getSelect(props);

        expect(select.find('.semi-select-option-list').exists()).toBe(false);

        await select.find('.semi-select').trigger('click');
        await nextTick();

        expect(select.find('.semi-select-option-list').exists()).toBe(true);
        select.unmount();
    });

    it('disabled component when disabled is true', async () => {
        const props = { disabled: true };
        const select = getSelect(props);

        expect(select.find('.semi-select-disabled').exists()).toBe(true);

        // Should not respond to click events when disabled
        await select.find('.semi-select').trigger('click');
        await nextTick();

        expect(select.find('.semi-select-option-list').exists()).toBe(false);
        select.unmount();
    });

    it('filter = true', async () => {
        const props = {
            filter: true,
        };
        const select = getSelect(props);

        // Click to show input and open dropdown
        await select.find('.semi-select').trigger('click');
        await nextTick();

        const input = select.find('input');
        await input.setValue('abc');
        await nextTick();

        const optionList = select.findAll('.semi-select-option');
        expect(optionList.length).toBe(1);
        expect(optionList[0].text()).toBe('Abc');
        select.unmount();
    });

    it('filter = custom function', async () => {
        const customFilter = (sugInput: string, option: any) => {
            return option.label === 'Hotsoon';
        };
        const props = {
            filter: customFilter,
        };
        const select = getSelect(props);

        await select.find('.semi-select').trigger('click');
        await nextTick();

        const input = select.find('input');
        await input.setValue('tik');
        await nextTick();

        const optionList = select.findAll('.semi-select-option');
        expect(optionList.length).toBe(1);
        expect(optionList[0].text()).toBe('Hotsoon');
        select.unmount();
    });

    it('onSearch', async () => {
        const onSearch = vi.fn();
        const props = {
            onSearch,
            filter: true,
        };
        const select = getSelect(props);

        await select.find('.semi-select').trigger('click');
        await nextTick();

        const input = select.find('input');
        await input.setValue('semi');
        await nextTick();

        expect(onSearch).toHaveBeenCalled();
        expect(onSearch.mock.calls[0][0]).toBe('semi');
        select.unmount();
    });

    it('emptyContent', async () => {
        const emptyContent = 'no data';
        const props = {
            filter: true,
            emptyContent,
        };
        const select = getSelect(props);

        await select.find('.semi-select').trigger('click');
        await nextTick();

        const input = select.find('input');
        await input.setValue('notexist');
        await nextTick();

        const empty = select.find('.semi-select-option-empty');
        expect(empty.exists()).toBe(true);
        expect(empty.text()).toBe(emptyContent);
        select.unmount();
    });

    it('onChange (single)', async () => {
        const onChange = vi.fn();
        const props = {
            defaultOpen: true,
            onChange,
        };
        const select = getSelect(props);
        await nextTick();

        const firstOption = select.findAll('.semi-select-option')[0];
        await firstOption.trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange.mock.calls[0][0]).toBe('abc');
        select.unmount();
    });

    it('onChange (multiple)', async () => {
        const onChange = vi.fn();
        const props = {
            defaultOpen: true,
            multiple: true,
            onChange,
        };
        const select = getSelect(props);
        await nextTick();

        const options = select.findAll('.semi-select-option');
        await options[0].trigger('click');
        await nextTick();
        await options[1].trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange.mock.calls[0][0]).toEqual(['abc']);
        expect(onChange.mock.calls[1][0]).toEqual(['abc', 'hotsoon']);
        select.unmount();
    });

    it('onChange + onChangeWithObject (single)', async () => {
        const onChange = vi.fn();
        const props = {
            defaultOpen: true,
            onChangeWithObject: true,
            onChange,
        };
        const select = getSelect(props);
        await nextTick();

        const firstOption = select.findAll('.semi-select-option')[0];
        await firstOption.trigger('click');
        await nextTick();

        expect(onChange.mock.calls[0][0]).toEqual(expect.objectContaining({ value: 'abc', label: 'Abc' }));
        select.unmount();
    });

    it('onChange + onChangeWithObject (multiple)', async () => {
        const onChange = vi.fn();
        const props = {
            defaultOpen: true,
            onChangeWithObject: true,
            multiple: true,
            onChange,
        };
        const select = getSelect(props);
        await nextTick();

        const options = select.findAll('.semi-select-option');
        await options[0].trigger('click');
        await nextTick();
        await options[1].trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange.mock.calls[0][0][0]).toEqual(expect.objectContaining({ value: 'abc', label: 'Abc' }));
        expect(onChange.mock.calls[1][0][1]).toEqual(expect.objectContaining({ value: 'hotsoon', label: 'Hotsoon' }));
        select.unmount();
    });

    it('controlled mode with value prop', async () => {
        const onChange = vi.fn();
        const props: any = {
            value: 'abc',
            onChange,
        };
        const select = getSelect(props);
        await nextTick();

        expect(select.find('.semi-select-selection-text').text()).toBe('Abc');

        await select.setProps({ value: 'hotsoon' });
        await nextTick();
        expect(select.find('.semi-select-selection-text').text()).toBe('Hotsoon');

        await select.setProps({ value: undefined });
        await nextTick();
        expect(select.find('.semi-select-selection-text').text()).toBe('');
        select.unmount();
    });

    it('onSelect', async () => {
        const onSelect = vi.fn();
        const props = {
            defaultOpen: true,
            onSelect,
        };
        const select = getSelect(props);
        await nextTick();

        const firstOption = select.findAll('.semi-select-option')[0];
        await firstOption.trigger('click');
        await nextTick();

        expect(onSelect).toHaveBeenCalledOnce();
        expect(onSelect.mock.calls[0][0]).toBe('abc');
        expect(onSelect.mock.calls[0][1]).toEqual(expect.objectContaining({ value: 'abc', label: 'Abc' }));
        select.unmount();
    });

    it('onDeselect', async () => {
        const onDeselect = vi.fn();
        const props = {
            multiple: true,
            defaultOpen: true,
            defaultValue: ['abc', 'hotsoon'],
            onDeselect,
        };
        const select = getSelect(props);
        await nextTick();

        const secondOption = select.findAll('.semi-select-option')[1];
        await secondOption.trigger('click');
        await nextTick();

        expect(onDeselect).toHaveBeenCalledOnce();
        expect(onDeselect.mock.calls[0][0]).toBe('hotsoon');
        select.unmount();
    });

    it('test keyboard press', async () => {
        const props = {
            defaultOpen: true,
            optionList: [
                { value: 'abc', label: 'Abc' },
                { value: 'hotsoon', label: 'Hotsoon' },
                { value: 'pipixia', label: 'Pipixia' },
                { value: 'toutiao', label: 'TopBuzz' },
            ],
        };
        const select = getSelect(props);
        await nextTick();

        const trigger = select.find('.semi-select');

        // Press DOWN arrow - should focus second option
        await trigger.trigger('keydown', { keyCode: KeyCode.DOWN });
        await nextTick();
        expect(select.findAll('.semi-select-option')[1].classes()).toContain('semi-select-option-focused');

        // Press UP arrow twice - should wrap to last option
        await trigger.trigger('keydown', { keyCode: KeyCode.UP });
        await trigger.trigger('keydown', { keyCode: KeyCode.UP });
        await nextTick();
        expect(select.findAll('.semi-select-option')[defaultList.length - 1].classes()).toContain('semi-select-option-focused');

        // Press ESC - should close dropdown
        await trigger.trigger('keydown', { keyCode: KeyCode.ESC });
        await nextTick();
        await sleep(100);
        expect(select.find('.semi-select-option').exists()).toBe(false);

        // Reopen and press ENTER to select
        await trigger.trigger('click');
        await nextTick();
        await trigger.trigger('keydown', { keyCode: KeyCode.DOWN });
        await trigger.trigger('keydown', { keyCode: KeyCode.ENTER });
        await nextTick();
        await sleep(100);
        expect(select.find('.semi-select-selection-text').text()).toBe(defaultList[0].label);
        select.unmount();
    });

    it('allowCreate', async () => {
        const props = {
            multiple: true,
            allowCreate: true,
            filter: true,
            optionList: [],
        };
        const select = getSelect(props);

        await select.find('.semi-select').trigger('click');
        await nextTick();

        const input = select.find('.semi-select .semi-input');
        await input.setValue('1');
        await nextTick();

        const option = select.find('.semi-select-option');
        await option.trigger('click');
        await nextTick();

        expect(select.findAll('.semi-select .semi-tag').length).toBe(1);
        select.unmount();
    });

    it('virtualize', async () => {
        const onChange = vi.fn();
        const optionList = Array.from({ length: 100 }, (v, i) => ({
            label: `option-${i}`,
            value: `${i}`,
        }));
        const props = {
            virtualize: {
                itemSize: 36,
            },
            defaultOpen: true,
            optionList,
            onChange,
        };
        const select = getSelect(props);
        await nextTick();

        const options = select.findAll('.semi-select-option');
        expect(options.length).toBeGreaterThan(0);

        const firstOption = options[0];
        await firstOption.trigger('click');
        await nextTick();

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange.mock.calls[0][0]).toBe('0');
        select.unmount();
    });

    it('OptionGroup', async () => {
        const optionList = [
            h(
                OptGroup,
                { label: 'Group1', key: 1 },
                {
                    default: () => [h(Option, { value: 'a-1' }, () => 'a-1'), h(Option, { value: 'a-2' }, () => 'a-2')],
                }
            ),
            h(
                OptGroup,
                { label: 'Group2', key: 2 },
                {
                    default: () => [h(Option, { value: 'b-1' }, () => 'b-1'), h(Option, { value: 'b-2' }, () => 'b-2')],
                }
            ),
        ];
        const props = {
            defaultOpen: true,
            children: optionList,
        };
        const select = getSelect(props);
        await nextTick();

        const groups = select.findAll('.semi-select-group');
        expect(groups.length).toBe(2);
        expect(groups[0].text()).toBe('Group1');
        expect(groups[1].text()).toBe('Group2');
        select.unmount();
    });

    it('empty', async () => {
        const props = {
            defaultOpen: true,
            optionList: [],
            emptyContent: 'empty',
        };
        const select = getSelect(props);
        await nextTick();

        const empty = select.findAll('.semi-select-option.semi-select-option-empty');
        expect(empty.length).toBe(1);
        expect(empty[0].text()).toBe('empty');

        await select.setProps({ emptyContent: null as any });
        await nextTick();
        expect(select.findAll('.semi-select-option').length).toBe(0);
        select.unmount();
    });

    it('ref methods', async () => {
        const props = {
            filter: true,
            multiple: true,
            optionList: defaultList,
        };
        const select = getSelect(props);
        const vm = select.vm as any;

        // Test open
        vm.open();
        await nextTick();
        await sleep(100);
        expect(select.find('.semi-select-option-list').exists()).toBe(true);

        // Test close
        vm.close();
        await nextTick();
        await sleep(100);
        expect(select.find('.semi-select-option-list').exists()).toBe(false);

        // Test selectAll
        vm.selectAll();
        await nextTick();
        expect(select.findAll('.semi-tag').length).toBeGreaterThanOrEqual(4);

        // Test deselectAll
        vm.deselectAll();
        await nextTick();
        expect(select.findAll('.semi-tag').length).toBe(0);

        select.unmount();
    });

    it('onMouseEnter/onMouseLeave', async () => {
        const onMouseEnter = vi.fn();
        const onMouseLeave = vi.fn();
        const props = {
            onMouseEnter,
            onMouseLeave,
        };
        const select = getSelect(props);

        const trigger = select.find('.semi-select');
        await trigger.trigger('mouseenter');
        expect(onMouseEnter).toHaveBeenCalledOnce();

        await trigger.trigger('mouseleave');
        expect(onMouseLeave).toHaveBeenCalledOnce();
        select.unmount();
    });

    it('autoClearSearchValue = true (default)', async () => {
        const optionList = Array.from({ length: 100 }, (v, i) => ({
            label: `option-${i}`,
            value: `${i}`,
        }));
        const props = {
            multiple: true,
            optionList,
            defaultOpen: true,
            filter: true,
        };
        const select = getSelect(props);
        await nextTick();

        const input = select.find('input');
        await input.setValue('option');
        await nextTick();

        const firstOption = select.findAll('.semi-select-option')[0];
        await firstOption.trigger('click');
        await nextTick();

        expect(input.element.value).toBe('');
        select.unmount();
    });

    it('autoClearSearchValue = false', async () => {
        const optionList = Array.from({ length: 100 }, (v, i) => ({
            label: `option-${i}`,
            value: `${i}`,
        }));
        const props = {
            multiple: true,
            optionList,
            defaultOpen: true,
            autoClearSearchValue: false,
            filter: true,
        };
        const select = getSelect(props);
        await nextTick();

        const keyword = 'option';
        const input = select.find('input');
        await input.setValue(keyword);
        await nextTick();

        const firstOption = select.findAll('.semi-select-option')[0];
        await firstOption.trigger('click');
        await nextTick();

        expect(input.element.value).toBe(keyword);
        select.unmount();
    });
});

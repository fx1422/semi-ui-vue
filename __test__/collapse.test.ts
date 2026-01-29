import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Collapse from '../src/components/collapse';
import { IconPlus, IconMinus, IconCopy } from '../src/components/icons';

describe('Collapse', () => {
    it('Collapse with custom className & style', () => {
        const wrapper = mount(Collapse, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, () => 'Content 1'),
                ],
            },
        });

        expect(wrapper.classes()).toContain('test');
        expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('Collapse with defaultActiveKey', async () => {
        const oneExpand = mount(Collapse, {
            props: {
                defaultActiveKey: '1',
            },
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, () => 'Content 1'),
                    h(Collapse.Panel, { itemKey: '2', header: 'Panel 2' }, () => 'Content 2'),
                    h(Collapse.Panel, { itemKey: '3', header: 'Panel 3' }, () => 'Content 3'),
                ],
            },
        });

        await nextTick();

        const headers = oneExpand.findAll('.semi-collapse-header');
        expect(headers[0].attributes('aria-expanded')).toBe('true');
        expect(headers[1].attributes('aria-expanded')).toBe('false');
        expect(headers[2].attributes('aria-expanded')).toBe('false');

        const moreExpand = mount(Collapse, {
            props: {
                defaultActiveKey: ['1', '2'],
            },
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, () => 'Content 1'),
                    h(Collapse.Panel, { itemKey: '2', header: 'Panel 2' }, () => 'Content 2'),
                    h(Collapse.Panel, { itemKey: '3', header: 'Panel 3' }, () => 'Content 3'),
                ],
            },
        });

        await nextTick();

        const moreHeaders = moreExpand.findAll('.semi-collapse-header');
        expect(moreHeaders[0].attributes('aria-expanded')).toBe('true');
        expect(moreHeaders[1].attributes('aria-expanded')).toBe('true');
        expect(moreHeaders[2].attributes('aria-expanded')).toBe('false');
    });

    it('Collapse onChange', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Collapse, {
            props: {
                onChange,
            },
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, () => 'Content 1'),
                    h(Collapse.Panel, { itemKey: '2', header: 'Panel 2' }, () => 'Content 2'),
                    h(Collapse.Panel, { itemKey: '3', header: 'Panel 3' }, () => 'Content 3'),
                ],
            },
        });

        await nextTick();

        const headers = wrapper.findAll('.semi-collapse-header');
        await headers[2].trigger('click');

        expect(onChange).toHaveBeenCalledWith(['3'], expect.any(MouseEvent));
    });

    it('expand more than one panel', async () => {
        const wrapper = mount(Collapse, {
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, () => 'Content 1'),
                    h(Collapse.Panel, { itemKey: '2', header: 'Panel 2' }, () => 'Content 2'),
                    h(Collapse.Panel, { itemKey: '3', header: 'Panel 3' }, () => 'Content 3'),
                ],
            },
        });

        await nextTick();

        const headers = wrapper.findAll('.semi-collapse-header');
        await headers[1].trigger('click');
        await nextTick();
        await headers[2].trigger('click');
        await nextTick();

        expect(headers[0].attributes('aria-expanded')).toBe('false');
        expect(headers[1].attributes('aria-expanded')).toBe('true');
        expect(headers[2].attributes('aria-expanded')).toBe('true');
    });

    it('accordion, Only one expansion is allowed', async () => {
        const wrapper = mount(Collapse, {
            props: {
                accordion: true,
                defaultActiveKey: ['1', '2'],
            },
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, () => 'Content 1'),
                    h(Collapse.Panel, { itemKey: '2', header: 'Panel 2' }, () => 'Content 2'),
                    h(Collapse.Panel, { itemKey: '3', header: 'Panel 3' }, () => 'Content 3'),
                ],
            },
        });

        await nextTick();

        let headers = wrapper.findAll('.semi-collapse-header');
        // only first key active when accordion is true & defaultActiveKey set more than one key
        expect(headers[0].attributes('aria-expanded')).toBe('true');
        expect(headers[1].attributes('aria-expanded')).toBe('false');

        // Click panel-3
        await headers[2].trigger('click');
        await nextTick();

        headers = wrapper.findAll('.semi-collapse-header');
        expect(headers[0].attributes('aria-expanded')).toBe('false');
        expect(headers[1].attributes('aria-expanded')).toBe('false');
        expect(headers[2].attributes('aria-expanded')).toBe('true');
    });

    it('disable Collapse', () => {
        const wrapper = mount(Collapse, {
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1', disabled: true }, () => 'Content 1'),
                ],
            },
        });

        expect(wrapper.find('.semi-collapse-header-disabled').exists()).toBe(true);
    });

    it('hide the panel icon', () => {
        const wrapper = mount(Collapse, {
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1', showArrow: false }, () => 'Content 1'),
                ],
            },
        });

        expect(wrapper.find('.semi-collapse-header-icon').exists()).toBe(false);
    });

    it('Collapse with custom extra content', () => {
        const wrapper = mount(Collapse, {
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, {
                        default: () => 'Content 1',
                        extra: () => '1234'
                    }),
                    h(Collapse.Panel, { itemKey: '2', header: 'Panel 2' }, {
                        default: () => 'Content 2',
                        extra: () => h(IconCopy)
                    }),
                ],
            },
        });

        const rightPanels = wrapper.findAll('.semi-collapse-header-right');
        expect(rightPanels[0].text()).toContain('1234');
    });

    it('Collapse with expandIconPosition left', () => {
        const wrapper = mount(Collapse, {
            props: {
                expandIconPosition: 'left',
            },
            slots: {
                default: () => [
                    h(Collapse.Panel, { itemKey: '1', header: 'Panel 1' }, () => 'Content 1'),
                ],
            },
        });

        expect(wrapper.find('.semi-collapse-header-iconLeft').exists()).toBe(true);
    });
});


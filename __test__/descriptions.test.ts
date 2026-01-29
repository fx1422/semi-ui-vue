import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Descriptions from '../src/components/descriptions';
import Tag from '../src/components/tag';

const data = [
    { key: '实际用户数量', value: '1,480,000' },
    { key: '7天留存', value: '98%' },
    { key: '安全等级', value: '3级' },
    { key: '垂类标签', value: h(Tag, {}, () => '电商') },
    { key: '认证状态', value: '未认证' },
];

const dataWithHide = [
    { key: '实际用户数量', value: '1,480,000', hidden: true },
    { key: '7天留存', value: '98%' },
    { key: '安全等级', value: '3级' },
    { key: '垂类标签', value: h(Tag, { style: { margin: 0 } }, () => '电商') },
    { key: '认证状态', value: '未认证' },
];

const dataWithKeyIsNode = [
    { key: h('strong', {}, '实际用户数量'), value: '1,480,000' },
    { key: '7天留存', value: '98%' },
    { key: '安全等级', value: '3级' },
    { key: '垂类标签', value: h(Tag, {}, () => '电商') },
    { key: '认证状态', value: '未认证' },
];

describe('Descriptions', () => {
    it('Descriptions with data', () => {
        const wrapper = mount(Descriptions, {
            props: {
                data,
            },
        });

        const items = wrapper.findAll('tr');
        expect(items.length).toBe(5);

        const firstKey = wrapper.find('.semi-descriptions-key');
        expect(firstKey.text()).toContain('实际用户数量');

        const firstValue = wrapper.find('.semi-descriptions-value');
        expect(firstValue.text()).toBe('1,480,000');
    });

    it('Descriptions with className / style', () => {
        const wrapper = mount(Descriptions, {
            props: {
                data,
                className: 'test',
                style: { height: '420px' },
            },
        });

        expect(wrapper.classes()).toContain('test');
        expect(wrapper.attributes('style')).toContain('height: 420px');
    });

    it('Descriptions with align', () => {
        const centerDesc = mount(Descriptions, {
            props: { data, align: 'center' },
        });
        expect(centerDesc.find('.semi-descriptions-center').exists()).toBe(true);

        const justifyDesc = mount(Descriptions, {
            props: { data, align: 'justify' },
        });
        expect(justifyDesc.find('.semi-descriptions-justify').exists()).toBe(true);

        const leftDesc = mount(Descriptions, {
            props: { data, align: 'left' },
        });
        expect(leftDesc.find('.semi-descriptions-left').exists()).toBe(true);

        const plainDesc = mount(Descriptions, {
            props: { data, align: 'plain' },
        });
        expect(plainDesc.find('.semi-descriptions-plain').exists()).toBe(true);
    });

    it('Descriptions with row', () => {
        const wrapper = mount(Descriptions, {
            props: {
                data,
                row: true,
            },
        });

        expect(wrapper.find('.semi-descriptions-double').exists()).toBe(true);
    });

    it('Descriptions with dataItem hidden', () => {
        const wrapper = mount(Descriptions, {
            props: {
                data: dataWithHide,
            },
        });

        const items = wrapper.findAll('tr');
        expect(items.length).toBe(4); // 5 items - 1 hidden

        const firstKey = wrapper.find('.semi-descriptions-key');
        expect(firstKey.text()).toContain('7天留存');

        const firstValue = wrapper.find('.semi-descriptions-value');
        expect(firstValue.text()).toBe('98%');
    });

    it('Descriptions with size', () => {
        const smallDesc = mount(Descriptions, {
            props: { data, row: true, size: 'small' },
        });
        expect(smallDesc.find('.semi-descriptions-double-small').exists()).toBe(true);

        const mediumDesc = mount(Descriptions, {
            props: { data, row: true, size: 'medium' },
        });
        expect(mediumDesc.find('.semi-descriptions-double-medium').exists()).toBe(true);

        const largeDesc = mount(Descriptions, {
            props: { data, row: true, size: 'large' },
        });
        expect(mediumDesc.find('.semi-descriptions-double-large').exists()).toBe(true);
    });

    it('Descriptions with jsx', () => {
        const wrapper = mount(Descriptions, {
            slots: {
                default: () => [
                    h(Descriptions.Item, { itemKey: '实际用户数量' }, () => '1,480,000'),
                    h(Descriptions.Item, { itemKey: '7天留存' }, () => '98%'),
                    h(Descriptions.Item, { itemKey: '安全等级' }, () => '3级'),
                    h(Descriptions.Item, { itemKey: '垂类标签' }, () => '电商'),
                    h(Descriptions.Item, { itemKey: '认证状态' }, () => '未认证'),
                ],
            },
        });

        const items = wrapper.findAll('tr');
        expect(items.length).toBe(5);

        const firstKey = wrapper.find('.semi-descriptions-key');
        expect(firstKey.text()).toContain('实际用户数量');

        const firstValue = wrapper.find('.semi-descriptions-value');
        expect(firstValue.text()).toBe('1,480,000');
    });

    it('Descriptions with key is node', () => {
        const wrapper = mount(Descriptions, {
            props: {
                data: dataWithKeyIsNode,
            },
        });

        const firstKey = wrapper.find('.semi-descriptions-key strong');
        expect(firstKey.text()).toBe('实际用户数量');

        const keys = wrapper.findAll('.semi-descriptions-key');
        expect(keys[1].text()).toContain('7天留存');
    });

    it('Descriptions layout horizontal', () => {
        const wrapper = mount(Descriptions, {
            props: {
                layout: 'horizontal',
                align: 'left',
                column: 4,
            },
            slots: {
                default: () => [
                    h(Descriptions.Item, { itemKey: h('strong', { style: { color: 'red' } }, '实际用户数量') }, () => '1,480,000'),
                    h(Descriptions.Item, { itemKey: '7天留存' }, () => '98%'),
                    h(Descriptions.Item, { itemKey: '认证状态' }, () => '未认证'),
                ],
            },
        });

        const tds = wrapper.findAll('td');
        expect(tds.length).toBeGreaterThan(0);

        const trs = wrapper.findAll('tr');
        expect(trs.length).toBe(1); // horizontal layout puts items in one row

        expect(wrapper.find('.semi-descriptions-horizontal').exists()).toBe(true);

        const firstKey = wrapper.find('.semi-descriptions-key');
        expect(firstKey.text()).toBe('实际用户数量');

        const firstValue = wrapper.find('.semi-descriptions-value');
        expect(firstValue.text()).toBe('1,480,000');
    });

    it('Descriptions with span', () => {
        const wrapper = mount(Descriptions, {
            props: {
                layout: 'horizontal',
                column: 3,
            },
            slots: {
                default: () => [
                    h(Descriptions.Item, { itemKey: '用户数量', span: 2 }, () => '1,480,000'),
                    h(Descriptions.Item, { itemKey: '留存', span: 1 }, () => '98%'),
                ],
            },
        });

        expect(wrapper.find('.semi-descriptions-horizontal').exists()).toBe(true);
        
        // Span should affect the colspan
        const tds = wrapper.findAll('td');
        expect(tds.length).toBeGreaterThan(0);
    });
});


import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Timeline from '../src/components/timeline';

const dataSource = [
    {
        time: '2019-07-14 10:35',
        extra: '节点辅助说明信息',
        content: '第一个节点内容',
        type: 'ongoing' as const,
    },
    {
        time: '2019-06-13 16:17',
        extra: '节点辅助说明信息',
        content: h('span', { style: { fontSize: '18px' } }, '第二个节点内容'),
        color: 'pink',
    },
    {
        time: '2019-05-14 18:34',
        extra: '节点辅助说明信息',
        dot: '⚠️',
        content: '第三个节点内容',
        type: 'warning' as const,
    },
    {
        time: '2019-05-09 09:12',
        extra: '节点辅助说明信息',
        content: '第四个节点内容',
        type: 'success' as const,
    },
];

describe('Timeline', () => {
    it('Timeline with dataSource', () => {
        const wrapper = mount(Timeline, {
            props: {
                dataSource,
            },
        });

        const items = wrapper.findAll('.semi-timeline-item');
        expect(items.length).toBe(4);

        const firstItem = wrapper.find('.semi-timeline-item .semi-timeline-item-content');
        // content + extra + time
        expect(firstItem.text()).toContain('第一个节点内容');
        expect(firstItem.text()).toContain('节点辅助说明信息');
        expect(firstItem.text()).toContain('2019-07-14 10:35');

        // extra
        expect(wrapper.find('.semi-timeline-item-content-extra').text()).toBe('节点辅助说明信息');

        // time
        expect(wrapper.find('.semi-timeline-item-content-time').text()).toBe('2019-07-14 10:35');

        // type
        expect(wrapper.find('.semi-timeline-item-head-ongoing').exists()).toBe(true);
    });

    it('Timeline with jsx', () => {
        const wrapper = mount(Timeline, {
            slots: {
                default: () => [
                    h(Timeline.Item, { time: '2019-07-14 10:35' }, () => '第一个节点内容'),
                    h(Timeline.Item, { time: '2019-06-13 16:17' }, () => '第二个节点内容'),
                    h(Timeline.Item, { time: '2019-05-14 18:34' }, () => '第三个节点内容'),
                ],
            },
        });

        const firstItem = wrapper.find('.semi-timeline-item .semi-timeline-item-content');
        const text = firstItem.text();
        expect(text).toContain('第一个节点内容');
        expect(text).toContain('2019-07-14 10:35');
    });

    it('Timeline with type', () => {
        const wrapper = mount(Timeline, {
            slots: {
                default: () => [
                    h(Timeline.Item, { time: '2019-07-14 10:35', type: 'default' }, () => '第一个节点内容'),
                    h(Timeline.Item, { time: '2019-06-13 16:17', type: 'ongoing' }, () => '第二个节点内容'),
                    h(Timeline.Item, { time: '2019-05-14 18:34', type: 'success' }, () => '第三个节点内容'),
                    h(Timeline.Item, { time: '2019-05-14 18:34', type: 'warning' }, () => '第四个节点内容'),
                    h(Timeline.Item, { time: '2019-05-14 18:34', type: 'error' }, () => '第五个节点内容'),
                ],
            },
        });

        const items = wrapper.findAll('.semi-timeline-item');
        expect(items.length).toBe(5);

        expect(items[0].find('.semi-timeline-item-head-default').exists()).toBe(true);
        expect(items[1].find('.semi-timeline-item-head-ongoing').exists()).toBe(true);
        expect(items[2].find('.semi-timeline-item-head-success').exists()).toBe(true);
        expect(items[3].find('.semi-timeline-item-head-warning').exists()).toBe(true);
        expect(items[4].find('.semi-timeline-item-head-error').exists()).toBe(true);
    });

    it('Timeline with className & style', () => {
        const wrapper = mount(Timeline, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
            slots: {
                default: () => [
                    h(Timeline.Item, { time: '2019-07-14 10:35', type: 'default' }, () => '第一个节点内容'),
                    h(Timeline.Item, { time: '2019-06-13 16:17', type: 'ongoing' }, () => '第二个节点内容'),
                    h(Timeline.Item, { time: '2019-05-14 18:34', type: 'success' }, () => '第三个节点内容'),
                ],
            },
        });

        expect(wrapper.classes()).toContain('test');
        expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('Timeline.Item with className & style', () => {
        const wrapper = mount(Timeline, {
            slots: {
                default: () => [
                    h(Timeline.Item, { time: '2019-07-14 10:35', type: 'default', className: 'test', style: { color: 'red' } }, () => '第一个节点内容'),
                    h(Timeline.Item, { time: '2019-06-13 16:17', type: 'ongoing' }, () => '第二个节点内容'),
                    h(Timeline.Item, { time: '2019-05-14 18:34', type: 'success' }, () => '第三个节点内容'),
                ],
            },
        });

        const firstItem = wrapper.findAll('.semi-timeline-item')[0];
        expect(firstItem.classes()).toContain('test');
        expect(firstItem.attributes('style')).toContain('color: red');
    });

    it('Timeline with custom dot and color', () => {
        const wrapper = mount(Timeline, {
            slots: {
                default: () => [
                    h(Timeline.Item, { time: '2019-07-14 10:35' }, () => '默认样式的节点'),
                    h(Timeline.Item, { time: '2019-06-13 16:17', dot: '⚠️', type: 'warning' }, () => '自定义图标'),
                    h(Timeline.Item, { time: '2019-05-14 18:34', color: 'pink' }, () => '自定义节点颜色'),
                ],
            },
        });

        const items = wrapper.findAll('.semi-timeline-item');

        expect(items[0].find('.semi-timeline-item-head-default').exists()).toBe(true);
        expect(items[1].find('.semi-timeline-item-head').text()).toBe('⚠️');

        const thirdItemHead = items[2].find('.semi-timeline-item-head-default');
        expect(thirdItemHead.attributes('style')).toContain('background-color: pink');
    });

    it('Timeline with mode', () => {
        const timelineLeft = mount(Timeline, {
            props: {
                dataSource,
                mode: 'left',
            },
        });
        expect(timelineLeft.find('.semi-timeline-left').exists()).toBe(true);

        const timelineCenter = mount(Timeline, {
            props: {
                dataSource,
                mode: 'center',
            },
        });
        expect(timelineCenter.find('.semi-timeline-center').exists()).toBe(true);

        const timelineAlternate = mount(Timeline, {
            props: {
                dataSource,
                mode: 'alternate',
            },
        });
        expect(timelineAlternate.find('.semi-timeline-alternate').exists()).toBe(true);

        const timelineRight = mount(Timeline, {
            props: {
                dataSource,
                mode: 'right',
            },
        });
        expect(timelineRight.find('.semi-timeline-right').exists()).toBe(true);
    });

    it('Timeline with time type VNode', () => {
        const wrapper = mount(Timeline, {
            slots: {
                default: () => [
                    h(Timeline.Item, { time: h('span', '2019-07-14 10:35') }, () => '第一个节点内容'),
                    h(Timeline.Item, { time: '2019-06-13 16:17' }, () => '第二个节点内容'),
                ],
            },
        });

        const firstItem = wrapper.find('.semi-timeline-item .semi-timeline-item-content .semi-timeline-item-content-time');
        expect(firstItem.html()).toContain('<span>2019-07-14 10:35</span>');
    });

    it('Timeline with aria-label', () => {
        const wrapper = mount(Timeline, {
            props: {
                ariaLabel: 'Timeline Navigation',
                dataSource,
            },
        });

        const timelineElement = wrapper.find('.semi-timeline');
        expect(timelineElement.exists()).toBe(true);
        expect(timelineElement.attributes('aria-label')).toBe('Timeline Navigation');
    });

    it('Timeline.Item onClick', () => {
        let clicked = false;
        const wrapper = mount(Timeline, {
            slots: {
                default: () => [
                    h(Timeline.Item, {
                        time: '2019-07-14 10:35',
                        onClick: () => { clicked = true; }
                    }, () => '第一个节点内容'),
                ],
            },
        });

        wrapper.find('.semi-timeline-item').trigger('click');
        expect(clicked).toBe(true);
    });
});


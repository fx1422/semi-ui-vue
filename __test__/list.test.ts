import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import List from '../src/components/list/List.vue';
import ListItem from '../src/components/list/ListItem.vue';
import { cssClasses } from '@douyinfe/semi-foundation/list/constants';
import { h } from 'vue';
import Avatar from '../src/components/avatar/Avatar.vue';
import Button from '../src/components/button/Button.vue';
import ButtonGroup from '../src/components/button/ButtonGroup.vue';

const PREFIX = cssClasses.PREFIX;

const dataSource = [
    '从明天起，做一个幸福的人',
    '喂马，劈柴，周游世界',
    '从明天起，关心粮食和蔬菜',
    '我有一所房子，面朝大海，春暖花开',
];

// 对照 packages/semi-ui/list/__test__/list.test.js
describe('List', () => {
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

    function renderList(props: any = {}) {
        const realProps = {
            dataSource,
            renderItem: (item: string) => h(ListItem, {}, { default: () => item }),
            ...props,
        };
        return mount(List, {
            props: realProps,
            attachTo: document.getElementById('container'),
        });
    }

    it('should render List with slots', () => {
        const wrapper = mount(List, {
            slots: {
                default: [
                    h(ListItem, {}, { default: () => '从明天起，做一个幸福的人' }),
                    h(ListItem, {}, { default: () => '喂马，劈柴，周游世界' }),
                    h(ListItem, {}, { default: () => '从明天起，关心粮食和蔬菜' }),
                    h(ListItem, {}, { default: () => '我有一所房子，面朝大海，春暖花开' }),
                ],
            },
            attachTo: document.getElementById('container'),
        });

        const items = document.querySelectorAll(`.${PREFIX}-item`);
        expect(items.length).toBe(4);
        expect(items[0].textContent).toBe('从明天起，做一个幸福的人');
    });

    it('should render List with basic renderItem', () => {
        const wrapper = renderList();
        const items = document.querySelectorAll(`.${PREFIX}-item`);
        expect(items.length).toBe(4);
        expect(items[0].textContent).toBe('从明天起，做一个幸福的人');
    });

    it('should render List with renderItem header/main/extra', () => {
        const wrapper = renderList({
            renderItem: (item: string) =>
                h(ListItem, {
                    header: h(Avatar, { color: 'blue' }, { default: () => 'SE' }),
                    main: h('div', [
                        h('span', { style: { color: 'var(--semi-color-text-0)', fontWeight: 500 } }, '示例标题'),
                        item,
                    ]),
                    extra: h(ButtonGroup, { theme: 'borderless' }, {
                        default: () => [
                            h(Button, {}, { default: () => '编辑' }),
                            h(Button, {}, { default: () => '更多' }),
                        ],
                    }),
                }),
        });

        // Check header
        const header = document.querySelector(`.${PREFIX}-item-body-header .semi-avatar-label`);
        expect(header?.textContent).toBe('SE');

        // Check main
        const main = document.querySelector(`.${PREFIX}-item-body-main span`);
        expect(main?.textContent).toBe('示例标题');

        // Check extra
        expect(document.querySelector(`.${PREFIX}-item-extra .semi-button-group`)).toBeTruthy();
    });

    it('should render with className and style', () => {
        const wrapper = renderList({
            className: 'test',
            style: { height: '420px' },
        });

        expect(wrapper.classes()).toContain('test');
        expect((wrapper.element as HTMLElement).style.height).toBe('420px');
    });

    it('should render with bordered prop', () => {
        const wrapper = renderList({ bordered: true });
        expect(wrapper.classes()).toContain(`${PREFIX}-bordered`);
    });

    it('should render with different sizes', () => {
        const smallList = renderList({ size: 'small' });
        expect(smallList.classes()).toContain(`${PREFIX}-small`);

        const defaultList = renderList({ size: 'default' });
        expect(defaultList.classes()).toContain(`${PREFIX}-default`);

        const largeList = renderList({ size: 'large' });
        expect(largeList.classes()).toContain(`${PREFIX}-large`);
    });

    it('should render with horizontal layout', () => {
        const horizontalList = renderList({ layout: 'horizontal' });
        expect(horizontalList.classes()).toContain(`${PREFIX}-flex`);

        const verticalList = renderList({ layout: 'vertical' });
        expect(verticalList.classes()).not.toContain(`${PREFIX}-flex`);
    });

    it('should render with grid layout', () => {
        const wrapper = renderList({
            grid: {
                gutter: 18,
                span: 6,
            },
        });

        const items = document.querySelectorAll('.semi-col-6');
        expect(items.length).toBe(4);
    });

    it('should render with split prop', () => {
        const listWithSplit = renderList({ split: true });
        expect(listWithSplit.classes()).toContain(`${PREFIX}-split`);

        const listWithoutSplit = renderList({ split: false });
        expect(listWithoutSplit.classes()).not.toContain(`${PREFIX}-split`);
    });

    it('should handle onClick event', async () => {
        const onClick = vi.fn();
        const wrapper = renderList({ onClick });

        const firstItem = wrapper.find(`.${PREFIX}-item`);
        await firstItem.trigger('click');

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});


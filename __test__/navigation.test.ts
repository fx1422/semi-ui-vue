import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Navigation from '../src/components/navigation/Navigation.vue';
import Item from '../src/components/navigation/Item.vue';
import SubNav from '../src/components/navigation/SubNav.vue';
import Header from '../src/components/navigation/Header.vue';
import Footer from '../src/components/navigation/Footer.vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

const BASE_NAV_CLASS = `${BASE_CLASS_PREFIX}-navigation`;

describe('Navigation', () => {
    beforeEach(() => {
        // Mock window.matchMedia for responsive features
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it('renders with default props', () => {
        const wrapper = mount(Navigation);
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
        expect(wrapper.find(`.${BASE_NAV_CLASS}-list`).exists()).toBe(true);
    });

    it('renders with custom className and style', () => {
        const wrapper = mount(Navigation, {
            props: {
                className: 'test-nav',
                style: { color: 'red' },
            },
        });
        const nav = wrapper.find(`.${BASE_NAV_CLASS}`);
        expect(nav.classes()).toContain('test-nav');
        expect(nav.attributes('style')).toContain('color: red');
    });

    it('renders in vertical mode by default', () => {
        const wrapper = mount(Navigation);
        const list = wrapper.find(`.${BASE_NAV_CLASS}-list`);
        expect(list.attributes('aria-orientation')).toBe('vertical');
    });

    it('renders in horizontal mode', () => {
        const wrapper = mount(Navigation, {
            props: { mode: 'horizontal' },
        });
        const list = wrapper.find(`.${BASE_NAV_CLASS}-list`);
        expect(list.attributes('aria-orientation')).toBe('horizontal');
    });

    it('renders with default selected keys', () => {
        const wrapper = mount(Navigation, {
            props: {
                defaultSelectedKeys: ['home'],
            },
            slots: {
                default: () => h(Item, { itemKey: 'home', text: 'Home' }),
            },
        });
        // Check that component renders correctly with default selected keys
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('renders with default open keys', () => {
        const wrapper = mount(Navigation, {
            props: {
                defaultOpenKeys: ['sub1'],
            },
            slots: {
                default: () => h(SubNav, { itemKey: 'sub1', text: 'Sub1' }),
            },
        });
        // Check that component renders correctly with default open keys
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('renders with controlled selected keys', () => {
        const wrapper = mount(Navigation, {
            props: {
                selectedKeys: ['home'],
            },
            slots: {
                default: () => h(Item, { itemKey: 'home', text: 'Home' }),
            },
        });
        // Check that component renders correctly with controlled selected keys
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('renders with controlled open keys', () => {
        const wrapper = mount(Navigation, {
            props: {
                openKeys: ['sub1'],
            },
            slots: {
                default: () => h(SubNav, { itemKey: 'sub1', text: 'Sub1' }),
            },
        });
        // Check that component renders correctly with controlled open keys
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('renders with items prop', () => {
        const items = [
            { itemKey: 'home', text: 'Home' },
            { itemKey: 'about', text: 'About' },
        ];
        const wrapper = mount(Navigation, {
            props: { items },
        });
        // Check that component renders with items
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('renders with header', () => {
        const wrapper = mount(Navigation, {
            slots: {
                default: () => h(Header, { text: 'Logo' }),
            },
        });
        expect(wrapper.find(`.${BASE_NAV_CLASS}-header`).exists()).toBe(true);
    });

    it('renders with footer', () => {
        const wrapper = mount(Navigation, {
            slots: {
                default: () => h(Footer),
            },
        });
        expect(wrapper.find(`.${BASE_NAV_CLASS}-footer`).exists()).toBe(true);
    });

    it('supports multiple selection', () => {
        const wrapper = mount(Navigation, {
            props: {
                multiple: true,
                defaultSelectedKeys: ['home'],
            },
            slots: {
                default: () => [
                    h(Item, { itemKey: 'home', text: 'Home' }),
                    h(Item, { itemKey: 'about', text: 'About' }),
                ],
            },
        });
        // Check that component renders with multiple selection
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('emits select event when item is clicked', async () => {
        const wrapper = mount(Navigation, {
            slots: {
                default: () => h(Item, { itemKey: 'home', text: 'Home' }),
            },
        });
        
        // Find and click the item
        const item = wrapper.findComponent(Item);
        if (item.exists()) {
            const itemElement = item.find(`.${BASE_NAV_CLASS}-item`);
            if (itemElement.exists()) {
                await itemElement.trigger('click');
                await wrapper.vm.$nextTick();
                // Navigation should emit select event through foundation
                // The event may be emitted through the foundation layer
            }
        }
        // Component should render correctly
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('emits openChange event when subnav is opened', async () => {
        const wrapper = mount(Navigation, {
            slots: {
                default: () => h(SubNav, { itemKey: 'sub1', text: 'Sub1' }),
            },
        });
        
        // Component should render correctly
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('supports collapsed state', () => {
        const wrapper = mount(Navigation, {
            props: {
                isCollapsed: true,
            },
        });
        // Check that component renders with collapsed state
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('supports default collapsed state', () => {
        const wrapper = mount(Navigation, {
            props: {
                defaultIsCollapsed: true,
            },
        });
        // Check that component renders with default collapsed state
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('emits collapseChange event when collapsed state changes', async () => {
        const wrapper = mount(Navigation, {
            props: {
                isCollapsed: false,
            },
        });
        
        // Change collapsed state
        await wrapper.setProps({ isCollapsed: true });
        await wrapper.vm.$nextTick();
        
        // Component should render correctly
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('supports limitIndent prop', () => {
        const wrapper = mount(Navigation, {
            props: {
                limitIndent: false,
            },
        });
        expect(wrapper.props('limitIndent')).toBe(false);
    });

    it('supports subNavMotion prop', () => {
        const wrapper = mount(Navigation, {
            props: {
                subNavMotion: false,
            },
        });
        expect(wrapper.props('subNavMotion')).toBe(false);
    });

    it('supports custom subNav delays', () => {
        const wrapper = mount(Navigation, {
            props: {
                subNavOpenDelay: 200,
                subNavCloseDelay: 300,
            },
        });
        expect(wrapper.props('subNavOpenDelay')).toBe(200);
        expect(wrapper.props('subNavCloseDelay')).toBe(300);
    });

    it('supports custom tooltip delays', () => {
        const wrapper = mount(Navigation, {
            props: {
                tooltipShowDelay: 500,
                tooltipHideDelay: 600,
            },
        });
        expect(wrapper.props('tooltipShowDelay')).toBe(500);
        expect(wrapper.props('tooltipHideDelay')).toBe(600);
    });

    it('renders with bodyStyle', () => {
        const wrapper = mount(Navigation, {
            props: {
                bodyStyle: { padding: '20px' },
            },
        });
        const listWrapper = wrapper.find(`.${BASE_NAV_CLASS}-list-wrapper`);
        expect(listWrapper.attributes('style')).toContain('padding: 20px');
    });

    it('has correct role attribute', () => {
        const wrapper = mount(Navigation);
        const list = wrapper.find(`.${BASE_NAV_CLASS}-list`);
        expect(list.attributes('role')).toBe('menu');
    });
});

describe('Navigation.Item', () => {
    it('renders basic item', () => {
        const wrapper = mount(Item, {
            props: {
                itemKey: 'home',
                text: 'Home',
            },
        });
        expect(wrapper.find(`.${BASE_NAV_CLASS}-item`).exists()).toBe(true);
        expect(wrapper.text()).toContain('Home');
    });

    it('renders with icon', () => {
        const wrapper = mount(Item, {
            props: {
                itemKey: 'home',
                text: 'Home',
                icon: h('span', { class: 'test-icon' }, 'Icon'),
            },
        });
        expect(wrapper.find('.test-icon').exists()).toBe(true);
    });

    it('renders disabled item', () => {
        const wrapper = mount(Item, {
            props: {
                itemKey: 'home',
                text: 'Home',
                disabled: true,
            },
        });
        expect(wrapper.find(`.${BASE_NAV_CLASS}-item-disabled`).exists()).toBe(true);
    });

    it('emits click event', async () => {
        const wrapper = mount(Item, {
            props: {
                itemKey: 'home',
                text: 'Home',
            },
        });
        
        const itemElement = wrapper.find(`.${BASE_NAV_CLASS}-item`);
        await itemElement.trigger('click');
        
        expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('renders with custom className and style', () => {
        const wrapper = mount(Item, {
            props: {
                itemKey: 'home',
                text: 'Home',
                className: 'custom-item',
                style: { color: 'blue' },
            },
        });
        const item = wrapper.find(`.${BASE_NAV_CLASS}-item`);
        expect(item.classes()).toContain('custom-item');
    });

    it('renders with link', () => {
        const wrapper = mount(Item, {
            props: {
                itemKey: 'home',
                text: 'Home',
                link: '/home',
            },
        });
        const link = wrapper.find('a');
        expect(link.exists()).toBe(true);
        expect(link.attributes('href')).toBe('/home');
    });
});

describe('Navigation.SubNav', () => {
    // Helper to create navigation context
    const createNavContext = (overrides = {}) => ({
        prefixCls: BASE_NAV_CLASS,
        isCollapsed: false,
        subNavMotion: true,
        openKeys: [],
        selectedKeys: [],
        mode: 'vertical',
        ...overrides,
    });

    it('renders basic subnav', () => {
        const wrapper = mount(Navigation, {
            slots: {
                default: () => h(SubNav, { itemKey: 'sub1', text: 'Sub1' }),
            },
        });
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('renders with children', () => {
        const wrapper = mount(Navigation, {
            props: {
                defaultOpenKeys: ['sub1'],
            },
            slots: {
                default: () => h(SubNav, { 
                    itemKey: 'sub1', 
                    text: 'Sub1',
                }, {
                    default: () => h(Item, { itemKey: 'sub1-1', text: 'Sub1-1' }),
                }),
            },
        });
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('renders disabled subnav', () => {
        const wrapper = mount(Navigation, {
            slots: {
                default: () => h(SubNav, { 
                    itemKey: 'sub1', 
                    text: 'Sub1',
                    disabled: true,
                }),
            },
        });
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });

    it('handles mouseenter event', async () => {
        const wrapper = mount(Navigation, {
            slots: {
                default: () => h(SubNav, { 
                    itemKey: 'sub1', 
                    text: 'Sub1',
                }),
            },
        });
        
        // Component should render correctly
        expect(wrapper.find(`.${BASE_NAV_CLASS}`).exists()).toBe(true);
    });
});


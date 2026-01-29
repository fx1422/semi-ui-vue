import { VNode, CSSProperties, Component } from 'vue';
import { DropdownProps } from '../dropdown/interface';
import { OverflowListProps } from '../overflowList/interface';

export type TabType = 'line' | 'card' | 'button' | 'slash';
export type TabSize = 'small' | 'medium' | 'large';
export type TabPosition = 'top' | 'left';

export interface PlainTab {
    disabled?: boolean;
    icon?: any;
    itemKey: string;
    tab?: any;
    closable?: boolean;
}

interface TabsDropDownProps {
    start?: DropdownProps;
    end?: DropdownProps;
}

export interface TabsProps {
    activeKey?: string;
    className?: string;
    collapsible?: boolean;
    contentStyle?: CSSProperties;
    defaultActiveKey?: string;
    keepDOM?: boolean;
    lazyRender?: boolean;
    onChange?: (activeKey: string) => void;
    onTabClick?: (activeKey: string, e: MouseEvent) => void;
    renderTabBar?: (tabBarProps: TabBarProps, defaultTabBar: Component) => VNode;
    showRestInDropdown?: boolean;
    size?: TabSize;
    style?: CSSProperties;
    tabBarClassName?: string;
    tabBarExtraContent?: any;
    tabBarStyle?: CSSProperties;
    tabList?: PlainTab[];
    tabPaneMotion?: boolean;
    tabPosition?: TabPosition;
    type?: TabType;
    onTabClose?: (tabKey: string) => void;
    preventScroll?: boolean;
    more?: number | { count: number; render?: () => VNode; dropdownProps?: DropdownProps };
    onVisibleTabsChange?: TabBarProps['onVisibleTabsChange'];
    visibleTabsStyle?: TabBarProps['visibleTabsStyle'];
    arrowPosition?: TabBarProps['arrowPosition'];
    renderArrow?: TabBarProps['renderArrow'];
    dropdownProps?: TabsDropDownProps;
}

export interface OverflowItem extends PlainTab {
    key: string;
    active: boolean;
}

export interface TabBarProps {
    activeKey?: string;
    className?: string;
    collapsible?: boolean;
    list?: Array<PlainTab>;
    onTabClick?: (activeKey: string, event: MouseEvent) => void;
    showRestInDropdown?: boolean;
    size?: TabSize;
    style?: CSSProperties;
    tabBarExtraContent?: any;
    tabPosition?: TabPosition;
    type?: TabType;
    dropdownClassName?: string;
    dropdownStyle?: CSSProperties;
    closable?: boolean;
    deleteTabItem?: (tabKey: string, event: MouseEvent) => void;
    handleKeyDown?: (event: KeyboardEvent, itemKey: string, closable: boolean) => void;
    more?: TabsProps['more'];
    onVisibleTabsChange?: (visibleState: Map<string, boolean>) => void;
    visibleTabsStyle?: CSSProperties;
    arrowPosition?: OverflowListProps['overflowRenderDirection'];
    renderArrow?: (
        items: OverflowItem[],
        pos: 'start' | 'end',
        handleArrowClick: () => void,
        defaultNode: VNode
    ) => VNode;
    dropdownProps?: TabsDropDownProps;
}

export interface TabPaneProps {
    className?: string;
    disabled?: boolean;
    icon?: any;
    itemKey?: string;
    style?: CSSProperties;
    tab?: any;
    closable?: boolean;
    tabIndex?: number;
}

export interface TabItemProps {
    tab?: any;
    icon?: any;
    size?: TabSize;
    type?: TabType;
    tabPosition?: TabPosition;
    selected?: boolean;
    closable?: boolean;
    disabled?: boolean;
    itemKey?: string;
    handleKeyDown?: (event: KeyboardEvent, itemKey: string, closable: boolean) => void;
    deleteTabItem?: (tabKey: string, event: MouseEvent) => void;
    onClick?: (itemKey: string, e: MouseEvent) => void;
}

export interface TabContextValue {
    activeKey?: string;
    lazyRender?: boolean;
    panes?: Array<PlainTab>;
    tabPaneMotion?: boolean;
    tabPosition?: TabPosition;
    prevActiveKey?: string | null;
    forceDisableMotion?: boolean;
}

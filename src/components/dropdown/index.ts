import Dropdown from './Dropdown.vue';
import DropdownMenu from './DropdownMenu.vue';
import DropdownItem from './DropdownItem.vue';
import DropdownDivider from './DropdownDivider.vue';
import DropdownTitle from './DropdownTitle.vue';

// 导入样式（自动引入）
import './dropdown.scss';

export type {
    DropdownProps,
    DropdownMenuProps,
    DropdownItemProps,
    DropdownDividerProps,
    DropdownTitleProps,
    DropDownMenuItem,
    DropDownMenuItemItem,
    DropDownMenuItemDivider,
    DropDownMenuItemTitle,
    Type,
} from './interface';

// 使用 Object.assign 确保属性可枚举，支持解构语法
const DropdownWithSub = Object.assign(Dropdown, {
    Menu: DropdownMenu,
    Item: DropdownItem,
    Divider: DropdownDivider,
    Title: DropdownTitle,
}) as typeof Dropdown & {
    Menu: typeof DropdownMenu;
    Item: typeof DropdownItem;
    Divider: typeof DropdownDivider;
    Title: typeof DropdownTitle;
};

export { DropdownMenu, DropdownItem, DropdownDivider, DropdownTitle };
export default DropdownWithSub;

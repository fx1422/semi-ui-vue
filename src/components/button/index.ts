import Button from './Button.vue';
import ButtonGroup from './ButtonGroup.vue';
import SplitButtonGroup from './SplitButtonGroup.vue';

// 导入样式（自动引入）
import './button.scss';

export type {
    ButtonProps,
    HtmlType,
    Size,
    Theme,
    Type,
    IconSize,
    HorizontalPaddingType,
    ButtonGroupProps,
    GroupTheme,
} from './interface';

export interface SplitButtonGroupProps {
    className?: string;
    style?: Record<string, any>;
    'aria-label'?: string;
}

export default Button;
export { Button, ButtonGroup, SplitButtonGroup };

import Typography from './Typography.vue';
import Text from './Text.vue';
import Title from './Title.vue';
import Paragraph from './Paragraph.vue';

// 导入样式（自动引入）
import './typography.scss';

// 导出类型
export type { BaseTypographyProps, TextProps, TitleProps, ParagraphProps } from './interface';
export type {
    TypographyBaseType,
    TypographyBaseSize,
    TypographyBaseSpacing,
    TitleHeading,
    TitleWeight,
    LinkType,
} from './interface';

// 组合导出（对照 React 版本）
export type TypographyType = typeof Typography & {
    Text: typeof Text;
    Title: typeof Title;
    Paragraph: typeof Paragraph;
};

// 创建一个新对象，包含 Typography 组件和子组件
// 使用 Object.assign 确保属性可枚举，支持解构语法
const TypographyComponent = Object.assign(Typography, {
    Text,
    Title,
    Paragraph,
}) as TypographyType;

// 默认导出组合组件
export default TypographyComponent;

// 按需导出单个组件
export { Typography, Text, Title, Paragraph };

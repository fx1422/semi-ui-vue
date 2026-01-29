import Skeleton from './Skeleton.vue';
import SkeletonAvatar from './SkeletonAvatar.vue';
import SkeletonTitle from './SkeletonTitle.vue';
import SkeletonButton from './SkeletonButton.vue';
import SkeletonImage from './SkeletonImage.vue';
import SkeletonParagraph from './SkeletonParagraph.vue';

// 导入样式（自动引入）
import './skeleton.scss';

export type { SkeletonProps, BasicProps, ParagraphProps, AvatarProps, GenericProps } from './interface';

// 为主组件添加子组件
export type SkeletonType = typeof Skeleton & {
    Avatar: typeof SkeletonAvatar;
    Title: typeof SkeletonTitle;
    Button: typeof SkeletonButton;
    Image: typeof SkeletonImage;
    Paragraph: typeof SkeletonParagraph;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const SkeletonWithSubComponents = Object.assign(Skeleton, {
    Avatar: SkeletonAvatar,
    Title: SkeletonTitle,
    Button: SkeletonButton,
    Image: SkeletonImage,
    Paragraph: SkeletonParagraph,
}) as SkeletonType;

export { SkeletonAvatar, SkeletonTitle, SkeletonButton, SkeletonImage, SkeletonParagraph };

export default SkeletonWithSubComponents;

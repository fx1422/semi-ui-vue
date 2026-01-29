import Tag from './Tag.vue';
import TagGroup from './TagGroup.vue';

// 导入样式（自动引入）
import './tag.scss';

export type { TagProps, TagColor, TagType, TagSize, TagShape, AvatarShape } from './interface';

export { Tag, TagGroup };
export default Tag;

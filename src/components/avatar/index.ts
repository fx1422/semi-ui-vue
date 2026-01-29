import Avatar from './Avatar.vue';
import AvatarGroup from './AvatarGroup.vue';

// 导入样式（自动引入）
import './avatar.scss';
export type {
    AvatarProps,
    AvatarGroupProps,
    AvatarColor,
    AvatarShape,
    AvatarSize,
    AvatarGroupOverlapFrom,
    AvatarGroupShape,
    AvatarGroupSize,
} from './interface';

export { Avatar, AvatarGroup };
export default Avatar;

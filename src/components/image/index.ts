import Image from './Image.vue';
import PreviewInner from './PreviewInner.vue';
import Preview from './Preview.vue';
// 导入样式（包含 Vue 特定的覆盖样式）
import './image.scss';

export default Image;
export { Image, PreviewInner, Preview, Preview as ImagePreview };

export type {
    ImageProps,
    ImageStates,
    PreviewProps,
    PreviewInnerProps,
    PreviewImageProps,
    MenuProps,
    HeaderProps,
    FooterProps,
    PreviewContextProps,
} from './interface';

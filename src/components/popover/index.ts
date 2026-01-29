import Popover from './Popover.vue';

// 导入样式（自动引入）
import './popover.scss';

export { default as Arrow } from './Arrow.vue';
export type { PopoverProps, ArrowStyle, Position, Trigger, ArrowBounding } from './interface';
export type { ArrowProps } from './Arrow.vue';
export default Popover;

import Timeline from './Timeline.vue';
import TimelineItem from './TimelineItem.vue';

// 导入样式（自动引入）
import './timeline.scss';

export type { TimelineProps, TimelineItemProps, TimelineData } from './interface';

// 定义类型
type TimelineType = typeof Timeline & {
    Item: typeof TimelineItem;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const TimelineWithItem = Object.assign(Timeline, {
    Item: TimelineItem,
}) as TimelineType;

export { TimelineItem };
export default TimelineWithItem;

import Row from './Row.vue';
import Col from './Col.vue';

// 导入样式（自动引入）
import './grid.scss';
export type { RowProps, ColProps, ColSize, Gutter, Breakpoint } from './interface';

export { Row, Col };
export default { Row, Col };

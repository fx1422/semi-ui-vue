import BaseRating from './Rating.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './rating.scss';

const Rating = createFieldEnhancer(BaseRating, 'SemiRating');

export type { RatingProps, RatingItemProps } from './interface';

export default Rating;

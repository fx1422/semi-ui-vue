import Card from './Card.vue';
import Meta from './Meta.vue';
import CardGroup from './CardGroup.vue';

// 导入样式（自动引入）
import './card.scss';

export type { CardProps, MetaProps, CardGroupProps, Shadows } from './interface';

export { Card, Meta, CardGroup };

export default Card;

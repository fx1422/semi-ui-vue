import type { CSSProperties } from 'vue';

/**
 * 组件基础 Props 接口
 * 使用索引签名支持 HTML 原生属性和动态属性透传
 */
export interface BaseProps {
    style?: CSSProperties;
    className?: string;
    [key: string]: any;
}

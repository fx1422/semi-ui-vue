/**
 * unplugin-vue-components resolver for Semi UI Vue
 *
 * 使用示例:
 * ```typescript
 * // vite.config.ts
 * import Components from 'unplugin-vue-components/vite';
 * import { SemiUIVueResolver } from '@transsionfe/semi-ui-vue/resolvers';
 *
 * export default {
 *   plugins: [
 *     Components({
 *       resolvers: [SemiUIVueResolver()]
 *     })
 *   ]
 * }
 * ```
 */

import type { ComponentResolver } from 'unplugin-vue-components';

export interface SemiUIVueResolverOptions {
    /**
     * 是否自动导入样式
     * @default true
     */
    importStyle?: boolean | 'css' | 'scss';

    /**
     * 样式导入路径前缀
     * @default '@douyinfe/semi-foundation'
     */
    stylePrefix?: string;
}

/**
 * Semi UI Vue 组件自动导入解析器
 */
export function SemiUIVueResolver(options: SemiUIVueResolverOptions = {}): ComponentResolver {
    const { importStyle = true, stylePrefix = '@douyinfe/semi-foundation' } = options;

    // 组件名称映射（驼峰转 kebab-case）
    const componentMap: Record<string, string> = {
        // 基础组件
        Button: 'button',
        Icon: 'icon',
        Typography: 'typography',
        TypographyText: 'typography',
        TypographyTitle: 'typography',
        TypographyParagraph: 'typography',

        // 输入组件
        Input: 'input',
        TextArea: 'input',
        InputNumber: 'inputNumber',
        Select: 'select',
        DatePicker: 'datePicker',
        TimePicker: 'timePicker',
        Cascader: 'cascader',
        Checkbox: 'checkbox',
        Radio: 'radio',
        Switch: 'switch',
        Slider: 'slider',
        Rate: 'rating',
        Upload: 'upload',
        TagInput: 'tagInput',
        PinCode: 'pinCode',

        // 展示组件
        Avatar: 'avatar',
        Badge: 'badge',
        Card: 'card',
        Carousel: 'carousel',
        Collapse: 'collapse',
        Descriptions: 'descriptions',
        Empty: 'empty',
        Image: 'image',
        List: 'list',
        Popover: 'popover',
        Statistic: 'statistic',
        Table: 'table',
        Tabs: 'tabs',
        Tag: 'tag',
        Timeline: 'timeline',
        Tooltip: 'tooltip',
        Tree: 'tree',
        TreeSelect: 'treeSelect',

        // 反馈组件
        Alert: 'banner',
        Banner: 'banner',
        Drawer: 'sideSheet',
        SideSheet: 'sideSheet',
        Message: 'toast',
        Toast: 'toast',
        Notification: 'notification',
        Modal: 'modal',
        Popconfirm: 'popconfirm',
        Progress: 'progress',
        Skeleton: 'skeleton',
        Spin: 'spin',

        // 导航组件
        Anchor: 'anchor',
        Breadcrumb: 'breadcrumb',
        Navigation: 'navigation',
        Pagination: 'pagination',
        Steps: 'steps',

        // 布局组件
        Layout: 'layout',
        Grid: 'grid',
        Space: 'space',
        Divider: 'divider',

        // 其他组件
        BackTop: 'backTop',
        Calendar: 'calendar',
        ColorPicker: 'colorPicker',
        Form: 'form',
        Highlight: 'highlight',
        Resizable: 'resizable',
        Transfer: 'transfer',
    };

    return {
        type: 'component',
        resolve: (name: string) => {
            const componentName = componentMap[name];

            if (!componentName) {
                return;
            }

            const sideEffects: string[] = [];

            if (importStyle) {
                if (importStyle === 'scss') {
                    sideEffects.push(`${stylePrefix}/${componentName}/${componentName}.scss`);
                } else {
                    // 默认使用 CSS
                    sideEffects.push(`${stylePrefix}/${componentName}/${componentName}.scss`);
                }
            }

            return {
                name,
                from: '@transsionfe/semi-ui-vue',
                sideEffects: sideEffects.length > 0 ? sideEffects : undefined,
            };
        },
    };
}

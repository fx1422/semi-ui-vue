export { useFoundation } from '../../_utils/useFoundation';
export { useBaseComponent } from './useBaseComponent';
export * from './keyboardUtils';
export * from './useLocale';

/**
 * 判断是否为 Semi Icon 组件
 * 支持 VNode、组件定义对象（包括 markRaw 包装的)等
 */
export function isSemiIcon(node: any): boolean {
    if (!node) {
        return false;
    }

    // 如果是 VNode,检查 type
    if (typeof node === 'object' && node.type) {
        const componentName = node.type.name || node.type.__name;
        return typeof componentName === 'string' && componentName.startsWith('Icon');
    }

    // 如果是组件定义对象(包括 markRaw 包装的)
    if (typeof node === 'function' || (typeof node === 'object' && node.setup)) {
        const componentName = node.name || node.__name;
        return typeof componentName === 'string' && componentName.startsWith('Icon');
    }

    // 如果是普通对象,检查 name 属性
    if (typeof node === 'object') {
        const componentName = node.name || node.__name;
        return typeof componentName === 'string' && componentName.startsWith('Icon');
    }

    return false;
}

/**
 * 判断是否为字符串
 */
export function isString(val: unknown): val is string {
    return typeof val === 'string';
}

/**
 * 获取滚动条宽度
 */
export function getScrollbarWidth(): number {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
}

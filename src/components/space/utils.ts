import { VNode, Fragment, isVNode } from 'vue';

/**
 * Flatten the children and return the processed data
 * 移除 null/undefined/false，展开 Fragment
 */
export const flatten = (children: any[]): VNode[] => {
    let res: VNode[] = [];

    children.forEach((child) => {
        if (child === undefined || child === null || child === false) {
            return;
        }
        if (Array.isArray(child)) {
            res = res.concat(flatten(child));
        } else if (isVNode(child) && child.type === Fragment && child.children) {
            res = res.concat(flatten(child.children as any[]));
        } else if (isVNode(child)) {
            res.push(child);
        }
    });

    return res;
};

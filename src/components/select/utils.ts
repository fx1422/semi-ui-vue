import { VNode, VNodeArrayChildren, Fragment } from 'vue';
import warning from '@douyinfe/semi-foundation/utils/warning';
import type { OptionProps, OptionGroupProps } from './interface';

const extractTextFromChildren = (children: any): string => {
    if (!children) return '';
    if (typeof children === 'string' || typeof children === 'number') {
        return String(children);
    }
    if (typeof children === 'object' && children.default && typeof children.default === 'function') {
        const vnodes = children.default();
        if (Array.isArray(vnodes) && vnodes.length > 0) {
            const firstVNode = vnodes[0];
            if (typeof firstVNode === 'string' || typeof firstVNode === 'number') {
                return String(firstVNode);
            }
            if (firstVNode && typeof firstVNode.children === 'string') {
                return firstVNode.children;
            }
        }
    }
    return '';
};

const generateOption = (child: VNode, parent: any, index: number, newKey?: string | number): OptionProps => {
    const childProps = child.props || {};
    if (!child || !childProps) {
        return null;
    }

    let label = childProps.label;
    if (!label) {
        const textContent = extractTextFromChildren(child.children);
        label = textContent || childProps.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { key, ref, ...safeProps } = childProps as any;

    let safeParent = parent;
    if (parent && typeof parent === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { key: _parentKey, ref: _parentRef, ...parentSafeProps } = parent;
        safeParent = parentSafeProps;
    }

    const option: OptionProps = {
        value: childProps.value,
        label: label,
        _show: true,
        _selected: false,
        _scrollIndex: index,
        ...safeProps,
        _parentGroup: safeParent,
    };

    const vNodeKey = child.key;
    option._keyInJsx = newKey || (typeof vNodeKey === 'string' || typeof vNodeKey === 'number' ? vNodeKey : undefined);

    return option;
};

const getOptionsFromGroup = (selectChildren: VNode[] | VNodeArrayChildren) => {
    let optionGroups: OptionGroupProps[] = [];
    let options: OptionProps[] = [];

    const emptyGroup: {
        label: string;
        children: OptionProps[];
        _show: boolean;
    } = { label: '', children: [], _show: false };

    const flattenChildren = (children: VNode[] | VNodeArrayChildren): VNode[] => {
        const result: VNode[] = [];
        (children || []).forEach((child: any) => {
            if (!child) return;
            if (child.type?.toString() === 'Symbol(Comment)') return;
            if (typeof child.children === 'string' && !child.type) return;

            if (child.type === Fragment) {
                const fragmentChildren = Array.isArray(child.children) ? child.children : [];
                result.push(...flattenChildren(fragmentChildren));
            } else if (child && child.type) {
                result.push(child);
            }
        });
        return result;
    };

    const childNodes = flattenChildren(selectChildren) as VNode[];

    let type = '';
    let optionIndex = -1;

    childNodes.forEach((child: VNode) => {
        const childType = child.type as any;

        if (childType?.isSelectOption || childType?.name === 'SelectOption') {
            type = 'option';
            optionIndex++;
            const option = generateOption(child, undefined, optionIndex);
            emptyGroup.children.push(option);
            options.push(option);
        } else if (childType?.isSelectOptionGroup || childType?.name === 'SelectOptionGroup') {
            type = 'group';
            const childProps = child.props || {};
            const groupChildren = child.children;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { key: _groupKey, ref: _groupRef, ...restGroupProps } = childProps as any;

            let childrenNodes: VNode[] = [];
            if (groupChildren && typeof groupChildren === 'object' && 'default' in groupChildren) {
                const defaultSlot = groupChildren.default;
                if (typeof defaultSlot === 'function') {
                    const slotContent = defaultSlot();
                    childrenNodes = (Array.isArray(slotContent) ? slotContent : [slotContent]) as VNode[];
                }
            } else if (Array.isArray(groupChildren)) {
                childrenNodes = groupChildren as VNode[];
            } else if (groupChildren) {
                childrenNodes = [groupChildren as any];
            }

            childrenNodes = childrenNodes.filter((node: any) => {
                if (!node) return false;
                if (node.type?.toString() === 'Symbol(Comment)') return false;
                if (typeof node.children === 'string') return false;
                return node && node.type;
            });

            const originKeys = childrenNodes.map((item) => item?.key);

            const childrenOption = childrenNodes.map((option: VNode, index: number) => {
                let newKey: string | number | undefined =
                    typeof option.key === 'string' || typeof option.key === 'number' ? option.key : undefined;
                if (originKeys[index] === null) {
                    // 如果 option 在 group 中且没有设置 key，拼接父 key 避免冲突
                    const parentKey = typeof child.key === 'string' || typeof child.key === 'number' ? child.key : '';
                    const optionKey =
                        typeof option.key === 'string' || typeof option.key === 'number' ? option.key : '';
                    newKey = parentKey + '' + optionKey;
                }
                optionIndex++;
                return generateOption(option, restGroupProps, optionIndex, newKey);
            });

            const group = {
                ...restGroupProps,
                children: childrenOption,
            };
            optionGroups.push(group);
            options = options.concat(childrenOption);
        } else {
            warning(true, '[Semi Select] The children of `Select` should be `Select.Option` or `Select.OptionGroup`');
        }
    });

    if (type === 'option') {
        optionGroups = [emptyGroup] as OptionGroupProps[];
    }

    return { optionGroups, options };
};

export { generateOption, getOptionsFromGroup };

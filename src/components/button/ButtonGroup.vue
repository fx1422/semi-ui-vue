<script lang="ts">
import { defineComponent, h, cloneVNode, isVNode, Fragment, Comment, type CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/button/constants';
import type { Size, Type, GroupTheme } from './interface';

const prefixCls = cssClasses.PREFIX;

export default defineComponent({
    name: 'ButtonGroup',
    props: {
        disabled: Boolean,
        type: String as () => Type,
        size: {
            type: String as () => Size,
            default: 'default',
        },
        theme: String as () => GroupTheme,
        className: String,
        style: Object as () => CSSProperties,
        'aria-label': String,
    },
    setup(props, { slots, attrs }) {
        return () => {
            const getChildren = () => {
                if (!slots.default) return [];
                const children = slots.default();

                const flatChildren: any[] = [];
                const flatten = (nodes: any[]) => {
                    nodes.forEach((node) => {
                        if (!node) return;
                        if (node.type === Fragment) {
                            flatten(node.children || []);
                        } else if (node.type !== Comment) {
                            flatChildren.push(node);
                        }
                    });
                };
                flatten(children);
                return flatChildren;
            };

            const children = getChildren();
            if (!children || children.length === 0) return null;

            const {
                disabled,
                size,
                type,
                className,
                style,
                'aria-label': ariaLabel,
                ...rest
            } = { ...props, ...attrs } as any;

            const inner = children.map((child, index) => {
                if (!isVNode(child)) return child;

                const childProps: any = {
                    disabled,
                    size,
                    type,
                    ...child.props,
                    ...rest,
                    key: child.key ?? `btn-group-item-${index}`,
                };

                return cloneVNode(child, childProps);
            });

            const innerWithLine: any[] = [];
            if (inner.length > 1) {
                inner.slice(0, -1).forEach((item, index) => {
                    const isButtonType =
                        item?.type?.name === 'Button' ||
                        item?.type?.name === 'IconButton' ||
                        (item?.type && typeof item.type === 'object' && (item.type as any).elementType === 'Button');
                    const buttonProps = item?.props || {};
                    const { type: btnType, theme: btnTheme, disabled: btnDisabled } = buttonProps;

                    if (isButtonType && btnTheme !== 'outline') {
                        const lineCls = classNames(
                            `${prefixCls}-group-line`,
                            `${prefixCls}-group-line-${btnTheme ?? 'light'}`,
                            `${prefixCls}-group-line-${btnType ?? 'primary'}`,
                            {
                                [`${prefixCls}-group-line-disabled`]: btnDisabled,
                            }
                        );
                        innerWithLine.push(item);
                        innerWithLine.push(h('span', { class: lineCls, key: `line-${index}` }));
                    } else {
                        innerWithLine.push(item);
                    }
                });
                innerWithLine.push(inner[inner.length - 1]);
            } else {
                innerWithLine.push(...inner);
            }

            const cls = classNames(`${prefixCls}-group`, className);

            return h(
                'div',
                {
                    class: cls,
                    style,
                    role: 'group',
                    'aria-label': ariaLabel,
                },
                innerWithLine
            );
        };
    },
});
</script>

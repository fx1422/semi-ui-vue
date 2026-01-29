<template>
    <ResizeObserver
        v-if="props.ellipsis"
        :observe-parent="true"
        :observer-property="ObserverProperty.Width"
        @resize="handleResize"
    >
        <TipWrapper />
    </ResizeObserver>
    <TipWrapper v-else />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, useAttrs, useSlots, h, defineComponent } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/typography/constants';
import type { Ellipsis, ShowTooltip, CopyableConfig } from './interface';
import { omit, isString, isUndefined, isNull, isFunction } from 'lodash-es';
import Tooltip from '../tooltip';
import Popover from '../popover';
import ResizeObserver, { ObserverProperty } from '../resizeObserver';
import Copyable from './Copyable.vue';
import getRenderText from './util';
import isEnterPress from '@douyinfe/semi-foundation/utils/isEnterPress';
import { useLocaleContext } from '../locale/context';
import warning from '@douyinfe/semi-foundation/utils/warning';

const prefixCls = cssClasses.PREFIX;
const ELLIPSIS_STR = '...';

const extractTextFromVNode = (vnode: any): string => {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return String(vnode);
    }
    if (Array.isArray(vnode)) {
        return vnode.map(extractTextFromVNode).join('');
    }
    if (vnode && typeof vnode === 'object') {
        if (vnode.children) {
            if (Array.isArray(vnode.children)) {
                return vnode.children.map(extractTextFromVNode).join('');
            }
            return extractTextFromVNode(vnode.children);
        }
        if (vnode.text) {
            return String(vnode.text);
        }
        if (vnode.el && vnode.el.textContent) {
            return vnode.el.textContent;
        }
    }
    return '';
};

defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(
    defineProps<{
        className?: string;
        code?: boolean;
        component?: string;
        copyable?: CopyableConfig | boolean;
        delete?: boolean;
        disabled?: boolean;
        ellipsis?: any;
        icon?: any;
        link?: boolean | any;
        mark?: boolean;
        strong?: boolean;
        style?: any;
        type?: string;
        underline?: boolean;
        heading?: string;
        size?: string;
        spacing?: string;
        weight?: string | number;
        linkOptions?: Record<string, any>;
    }>(),
    {
        component: 'div',
        type: 'primary',
        code: false,
        copyable: false,
        delete: false,
        disabled: false,
        ellipsis: false,
        icon: '',
        mark: false,
        underline: false,
        strong: false,
        link: false,
        spacing: 'normal',
        size: 'normal',
        linkOptions: () => ({}),
    }
);

const slots = useSlots();
const locale = useLocaleContext();
const wrapperRef = ref<HTMLElement>();
const expandRef = ref<HTMLElement>();
const copyRef = ref<HTMLElement>();
const rafId = ref<ReturnType<typeof requestAnimationFrame> | null>(null);
const observerTakingEffect = ref(false);

const state = ref({
    isOverflowed: false,
    ellipsisContent: '',
    expanded: false,
    isTruncated: false,
});

const expandStr = ref('');
const collapseStr = ref('');
const attrs = useAttrs();

const filteredAttrs = computed(() => {
    const { class: removedClass, ...rest } = attrs;
    void removedClass;
    return rest;
});

const componentTag = computed(() => {
    const { link, disabled, component } = props;
    if (link && !disabled) {
        return 'a';
    }
    return component;
});

const linkProps = computed(() => {
    const { link, disabled, linkOptions } = props;
    if (link && !disabled) {
        const linkObj = typeof link === 'object' ? link : {};
        const actualLinkProps: Record<string, any> = {
            href: linkOptions?.href || linkObj.href || 'javascript:void(0)',
            ...linkObj,
            ...(linkOptions
                ? Object.fromEntries(Object.entries(linkOptions).filter(([key]) => key !== 'linkOptions'))
                : {}),
        };
        if (!actualLinkProps.onClick && actualLinkProps.href === 'javascript:void(0)') {
            actualLinkProps.onClick = (e: MouseEvent) => {
                e.preventDefault();
            };
        }
        return actualLinkProps;
    }
    return {};
});

const getEllipsisOpt = (): Ellipsis => {
    const { ellipsis } = props;
    if (!ellipsis) {
        return {
            rows: 1,
            expandable: false,
            collapsible: false,
            pos: 'end',
            showTooltip: false,
            suffix: '',
        };
    }

    const opt: Ellipsis = {
        rows: 1,
        expandable: false,
        pos: 'end',
        suffix: '',
        showTooltip: false,
        collapsible: false,
        expandText: typeof ellipsis === 'object' && ellipsis.expandable ? expandStr.value : undefined,
        collapseText: typeof ellipsis === 'object' && ellipsis.collapsible ? collapseStr.value : undefined,
        ...(typeof ellipsis === 'object' ? ellipsis : {}),
    };
    return opt;
};

const canUseCSSEllipsis = computed(() => {
    const { copyable } = props;
    const { expandable, expandText, pos, suffix } = getEllipsisOpt();
    return !expandable && isUndefined(expandText) && !copyable && pos === 'end' && !suffix.length;
});

const computedStyle = computed(() => {
    const style = { ...props.style };
    if (typeof props.weight === 'number') {
        style.fontWeight = props.weight;
    }

    // 添加 ellipsis CSS 样式
    const { ellipsis } = props;
    if (ellipsis) {
        const { rows } = getEllipsisOpt();
        const { expanded } = state.value;
        const useCSS = !expanded && canUseCSSEllipsis.value;
        const ellipsisStyle = useCSS && rows > 1 ? { WebkitLineClamp: rows } : {};
        return { ...style, ...ellipsisStyle };
    }

    return style;
});

const ellipsisClasses = computed(() => {
    const { ellipsis, component } = props;
    if (!ellipsis) {
        return '';
    }
    const { rows } = getEllipsisOpt();
    const { expanded } = state.value;
    const useCSS = !expanded && canUseCSSEllipsis.value;

    return classNames({
        [`${prefixCls}-ellipsis`]: true,
        [`${prefixCls}-ellipsis-single-line`]: rows === 1,
        [`${prefixCls}-ellipsis-multiple-line`]: rows > 1,
        [`${prefixCls}-ellipsis-multiple-line-text`]: rows > 1 && component === 'span',
        [`${prefixCls}-ellipsis-overflow-ellipsis`]: rows === 1 && useCSS,
        [`${prefixCls}-ellipsis-overflow-ellipsis-text`]: rows === 1 && useCSS && component === 'span',
    });
});

const compareSingleRow = (): boolean => {
    if (!(document && document.createRange)) {
        return false;
    }
    const containerNode = wrapperRef.value;
    if (!containerNode) return false;
    const containerWidth = containerNode.getBoundingClientRect().width;
    const childNodes = Array.from(containerNode.childNodes) as Node[];
    const range = document.createRange();
    const contentWidth = childNodes.reduce((acc: number, node: Node) => {
        range.selectNodeContents(node as Node);
        return acc + (range.getBoundingClientRect().width ?? 0);
    }, 0);
    range.detach();
    return contentWidth > containerWidth;
};

const shouldTruncated = (rows: number): boolean => {
    if (!rows || rows < 1) {
        return false;
    }
    if (!wrapperRef.value) return false;
    const updateOverflow =
        rows <= 1 ? compareSingleRow() : wrapperRef.value.scrollHeight > wrapperRef.value.offsetHeight;
    return updateOverflow;
};

const getEllipsisState = async () => {
    const { rows, suffix, pos } = getEllipsisOpt();
    const children = slots.default ? slots.default() : '';
    const { strong } = props;
    if (!wrapperRef.value || !wrapperRef.value) {
        await onResize();
        return;
    }
    const { expanded } = state.value;
    const canUseCSS = canUseCSSEllipsis.value;
    if (canUseCSS) {
        return;
    }

    if (isNull(children)) {
        state.value.isTruncated = false;
        state.value.isOverflowed = false;
        return;
    }

    // 检查是否为纯文本
    // 对于插槽内容（VNode），尝试提取文本内容来判断
    const isPureText =
        typeof children === 'string' ||
        typeof children === 'number' ||
        (Array.isArray(children) && children.every((item) => typeof item === 'string' || typeof item === 'number'));

    // 如果不是明显的纯文本，尝试从 VNode 中提取文本来判断
    if (!isPureText) {
        const extractedText = extractTextFromVNode(children);
        // 如果能够提取到文本内容，且提取的文本长度合理，认为可能是纯文本
        // 这里不发出警告，因为 VNode 中的纯文本节点是可以正常工作的
        // 只有在确实无法提取文本或提取失败时才需要警告
        if (!extractedText || extractedText.trim().length === 0) {
            // 无法提取文本，可能是复杂的 VNode 结构
            warning(true, '[Semi Typography] ellipsis 仅支持纯文本的截断，请确保插槽内容为纯文本（string 类型）');
        }
    }

    if (!rows || rows < 0 || expanded) {
        return;
    }

    const extraNode = { expand: expandRef.value, copy: copyRef.value };
    const realChildren = Array.isArray(children) ? children.join('') : String(children);

    const content = getRenderText(
        wrapperRef.value,
        rows,
        realChildren,
        extraNode,
        ELLIPSIS_STR,
        suffix || '',
        pos || 'end',
        strong || false
    );
    state.value.isOverflowed = false;
    state.value.ellipsisContent = String(content || '');
    state.value.isTruncated = realChildren !== content;
};

const onResize = async () => {
    if (rafId.value) {
        window.cancelAnimationFrame(rafId.value);
    }
    return new Promise<void>((resolve) => {
        rafId.value = window.requestAnimationFrame(async () => {
            await getEllipsisState();
            resolve();
        });
    });
};

const handleResize = () => {
    if (observerTakingEffect.value) {
        onResize();
    }
};

const toggleOverflow = (e: MouseEvent) => {
    const { onExpand, expandable, collapsible } = getEllipsisOpt();
    const { expanded } = state.value;
    if (onExpand) {
        onExpand(!expanded, e);
    }
    if ((expandable && !expanded) || (collapsible && expanded)) {
        state.value.expanded = !expanded;
    }
};

const onHover = () => {
    const canUseCSS = canUseCSSEllipsis.value;
    if (canUseCSS) {
        const { rows } = getEllipsisOpt();
        const updateOverflow = shouldTruncated(rows);
        state.value.isOverflowed = updateOverflow;
        state.value.isTruncated = false;
    }
};

const showTooltip = computed(() => {
    const { isOverflowed, isTruncated, expanded } = state.value;
    const { showTooltip: showTooltipOpt, expandable, expandText } = getEllipsisOpt();
    const canUseCSS = canUseCSSEllipsis.value;
    const overflowed = !expanded && (canUseCSS ? isOverflowed : isTruncated);
    const noExpandText = !expandable && isUndefined(expandText);
    const show = noExpandText && overflowed && showTooltipOpt;
    if (!show) {
        return null;
    }
    const defaultOpts = {
        type: 'tooltip',
    };
    if (typeof showTooltipOpt === 'object') {
        if (showTooltipOpt.type && showTooltipOpt.type.toLowerCase() === 'popover') {
            return {
                ...defaultOpts,
                ...showTooltipOpt,
                opts: {
                    showArrow: true,
                    className: classNames({
                        [`${prefixCls}-ellipsis-popover`]: true,
                        [showTooltipOpt?.opts?.className || '']: Boolean(showTooltipOpt?.opts?.className),
                    }),
                    ...showTooltipOpt.opts,
                },
            };
        }
        return { ...defaultOpts, ...showTooltipOpt };
    }
    return defaultOpts;
});

const renderExpandable = () => {
    const { expanded, isTruncated } = state.value;
    if (!isTruncated) return null;

    const { expandText, expandable, collapseText, collapsible } = getEllipsisOpt();
    const noExpandText = !expandable && isUndefined(expandText);
    const noCollapseText = !collapsible && isUndefined(collapseText);
    let text: string | undefined;

    if (!expanded && !noExpandText) {
        text = expandText;
    } else if (expanded && !noCollapseText) {
        text = collapseText;
    }
    if (!noExpandText || !noCollapseText) {
        return h(
            'a',
            {
                role: 'button',
                tabIndex: 0,
                class: `${prefixCls}-ellipsis-expand`,
                key: 'expand',
                ref: expandRef,
                'aria-label': text,
                onClick: toggleOverflow,
                onKeypress: (e: KeyboardEvent) => {
                    if (isEnterPress(e)) {
                        toggleOverflow(e as any);
                    }
                },
            },
            { default: () => text }
        );
    }
    return null;
};

const renderCopy = () => {
    const { copyable } = props;
    if (!copyable) {
        return null;
    }
    const children = slots.default ? slots.default() : '';
    const willCopyContent = (copyable as CopyableConfig)?.content ?? children;
    let copyContent: string;
    let hasObject = false;

    const isVNodeArray =
        Array.isArray(willCopyContent) &&
        willCopyContent.length > 0 &&
        willCopyContent.some((item) => item && typeof item === 'object' && ('type' in item || 'el' in item));

    if (isVNodeArray) {
        copyContent = extractTextFromVNode(willCopyContent);
    } else if (Array.isArray(willCopyContent)) {
        copyContent = '';
        willCopyContent.forEach((value) => {
            if (typeof value === 'object' && value !== null) {
                const text = extractTextFromVNode(value);
                if (text) {
                    copyContent += text;
                } else {
                    hasObject = true;
                    copyContent += String(value);
                }
            } else {
                copyContent += String(value);
            }
        });
    } else if (typeof willCopyContent !== 'object' || willCopyContent === null) {
        copyContent = String(willCopyContent);
    } else {
        const extractedText = extractTextFromVNode(willCopyContent);
        if (extractedText) {
            copyContent = extractedText;
        } else {
            hasObject = true;
            copyContent = String(willCopyContent);
        }
    }

    warning(
        hasObject,
        'Content to be copied in Typography is a object, it will case a [object Object] mistake when copy to clipboard.'
    );
    const copyConfig = {
        content: copyContent,
        duration: 3,
        ...(typeof copyable === 'object' ? copyable : {}),
    };
    return h(Copyable, { ...copyConfig, forwardRef: copyRef });
};

const renderOperations = () => {
    const expandable = renderExpandable();
    const copy = renderCopy();
    return [expandable, copy].filter(Boolean);
};

const renderIcon = () => {
    const { icon } = props;
    if (!icon) {
        return null;
    }
    return h(
        'span',
        { class: `${prefixCls}-icon`, 'x-semi-prop': 'icon' },
        {
            default: () => icon,
        }
    );
};

const renderEllipsisText = (opt: Ellipsis) => {
    const { suffix } = opt;
    const children = slots.default ? slots.default() : '';
    const { isTruncated, expanded, ellipsisContent } = state.value;

    if (expanded || !isTruncated) {
        return h(
            'span',
            { onMouseenter: onHover },
            {
                default: () => [children, suffix && suffix.length ? suffix : null],
            }
        );
    }

    // 确保ellipsisContent是有效的字符串
    const safeEllipsisContent =
        ellipsisContent && typeof ellipsisContent === 'string' && ellipsisContent.length > 0
            ? ellipsisContent
            : ELLIPSIS_STR;

    return h(
        'span',
        { onMouseenter: onHover },
        {
            default: () => [safeEllipsisContent, suffix],
        }
    );
};

const wrapperDecorations = (content: any) => {
    const { mark, code, underline, strong, link, disabled } = props;
    const isLinkTag = componentTag.value === 'a';
    let wrapped = content;
    const wrap = (isNeeded: boolean | any, tag: string) => {
        if (!isNeeded) {
            return;
        }
        const wrapProps = typeof isNeeded === 'object' ? { ...isNeeded } : {};
        wrapped = h(tag, wrapProps, { default: () => wrapped });
    };
    wrap(mark, 'mark');
    wrap(code, 'code');
    wrap(underline && !link, 'u');
    wrap(strong, 'strong');
    wrap(props.delete, 'del');
    if (link && !isLinkTag) {
        wrap(link, disabled ? 'span' : 'a');
    }
    return wrapped;
};

const renderContent = () => {
    const { className, type, spacing, style, ellipsis, size, link, heading, weight, ...rest } = props;
    const textProps = omit(rest, ['strong', 'mark', 'copyable', 'underline', 'code', 'delete', 'linkOptions']);
    const children = slots.default ? slots.default() : '';
    const realSize = size === 'inherit' ? (locale as any)?.value || size : size;
    const disabled = props.disabled;
    const iconNode = renderIcon();
    const ellipsisOpt = getEllipsisOpt();
    const ellipsisCls = ellipsisClasses.value;
    let textNode = ellipsis ? renderEllipsisText(ellipsisOpt) : children;
    const linkCls = classNames({
        [`${prefixCls}-link-text`]: link,
        [`${prefixCls}-link-underline`]: props.underline && link,
    });
    const isLinkTag = componentTag.value === 'a';
    const contentWithIcon = iconNode
        ? [iconNode, props.link && !isLinkTag ? h('span', { class: linkCls }, { default: () => textNode }) : textNode]
        : props.link && !isLinkTag
          ? h('span', { class: linkCls }, { default: () => textNode })
          : textNode;
    textNode = wrapperDecorations(contentWithIcon);
    const hTagReg = /^h[1-6]$/;
    const isHeader = isString(heading) && hTagReg.test(heading);
    const wrapperCls = classNames(className, ellipsisCls, {
        [`${prefixCls}-${type}`]: type && !link,
        [`${prefixCls}-${realSize}`]: realSize,
        [`${prefixCls}-link`]: link,
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-${spacing}`]: spacing,
        [`${prefixCls}-${heading}`]: isHeader,
        [`${prefixCls}-${heading}-weight-${weight}`]: isHeader && weight && isNaN(Number(weight)),
    });

    const textStyle: Record<string, any> = {
        ...(isNaN(Number(weight)) ? {} : { fontWeight: weight }),
        ...style,
    };

    return h(
        componentTag.value,
        {
            class: wrapperCls,
            style: { ...textStyle, ...computedStyle.value },
            ref: wrapperRef,
            ...textProps,
            ...filteredAttrs.value,
            ...linkProps.value,
        },
        {
            default: () => [textNode, renderOperations()],
        }
    );
};

const renderTipWrapper = () => {
    const children = slots.default ? slots.default() : '';
    const showTooltipOpt = showTooltip.value;
    const content = renderContent();

    // Extract text content from VNode children to avoid circular reference in Tooltip
    const getTooltipContent = (node: any): string => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) {
            return node
                .map((n) => {
                    // Handle Vue VNode
                    if (n && typeof n === 'object' && n.children !== undefined) {
                        if (typeof n.children === 'string') return n.children;
                        if (Array.isArray(n.children)) return getTooltipContent(n.children);
                    }
                    return getTooltipContent(n);
                })
                .join('');
        }
        return '';
    };

    const tooltipContent = getTooltipContent(children);

    if (showTooltipOpt) {
        const { type, opts, renderTooltip } = showTooltipOpt as ShowTooltip;
        if (isFunction(renderTooltip)) {
            return renderTooltip(tooltipContent, content);
        } else if (type && type.toLowerCase() === 'popover') {
            return h(
                Popover,
                {
                    content: tooltipContent,
                    position: 'top',
                    ...opts,
                },
                {
                    default: () => content,
                }
            );
        }
        return h(
            Tooltip,
            {
                content: tooltipContent,
                position: 'top',
                ...opts,
            },
            {
                default: () => content,
            }
        );
    } else {
        return content;
    }
};

const TipWrapper = defineComponent({
    name: 'TipWrapper',
    setup() {
        return () => renderTipWrapper();
    },
});

const updateLocaleStrings = () => {
    const localeData = locale && typeof locale === 'object' && 'value' in locale ? locale.value : locale;
    const typographyLocale = (localeData as any)?.Typography || {};
    expandStr.value = typographyLocale.expand || '展开';
    collapseStr.value = typographyLocale.collapse || '收起';
};

// 移除有问题的watch监听器，改为在render函数中处理

onMounted(() => {
    updateLocaleStrings();
    if (props.ellipsis) {
        onResize().then(() => {
            nextTick(() => {
                observerTakingEffect.value = true;
            });
        });
    }
});

onBeforeUnmount(() => {
    if (rafId.value) {
        window.cancelAnimationFrame(rafId.value);
    }
});
</script>

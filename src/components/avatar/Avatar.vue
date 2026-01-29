<template>
    <span
        v-if="shouldWrap"
        :class="`${prefixCls}-wrapper`"
        :style="customStyle"
        @click="handleClick"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <component :is="avatarNode()" />
        <component :is="renderTopSlot()" v-if="topSlot && isTopSlotSupportedSize && shape === 'circle'" />
        <component :is="renderBottomSlot()" v-if="bottomSlot && isBottomSlotSupportedSize" />
    </span>
    <component :is="avatarNode()" v-else />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, h, VNode, CSSProperties, nextTick, useSlots } from 'vue';
import { cssClasses, strings } from '@douyinfe/semi-foundation/avatar/constants';
import AvatarFoundation, { AvatarAdapter } from '@douyinfe/semi-foundation/avatar/foundation';
import { AvatarProps } from './interface';
import TopSlotSvg from './TopSlotSvg.vue';

defineOptions({
    name: 'Avatar',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<AvatarProps>(), {
    size: 'medium',
    color: 'grey',
    shape: 'circle',
    gap: 3,
});

const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
    (e: 'mouseenter', event: MouseEvent): void;
    (e: 'mouseleave', event: MouseEvent): void;
    (e: 'error'): void;
}>();

const slots = useSlots();

// State
const isImgExist = ref(true);
const hoverContent = ref<VNode | null>(null);
const focusVisible = ref(false);
const scale = ref(1);
const avatarRef = ref<HTMLElement | null>(null);

let foundation: AvatarFoundation;

// Adapter
const adapter: AvatarAdapter = {
    notifyImgState: (exist: boolean) => {
        isImgExist.value = exist;
    },
    notifyEnter: (e: MouseEvent) => {
        // 优先使用插槽，如果没有插槽则使用 prop
        if (slots['hover-mask']) {
            // 插槽内容会在渲染时处理
            hoverContent.value = true as any; // 标记为使用插槽
        } else {
            hoverContent.value = (props.hoverMask ?? null) as VNode | null;
        }
        emit('mouseenter', e);
    },
    notifyLeave: (e: MouseEvent) => {
        hoverContent.value = null;
        emit('mouseleave', e);
    },
    setFocusVisible: (visible: boolean) => {
        focusVisible.value = visible;
    },
    setScale: (newScale: number) => {
        scale.value = newScale;
    },
    getAvatarNode: () => {
        return avatarRef.value as HTMLSpanElement;
    },
    getProp: (key: string) => {
        return (props as any)[key];
    },
    getProps: () => {
        // Don't call slots.default() here as it's outside render context
        // Return props without children, children will be accessed in render context
        return { ...props };
    },
    // Add missing properties from DefaultAdapter
    getContext: () => null,
    getContexts: () => ({}),
    getState: (key: string) => {
        const state: Record<string, any> = {
            isImgExist: isImgExist.value,
            hoverContent: hoverContent.value,
            focusVisible: focusVisible.value,
            scale: scale.value,
        };
        return state[key];
    },
    getStates: () => ({
        isImgExist: isImgExist.value,
        hoverContent: hoverContent.value,
        focusVisible: focusVisible.value,
        scale: scale.value,
    }),
    setState: () => {}, // Not used in Vue 3 composition API
    getCache: () => null,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: Event) => e.stopPropagation(),
    persistEvent: () => {},
};

// Initialize foundation
onMounted(() => {
    foundation = new AvatarFoundation(adapter);
    foundation.init();
});

onBeforeUnmount(() => {
    if (foundation) {
        foundation.destroy();
    }
});

// Watch for src changes
watch(
    () => props.src,
    (newSrc, oldSrc) => {
        if (newSrc && newSrc !== oldSrc) {
            const image = new Image(0, 0);
            image.src = newSrc;
            image.onload = () => {
                isImgExist.value = true;
            };
            image.onerror = () => {
                isImgExist.value = false;
                emit('error');
            };
            image.onabort = () => {
                isImgExist.value = false;
                emit('error');
            };
        }
    }
);

// Watch for children changes (for string content scale)
// Use a ref to track if slot exists, avoid calling slots.default() in watch
const hasSlot = computed(() => !!slots.default);
watch(
    hasSlot,
    () => {
        if (slots.default) {
            nextTick(() => {
                if (foundation) {
                    foundation.changeScale();
                }
            });
        }
    },
    { immediate: true }
);

// Computed
const isStandardSize = computed(() => {
    return typeof props.size === 'string' && strings.SIZE.includes(props.size);
});

// Top slot 只在特定尺寸下显示（与样式文件中的定义一致）
const isTopSlotSupportedSize = computed(() => {
    return ['small', 'default', 'medium', 'large', 'extra-large'].includes(props.size as string);
});

// Bottom slot 支持的尺寸（与样式文件中的定义一致）
const isBottomSlotSupportedSize = computed(() => {
    return ['extra-small', 'small', 'default', 'medium', 'large', 'extra-large'].includes(props.size as string);
});

const shouldWrap = computed(() => {
    return props.bottomSlot || props.topSlot || props.border;
});

const customStyle = computed(() => {
    const style: CSSProperties = {};
    if (typeof props.size === 'number' || (typeof props.size === 'string' && !strings.SIZE.includes(props.size))) {
        const sizeVal = typeof props.size === 'number' ? `${props.size}px` : props.size;
        style.width = sizeVal;
        style.height = sizeVal;
    }
    return { ...style, ...props.style };
});

const isImg = computed(() => props.src && isImgExist.value);

// Event handlers
const handleClick = (e: MouseEvent) => {
    emit('click', e);
};

const handleMouseEnter = (e: MouseEvent) => {
    if (foundation) {
        foundation.handleEnter(e);
    }
};

const handleMouseLeave = (e: MouseEvent) => {
    if (foundation) {
        foundation.handleLeave(e);
    }
};

const handleImgError = () => {
    if (foundation) {
        foundation.handleImgLoadError();
    }
    emit('error');
};

const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
        case 'Enter':
            handleClick(event as unknown as MouseEvent);
            event.preventDefault();
            break;
        case 'Escape':
            (event.target as HTMLElement)?.blur();
            break;
        default:
            break;
    }
};

const handleFocus = (event: FocusEvent) => {
    if (foundation) {
        foundation.handleFocusVisible(event);
    }
};

const handleBlur = () => {
    if (foundation) {
        foundation.handleBlur();
    }
};

// Render helpers
const getContent = (): VNode | VNode[] | string | null => {
    const children = slots.default ? slots.default() : null;

    const a11yFocusProps = {
        tabindex: 0,
        onKeydown: handleKeyDown,
        onFocus: handleFocus,
        onBlur: handleBlur,
    };

    if (isImg.value) {
        const finalAlt = `clickable Avatar: ${props.alt}`;
        const imgBasicProps = {
            src: props.src,
            srcSet: props.srcSet,
            onError: handleImgError,
            ...props.imgAttr,
        };
        const imgProps = { ...imgBasicProps, ...a11yFocusProps };
        return h('img', { alt: finalAlt, ...imgProps });
    } else if (children && children.length === 1 && typeof children[0].children === 'string') {
        const textContent = children[0].children;
        const tempAlt = props.alt ?? textContent;
        const finalAlt = `clickable Avatar: ${tempAlt}`;
        const spanProps = {
            role: 'img',
            'aria-label': finalAlt,
            class: `${prefixCls}-label`,
            'x-semi-prop': 'children',
        };
        const finalProps = { ...spanProps, ...a11yFocusProps };
        const stringStyle: CSSProperties = {
            transform: `scale(${scale.value})`,
        };
        return h('span', { class: `${prefixCls}-content`, style: stringStyle }, [h('span', finalProps, textContent)]);
    }
    return children;
};

const renderBottomSlot = (): VNode | null => {
    if (!props.bottomSlot) {
        return null;
    }

    if (props.bottomSlot.render) {
        return props.bottomSlot.render();
    }

    // bottomSlot.shape 默认为 'circle'，与 React 版本保持一致
    const { shape = 'circle', text, bgColor, textColor, className, style } = props.bottomSlot;
    const renderContent = () => {
        const contentStyle: CSSProperties = {};
        if (bgColor) contentStyle.backgroundColor = bgColor;
        if (textColor) contentStyle.color = textColor;
        return h(
            'span',
            {
                style: contentStyle,
                class: [
                    `${prefixCls}-bottom_slot-shape_${shape}`,
                    `${prefixCls}-bottom_slot-shape_${shape}-${props.size}`,
                    className ?? '',
                ],
            },
            text
        );
    };

    return h('div', { class: `${prefixCls}-bottom_slot`, style: style ?? {} }, renderContent());
};

const renderTopSlot = (): VNode | null => {
    if (!props.topSlot) {
        return null;
    }

    if (props.topSlot.render) {
        return props.topSlot.render();
    }

    const { style, className, text, textColor, gradientStart, gradientEnd } = props.topSlot;
    const textStyle: CSSProperties = {};
    if (textColor) textStyle.color = textColor;

    return h(
        'div',
        {
            style: style ?? {},
            class: [
                `${prefixCls}-top_slot-wrapper`,
                className ?? '',
                { [`${prefixCls}-animated`]: props.contentMotion },
            ],
        },
        [
            h('div', { class: [`${prefixCls}-top_slot-bg`, `${prefixCls}-top_slot-bg-${props.size}`] }, [
                h('div', { class: [`${prefixCls}-top_slot-bg-svg`, `${prefixCls}-top_slot-bg-svg-${props.size}`] }, [
                    h(TopSlotSvg, {
                        gradientStart: gradientStart ?? 'var(--semi-color-primary)',
                        gradientEnd: gradientEnd ?? 'var(--semi-color-primary)',
                    }),
                ]),
            ]),
            h('div', { class: `${prefixCls}-top_slot` }, [
                h(
                    'div',
                    {
                        style: textStyle,
                        class: [`${prefixCls}-top_slot-content`, `${prefixCls}-top_slot-content-${props.size}`],
                    },
                    text
                ),
            ]),
        ]
    );
};

// Change from computed to function to ensure slots are called in render context
const getAvatarNode = () => {
    const avatarCls = [
        prefixCls,
        props.className,
        {
            [`${prefixCls}-${props.shape}`]: props.shape,
            [`${prefixCls}-${props.size}`]: typeof props.size === 'string' && strings.SIZE.includes(props.size),
            [`${prefixCls}-${props.color}`]: props.color && !isImg.value,
            [`${prefixCls}-img`]: isImg.value,
            [`${prefixCls}-focus`]: focusVisible.value,
            [`${prefixCls}-animated`]: props.contentMotion,
        },
    ];

    // 处理 hover 内容：优先使用插槽，否则使用 prop
    const hoverRender = (() => {
        if (slots['hover-mask'] && hoverContent.value !== null) {
            return h('div', { class: `${prefixCls}-hover`, 'x-semi-prop': 'hoverContent' }, slots['hover-mask']());
        } else if (hoverContent.value && !slots['hover-mask'] && typeof hoverContent.value !== 'boolean') {
            return h('div', { class: `${prefixCls}-hover`, 'x-semi-prop': 'hoverContent' }, hoverContent.value);
        }
        return null;
    })();

    const mouseEvent = shouldWrap.value
        ? {}
        : {
              onClick: handleClick,
              onMouseenter: handleMouseEnter,
              onMouseleave: handleMouseLeave,
          };

    let avatar = h(
        'span',
        {
            style: shouldWrap.value ? {} : customStyle.value,
            class: avatarCls,
            ...mouseEvent,
            role: 'listitem',
            ref: avatarRef,
        },
        [getContent(), hoverRender]
    );

    if (props.border) {
        const borderStyle: CSSProperties = {};
        if (typeof props.border === 'object' && props.border?.color) {
            borderStyle.borderColor = props.border.color;
        }

        const borderElements = [
            avatar,
            h('span', {
                style: borderStyle,
                class: [
                    `${prefixCls}-additionalBorder`,
                    `${prefixCls}-additionalBorder-${props.size}`,
                    { [`${prefixCls}-${props.shape}`]: props.shape },
                ],
            }),
        ];

        if (typeof props.border === 'object' && props.border.motion) {
            borderElements.push(
                h('span', {
                    style: borderStyle,
                    class: [
                        `${prefixCls}-additionalBorder`,
                        `${prefixCls}-additionalBorder-${props.size}`,
                        {
                            [`${prefixCls}-${props.shape}`]: props.shape,
                            [`${prefixCls}-additionalBorder-animated`]: true,
                        },
                    ],
                })
            );
        }

        avatar = h('div', { style: { position: 'relative' as const, ...customStyle.value } }, borderElements);
    }

    return avatar;
};

// Expose as a function that will be called in render context
const avatarNode = getAvatarNode;
</script>

<style scoped></style>

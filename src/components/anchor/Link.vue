<template>
    <div :class="linkCls" :style="style" role="listitem">
        <div
            role="link"
            tabindex="0"
            :aria-disabled="disabled"
            :aria-details="active ? 'active' : undefined"
            :title="!showTooltip && typeof title === 'string' ? title : undefined"
            :class="linkTitleCls"
            :style="{ [paddingAttributeKey]: `${8 * (level || 1)}px` }"
            @click="handleClick"
            @keypress="handleClick"
        >
            <TypographyText
                v-if="showTooltip"
                :size="size === 'default' ? 'normal' : 'small'"
                :ellipsis="ellipsisProp"
                type="tertiary"
                :class="linkTooltipCls"
            >
                {{ title }}
            </TypographyText>
            <template v-else>
                {{ title }}
            </template>
        </div>
        <div v-if="shouldRenderChildren" role="list">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/anchor/constants';
import LinkFoundation, { LinkAdapter } from '@douyinfe/semi-foundation/anchor/linkFoundation';
import { useAnchorContext } from './context';
import type { LinkProps } from './interface';
import TypographyText from '../typography/Text.vue';
import { isObject } from 'lodash-es';

const prefixCls = cssClasses.PREFIX;

// Props
const props = withDefaults(defineProps<LinkProps>(), {
    href: '#',
    title: '',
    disabled: false,
    level: 1,
});

// Context
const context = useAnchorContext();

// Foundation
let foundation: LinkFoundation;

// Adapter
const adapter: LinkAdapter = {
    // LinkAdapter specific methods
    addLink: (href: string) => {
        if (context?.value) {
            context.value.addLink(href);
        }
    },
    removeLink: (href: string) => {
        if (context?.value) {
            context.value.removeLink(href);
        }
    },

    // DefaultAdapter required methods
    getContext: (key: string) => {
        // Vue 没有 React Context，返回空值
        return undefined;
    },
    getContexts: () => {
        return {};
    },
    getState: (key: string) => {
        return undefined;
    },
    getStates: () => {
        return {};
    },
    setState: (newState: any, callback?: () => void) => {
        // Link 组件没有内部状态
        if (callback) {
            callback();
        }
    },
    getProp: (key: string) => {
        return props[key as keyof LinkProps];
    },
    getProps: () => {
        return props;
    },
    getCache: (key: string) => {
        return undefined;
    },
    getCaches: () => {
        return {};
    },
    setCache: (key: string, value: any) => {
        // 可以实现缓存设置，这里暂不实现
    },
    stopPropagation: (e: Event) => {
        e?.stopPropagation();
    },
    persistEvent: (event: Event) => {
        // Vue 3 不需要持久化事件
    },
};

// Computed
const active = computed(() => {
    return context?.value?.activeLink === props.href;
});

const showTooltip = computed(() => {
    return context?.value?.showTooltip;
});

const size = computed(() => {
    return context?.value?.size || 'default';
});

const position = computed(() => {
    return context?.value?.position;
});

const childMap = computed(() => {
    return context?.value?.childMap || {};
});

const autoCollapse = computed(() => {
    return context?.value?.autoCollapse;
});

const linkCls = computed(() => {
    return classNames(`${prefixCls}-link`, props.className);
});

const linkTitleCls = computed(() => {
    return classNames(`${prefixCls}-link-title`, {
        [`${prefixCls}-link-title-active`]: active.value,
        [`${prefixCls}-link-title-disabled`]: props.disabled,
    });
});

const linkTooltipCls = computed(() => {
    return classNames(`${prefixCls}-link-tooltip`, {
        [`${prefixCls}-link-tooltip-small`]: size.value === 'small',
        [`${prefixCls}-link-tooltip-active`]: active.value,
        [`${prefixCls}-link-tooltip-disabled`]: props.disabled,
    });
});

const paddingAttributeKey = computed(() => {
    return props.direction === 'rtl' ? 'paddingRight' : 'paddingLeft';
});

const showTooltipObj = computed(() => {
    if (showTooltip.value) {
        const obj = isObject(showTooltip.value) ? Object.assign({ opts: {} }, showTooltip.value) : { opts: {} };
        // The position can be set through showTooltip, here it is compatible with the position API
        if (position.value) {
            (obj.opts as any)['position'] = position.value;
        }
        return obj;
    }
    return undefined;
});

// 用于传递给 TypographyText 的 ellipsis prop
const ellipsisProp = computed(() => {
    return { showTooltip: showTooltipObj.value };
});

const shouldRenderChildren = computed(() => {
    if (!autoCollapse.value) {
        return true;
    }
    const map = childMap.value[props.href || ''];
    return active.value || (map && map.has(context?.value?.activeLink || ''));
});

// Methods
const handleAddLink = () => {
    if (foundation) {
        foundation.handleAddLink();
    }
};

const handleRemoveLink = () => {
    if (foundation) {
        foundation.handleRemoveLink();
    }
};

const handleUpdateLink = (href: string, prevHref: string) => {
    if (foundation) {
        foundation.handleUpdateLink(href, prevHref);
    }
};

const handleClick = (e: MouseEvent | KeyboardEvent) => {
    const { disabled, href } = props;
    if (!disabled && context?.value && href) {
        context.value.onClick(e, href);
    }
};

// Watch href changes
watch(
    () => props.href,
    (newHref, oldHref) => {
        if (newHref !== oldHref && oldHref) {
            handleUpdateLink(newHref || '', oldHref);
        }
    }
);

// Lifecycle
onMounted(() => {
    foundation = new LinkFoundation(adapter);
    handleAddLink();
});

onUnmounted(() => {
    handleRemoveLink();
});
</script>

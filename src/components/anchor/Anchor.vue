<template>
    <div
        :id="anchorID"
        role="navigation"
        :aria-label="ariaLabel || 'Side navigation'"
        :class="wrapperCls"
        :style="wrapperStyle"
    >
        <div aria-hidden :class="slideCls" :style="{ height: state.scrollHeight }">
            <span :class="slideBarCls" :style="{ top: state.slideBarTop }" />
        </div>
        <div :class="anchorWrapper" role="list">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, onUpdated, nextTick, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/anchor/constants';
import AnchorFoundation, { AnchorAdapter } from '@douyinfe/semi-foundation/anchor/foundation';
import throttle from 'lodash-es/throttle';
import debounce from 'lodash-es/debounce';
import getUuid from '@douyinfe/semi-foundation/utils/uuid';
import type { AnchorProps, AnchorEmits, AnchorState } from './interface';
import { provideAnchorContext } from './context';

const prefixCls = cssClasses.PREFIX;

// Props
const props = withDefaults(defineProps<AnchorProps>(), {
    size: 'default',
    railTheme: 'primary',
    scrollMotion: false,
    autoCollapse: false,
    offsetTop: 0,
    targetOffset: 0,
    showTooltip: false,
    maxWidth: 200,
    maxHeight: '100vh',
    defaultAnchor: '',
});

// Emits
const emit = defineEmits<AnchorEmits>();

// State
const state = reactive<AnchorState>({
    activeLink: '',
    links: [],
    clickLink: false,
    scrollHeight: '100%',
    slideBarTop: '0',
});

// Refs
const anchorID = ref<string>('');
const scrollContainer = ref<HTMLElement | Window | null>(null);
const childMap = ref<Record<string, Set<string>>>({});
const handler = ref<(() => void) | null>(null);
const clickHandler = ref<(() => void) | null>(null);
const prevState = ref<AnchorState>({ ...state });

// Adapter
const adapter: AnchorAdapter = {
    // AnchorAdapter specific methods
    addLink: (value: string) => {
        state.links = [...state.links, value];
    },
    removeLink: (link: string) => {
        const index = state.links.indexOf(link);
        if (index !== -1) {
            state.links.splice(index, 1);
        }
    },
    setChildMap: (value: Record<string, Set<string>>) => {
        childMap.value = value;
    },
    setScrollHeight: (height: string) => {
        state.scrollHeight = height;
    },
    setSlideBarTop: (height: number) => {
        state.slideBarTop = `${height}px`;
    },
    setClickLink: (value: boolean) => {
        state.clickLink = value;
    },
    setActiveLink: (link: string, cb: () => void) => {
        state.activeLink = link;
        // 等待 DOM 更新后再执行回调，确保 active 类名已经应用
        if (cb) {
            nextTick(() => {
                cb();
            });
        }
    },
    setClickLinkWithCallBack: (value: boolean, link: string, cb: (link: string) => void) => {
        state.clickLink = value;
        // 立即执行回调，触发滚动
        if (cb) {
            cb(link);
        }
    },
    getContainer: (): HTMLElement | Window => {
        const { getContainer } = props;
        const container = getContainer ? getContainer() : null;
        return container || window;
    },
    getContainerBoundingTop: (): number => {
        const container = adapter.getContainer();
        if ('getBoundingClientRect' in container) {
            return container.getBoundingClientRect().top;
        }
        return 0;
    },
    getLinksBoundingTop: (): number[] => {
        const { links } = state;
        const { offsetTop } = props;
        const containerTop = adapter.getContainerBoundingTop();
        const elTop = links.map((link) => {
            let node: HTMLElement | null = null;
            try {
                // Get links from containers
                node = document.querySelector(link);
            } catch (e) {
                // Invalid selector
            }
            return (node && node.getBoundingClientRect().top - containerTop - (offsetTop || 0)) || -Infinity;
        });
        return elTop;
    },
    getAnchorNode: (selector: string): HTMLElement | null => {
        const selectors = `#${anchorID.value} ${selector}`;
        return document.querySelector(selectors);
    },
    getContentNode: (selector: string): HTMLElement | null => {
        return document.querySelector(selector);
    },
    notifyChange: (currentLink: string, previousLink: string) => {
        emit('change', currentLink, previousLink);
    },
    notifyClick: (e: MouseEvent, link: string) => {
        emit('click', e, link);
    },
    canSmoothScroll: (): boolean => {
        return 'scrollBehavior' in document.body.style;
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
        return state[key as keyof AnchorState];
    },
    getStates: () => {
        return state;
    },
    setState: (newState: Partial<AnchorState>, callback?: () => void) => {
        Object.assign(state, newState);
        if (callback) {
            nextTick(callback);
        }
    },
    getProp: (key: string) => {
        return props[key as keyof AnchorProps];
    },
    getProps: () => {
        return props;
    },
    getCache: (key: string) => {
        // 可以实现一个简单的缓存机制，这里返回 undefined
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

// Foundation - 在 setup 阶段初始化
const foundation = new AnchorFoundation(adapter);

// Methods
const addLink = (link: string) => {
    foundation.addLink(link);
};

const removeLink = (link: string) => {
    foundation.removeLink(link);
};

const handleScroll = () => {
    foundation.handleScroll();
};

const handleClick = (e: MouseEvent | KeyboardEvent, link: string) => {
    foundation.handleClick(e, link);
};

const handleClickLink = () => {
    foundation.handleClickLink();
};

// Vue 版本的 childMap 构建 - 不能使用 Foundation 的方法，因为它期望 React 元素
const buildChildMapFromSlots = (vnode: any, parents: string[], linkMap: Record<string, Set<string>>) => {
    if (!vnode) return;

    // 处理数组
    if (Array.isArray(vnode)) {
        vnode.forEach((child) => buildChildMapFromSlots(child, parents, linkMap));
        return;
    }

    // 获取 props
    const props = vnode.props || {};
    const href = props.href;

    // Vue VNode 的 children 可能是：
    // 1. 数组（直接的子 VNode）
    // 2. 对象（slot 对象，包含 default 等属性）
    // 3. 函数（slot 函数）
    const children = vnode.children;
    let actualChildren = null;

    if (children) {
        if (Array.isArray(children)) {
            actualChildren = children;
        } else if (typeof children === 'object' && children.default) {
            // 如果是 slot 对象，尝试调用 default slot
            if (typeof children.default === 'function') {
                actualChildren = children.default();
            } else {
                actualChildren = children.default;
            }
        } else if (typeof children === 'function') {
            // 如果 children 本身是函数，调用它
            actualChildren = children();
        }
    }

    // 如果有 href，说明是 Link 组件
    if (href) {
        // 初始化当前节点的 Set
        if (!(href in linkMap)) {
            linkMap[href] = new Set();
        }

        // 将当前节点添加到所有祖先的 Set 中
        for (const parent of parents) {
            linkMap[parent].add(href);
        }

        // 处理子节点
        if (actualChildren) {
            parents.push(href);
            buildChildMapFromSlots(actualChildren, parents, linkMap);
            parents.pop();
        }
    } else if (actualChildren) {
        // 不是 Link 组件，但有子节点，继续遍历
        buildChildMapFromSlots(actualChildren, parents, linkMap);
    }
};

// 在组件外部获取 slots
const slots = useSlots();

const setChildMap = () => {
    const defaultSlot = slots.default?.();

    if (defaultSlot && defaultSlot.length > 0) {
        const linkMap: Record<string, Set<string>> = {};
        buildChildMapFromSlots(defaultSlot, [], linkMap);
        childMap.value = linkMap;
    }
};

const setScrollHeight = () => {
    foundation.setScrollHeight();
};

const updateScrollHeight = (prev: AnchorState, current: AnchorState) => {
    foundation.updateScrollHeight(prev, current);
};

const updateChildMap = (prev: AnchorState, current: AnchorState) => {
    // Vue 版本：检查 links 是否变化，如果变化则重新构建 childMap
    const prevLinks = prev.links.join('');
    const currentLinks = current.links.join('');
    if (prevLinks !== currentLinks) {
        setChildMap(); // 调用 Vue 版本的 setChildMap
    }
};

// Computed
const wrapperCls = computed(() => {
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-size-${props.size}`]: props.size,
    });
});

const slideCls = computed(() => {
    return classNames(`${prefixCls}-slide`, `${prefixCls}-slide-${props.railTheme}`);
});

const slideBarCls = computed(() => {
    return classNames(`${prefixCls}-slide-bar`, {
        [`${prefixCls}-slide-bar-${props.size}`]: props.size,
        [`${prefixCls}-slide-bar-${props.railTheme}`]: props.railTheme,
        [`${prefixCls}-slide-bar-active`]: state.activeLink,
    });
});

const anchorWrapper = computed(() => {
    return `${prefixCls}-link-wrapper`;
});

const wrapperStyle = computed(() => {
    return {
        ...props.style,
        maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
        maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
    };
});

const ariaLabel = computed(() => {
    return props['aria-label'];
});

// Provide context (需要是响应式的)
const anchorContext = computed(() => {
    return {
        activeLink: state.activeLink,
        showTooltip: props.showTooltip,
        position: props.position,
        childMap: childMap.value,
        autoCollapse: props.autoCollapse,
        size: props.size,
        onClick: handleClick,
        addLink,
        removeLink,
    };
});

provideAnchorContext(anchorContext);

// Lifecycle
onMounted(() => {
    const { defaultAnchor = '' } = props;
    anchorID.value = getUuid('semi-anchor').replace(/\./g, '');
    scrollContainer.value = adapter.getContainer();

    handler.value = throttle(handleScroll, 100);
    clickHandler.value = debounce(handleClickLink, 100);

    if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', handler.value as any);
        scrollContainer.value.addEventListener('scroll', clickHandler.value as any);
    }

    setScrollHeight();
    setChildMap();

    if (defaultAnchor) {
        foundation.handleClick(null as any, defaultAnchor, false);
    }
});

onUpdated(() => {
    updateScrollHeight(prevState.value, state);
    updateChildMap(prevState.value, state);
    prevState.value = { ...state };
});

onUnmounted(() => {
    if (scrollContainer.value && handler.value && clickHandler.value) {
        scrollContainer.value.removeEventListener('scroll', handler.value as any);
        scrollContainer.value.removeEventListener('scroll', clickHandler.value as any);
    }
});

// Expose methods
defineExpose({
    addLink,
    removeLink,
});
</script>

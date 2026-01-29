<template>
    <Tooltip
        ref="tooltipRef"
        :z-index="props.zIndex"
        :motion="props.motion"
        :margin="props.margin"
        :content="renderContent"
        :className="props.className"
        :prefixCls="props.prefixCls"
        :spacing="computedSpacing"
        :position="props.position"
        :trigger="props.trigger"
        :show-arrow="false"
        :return-focus-on-close="true"
        :close-on-esc="props.closeOnEsc"
        :get-popup-container="props.getPopupContainer"
        :mouse-enter-delay="props.mouseEnterDelay"
        :mouse-leave-delay="props.mouseLeaveDelay"
        :visible="props.visible"
        :re-pos-key="props.rePosKey"
        @visible-change="handleVisibleChange"
        @esc-key-down="handleEscKeyDown"
    >
        <!--
          统一使用包裹节点作为触发器：
          - 避免 slot 首节点是 Fragment/文本节点时，Tooltip 取 trigger bounding 为 0 导致无法展示
          - 与 React 版本中"触发器必须是可测量 DOM"一致
          - 注意：React 版本使用 React.cloneElement 直接修改子元素的 className
          - Vue 版本使用包装 span，但不复制子元素的 class 到包装器（避免 class 重复）
          - 只添加 showing class 来指示弹出状态
        -->
        <span :class="childClassName" aria-haspopup="true" :aria-expanded="popVisible" @keydown="handleChildKeyDown">
            <slot></slot>
        </span>
    </Tooltip>
</template>

<script setup lang="ts" name="Dropdown">
import { ref, computed, h, isVNode, useSlots, onMounted, watch, Comment, Text } from 'vue';
import classnames from 'classnames';
import { cssClasses, numbers, strings } from '@douyinfe/semi-foundation/dropdown/constants';
import { numbers as tooltipNumbers } from '@douyinfe/semi-foundation/tooltip/constants';
import DropdownFoundation, { DropdownAdapter } from '@douyinfe/semi-foundation/dropdown/foundation';
import Tooltip from '../tooltip/Tooltip.vue';
import DropdownMenu from './DropdownMenu.vue';
import DropdownItem from './DropdownItem.vue';
import DropdownDivider from './DropdownDivider.vue';
import DropdownTitle from './DropdownTitle.vue';
import ContextProvider from './ContextProvider.vue';
import { provideDropdownContext, useDropdownContext } from './context';
import type { DropdownProps } from './interface';

const props = withDefaults(defineProps<DropdownProps>(), {
    prefixCls: cssClasses.PREFIX,
    zIndex: tooltipNumbers.DEFAULT_Z_INDEX,
    motion: true,
    trigger: 'hover',
    position: 'bottom',
    mouseLeaveDelay: strings.DEFAULT_LEAVE_DELAY,
    showTick: false,
    closeOnEsc: true,
});

const emit = defineEmits<{
    visibleChange: [visible: boolean];
    escKeyDown: [e: KeyboardEvent];
}>();

const slots = useSlots();
const context = useDropdownContext();

// Provide dropdown context for child components
const { level = 0 } = context;
const contextValue = {
    showTick: props.showTick,
    level: level + 1,
    trigger: props.trigger,
};
provideDropdownContext(contextValue);

const tooltipRef = ref<InstanceType<typeof Tooltip> | null>(null);
const popVisible = ref(props.visible ?? false);

let foundation: DropdownFoundation;

// Adapter implementation
const adapter: DropdownAdapter = {
    setPopVisible: (visible: boolean) => {
        popVisible.value = visible;
    },
    notifyVisibleChange: (visible: boolean) => {
        emit('visibleChange', visible);
    },
    getPopupId: () => {
        // Tooltip 组件的 id 在 containerRef 上
        return (tooltipRef.value as any)?.getPopupId?.() || '';
    },
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => {
        const stateMap: Record<string, any> = {
            visible: popVisible.value,
        };
        return stateMap[key];
    },
    getStates: () => ({
        visible: popVisible.value,
    }),
};

const children = computed(() => {
    const defaultSlot = slots.default?.() || [];
    // 跳过模板缩进产生的空白文本节点/注释节点，避免触发元素被误判为 Text
    const firstValid = defaultSlot.find((node) => {
        if (!node) return false;
        if (node.type === Comment) return false;
        if (node.type === Text) {
            const text = typeof node.children === 'string' ? node.children : '';
            return text.trim().length > 0;
        }
        return true;
    });
    return firstValid || null;
});

const childClassName = computed(() => {
    // In React version, Dropdown uses React.cloneElement to add className directly to children
    // In Vue, we wrap children in a span, but we should NOT copy the child's class to avoid duplicate classes
    // Only add the showing class to indicate popup state
    // The child element should have its own classes applied directly
    return classnames({
        [`${props.prefixCls}-showing`]: popVisible.value,
    });
});

const computedSpacing = computed(() => {
    const { level = 0 } = context;
    if (level > 0) {
        return typeof props.spacing === 'number' ? props.spacing : numbers.NESTED_SPACING;
    } else if (props.spacing === null || typeof props.spacing === 'undefined') {
        return numbers.SPACING;
    }
    return props.spacing;
});

const renderMenuFromArray = () => {
    if (!Array.isArray(props.menu)) {
        return null;
    }

    const menuItems = props.menu.map((m, index) => {
        switch (m.node) {
            case 'title': {
                const { name, node, ...rest } = m;
                return h(DropdownTitle, { ...rest, key: node + name + index }, () => name);
            }
            case 'item': {
                const { node, name, ...rest } = m;
                return h(DropdownItem, { ...rest, key: node + name + index }, () => name);
            }
            case 'divider': {
                return h(DropdownDivider, { key: m.node + index });
            }
            default:
                return null;
        }
    });

    return h(DropdownMenu, {}, () => menuItems);
};

const renderContent = (args?: any) => {
    const className = classnames(props.prefixCls, props.contentClassName);
    const { level = 0 } = context;
    const contextValue = {
        showTick: props.showTick,
        level: level + 1,
        trigger: props.trigger,
    };

    // 优先使用 menu 插槽（更符合 Vue 最佳实践）
    const menuSlot = slots.menu;
    if (menuSlot) {
        return h(
            ContextProvider,
            {
                value: contextValue,
            },
            () =>
                h(
                    'div',
                    {
                        class: className,
                        style: { ...props.style, marginTop: 0, paddingTop: 0 },
                    },
                    h(
                        'div',
                        {
                            class: `${props.prefixCls}-content`,
                            'x-semi-prop': 'menu',
                        },
                        menuSlot()
                    )
                )
        );
    }

    // Tooltip content 支持 function，并会注入 { initialFocusRef }，用于"打开后自动聚焦"
    if (typeof props.render === 'function') {
        const renderFn = props.render as any;
        return h(ContextProvider, { value: contextValue }, () =>
            h(
                'div',
                {
                    class: className,
                    style: { ...props.style, marginTop: 0, paddingTop: 0 },
                },
                h(
                    'div',
                    {
                        class: `${props.prefixCls}-content`,
                        'x-semi-prop': 'render',
                    },
                    renderFn(args)
                )
            )
        );
    }

    let content: any = null;
    if (props.render && isVNode(props.render)) {
        content = props.render;
    } else if (Array.isArray(props.menu)) {
        content = renderMenuFromArray();
    }

    // 使用 ContextProvider 组件来提供 context，确保子组件能够获取到正确的 context 值
    // 这与 React 版本的 DropdownContext.Provider 功能一致
    return h(
        ContextProvider,
        {
            value: contextValue,
        },
        () =>
            h(
                'div',
                {
                    class: className,
                    style: { ...props.style, marginTop: 0, paddingTop: 0 },
                },
                h(
                    'div',
                    {
                        class: `${props.prefixCls}-content`,
                        'x-semi-prop': 'render',
                    },
                    content
                )
            )
    );
};

const handleVisibleChange = (visible: boolean) => {
    foundation?.handleVisibleChange(visible);
};

const handleEscKeyDown = (e: KeyboardEvent) => {
    emit('escKeyDown', e);
};

const handleChildKeyDown = (e: KeyboardEvent) => {
    foundation?.handleKeyDown(e);
    // Also call original keydown handler if exists
    const child = children.value;
    // 尝试从 props 或 attrs 中获取原始的 keydown 处理器
    const originalKeyDown = child?.props?.onKeydown || (child as any)?.props?.onKeyDown;
    if (originalKeyDown && typeof originalKeyDown === 'function') {
        originalKeyDown(e);
    }
};

onMounted(() => {
    foundation = new DropdownFoundation(adapter);
});

// 监听 visible prop 的变化，确保与 React 版本一致
watch(
    () => props.visible,
    (newVisible) => {
        if (newVisible !== undefined && newVisible !== popVisible.value) {
            popVisible.value = newVisible;
        }
    },
    { immediate: true }
);
</script>

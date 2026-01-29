<template>
    <span ref="triggerWrapperRef" :class="triggerCls" style="display: contents">
        <slot></slot>
    </span>
    <Portal v-if="isInsert" :get-popup-container="props.getPopupContainer" :style="{ zIndex: props.zIndex }">
        <div
            ref="portalInnerRef"
            :class="`${BASE_CLASS_PREFIX}-portal-inner`"
            :style="portalInnerStyle"
            @click="handlePortalInnerClick"
            @mousedown="handlePortalMouseDown"
            @focus="handlePortalFocus"
            @blur="handlePortalBlur"
            @keydown="handlePortalInnerKeyDown"
            @mouseenter="handlePortalMouseEnter"
            @mouseleave="handlePortalMouseLeave"
            @contextmenu.prevent="handlePortalContextMenu"
        >
            <div
                v-if="!displayNone"
                :id="id"
                ref="containerRef"
                :class="wrapperClasses"
                :style="wrapperStyle"
                :role="role"
                :x-placement="placement"
                @animationstart="handleAnimationStart"
                @animationend="handleAnimationEnd"
            >
                <div :class="`${prefixCls}-content`">
                    <ContentRenderer v-if="isRenderFunction" :content="content" :initialFocusRef="setInitialFocusRef" />
                    <template v-else>{{ content }}</template>
                </div>
                <component :is="arrowComponent" v-if="showArrow" :class="arrowClasses" :style="arrowStyle" />
            </div>
        </div>
    </Portal>
</template>

<script setup lang="ts" name="Tooltip">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, useAttrs } from 'vue';
import classnames from 'classnames';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';
import TooltipFoundation, { TooltipAdapter } from '@douyinfe/semi-foundation/tooltip/foundation';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/tooltip/constants';
import { getUuidShort } from '@douyinfe/semi-foundation/utils/uuid';
import { TooltipProps, Position } from './interface';
import Portal from '../_portal';
import TriangleArrow from './TriangleArrow.vue';
import TriangleArrowVertical from './TriangleArrowVertical.vue';
import ContentRenderer from './ContentRenderer';

defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(defineProps<TooltipProps>(), {
    arrowBounding: () => numbers.ARROW_BOUNDING,
    autoAdjustOverflow: true,
    arrowPointAtCenter: true,
    trigger: 'hover',
    transformFromCenter: true,
    position: 'top',
    prefixCls: cssClasses.PREFIX,
    role: 'tooltip',
    mouseEnterDelay: numbers.MOUSE_ENTER_DELAY,
    mouseLeaveDelay: numbers.MOUSE_LEAVE_DELAY,
    motion: true,
    spacing: numbers.SPACING,
    margin: numbers.MARGIN,
    showArrow: true,
    wrapWhenSpecial: true,
    zIndex: numbers.DEFAULT_Z_INDEX,
    closeOnEsc: false,
    guardFocus: false,
    returnFocusOnClose: false,
    disableFocusListener: false,
    disableArrowKeyDown: false,
    keepDOM: false,
});

const attrs = useAttrs();

const emit = defineEmits<{
    'update:visible': [visible: boolean];
    visibleChange: [visible: boolean];
    clickOutside: [e: MouseEvent];
    escKeyDown: [e: KeyboardEvent];
}>();

const triggerWrapperRef = ref<HTMLElement | null>(null);
const portalInnerRef = ref<HTMLDivElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
// 用于“打开后自动聚焦”的 ref setter
// 注意：template 里传 ref 会被自动解包成 .value（会变成 null），因此这里使用 function ref 传递
let initialFocusNode: any = null;
const setInitialFocusRef = (node: any) => {
    initialFocusNode = node;
};

const visible = ref(false);
const transitionState = ref('');
const isInsert = ref(false);
const isPositionUpdated = ref(false);
const placement = ref<Position>(props.position || 'top');
const containerStyle = ref<Record<string, any>>({});
const displayNone = ref(false);
const id = ref(props.wrapperId || '');
const isAnimating = ref(false);

const mounted = ref(false);
const foundationRef = ref<TooltipFoundation | null>(null);
const eventHandlers = new Map<string, Array<() => void>>();
let clickOutsideCleanup: (() => void) | null = null;
const boundEventHandlers = new Map<string, Array<EventListener>>();
let portalInsertedTime = 0;
let latestMousePosition: { x: number; y: number } | null = null;
let lastMouseLeaveTime = 0;

/**
 * 获取挂载容器
 * 优先使用 props.getPopupContainer，默认为 document.body
 */
const getContainer = () => {
    const customContainer = props.getPopupContainer?.();
    return customContainer || (typeof document !== 'undefined' ? document.body : null);
};

const prefixCls = computed(() => props.prefixCls);

const isRenderFunction = computed(
    () => typeof props.content === 'function' || (props.content && (props.content as any).__v_isVNode)
);

const triggerCls = computed(() => classnames('semi-tooltip-trigger', attrs.class));

const wrapperClasses = computed(() =>
    classnames(props.className, props.wrapperClassName, {
        [`${prefixCls.value}-wrapper`]: true,
        [`${prefixCls.value}-wrapper-show`]: visible.value,
        [`${prefixCls.value}-with-arrow`]: Boolean(props.showArrow),
        [`${cssClasses.PREFIX}-animation-show`]:
            props.motion && transitionState.value === 'enter' && isPositionUpdated.value,
        [`${cssClasses.PREFIX}-animation-hide`]: props.motion && transitionState.value === 'leave',
    })
);

const portalInnerStyle = computed(() => {
    const style: Record<string, any> = {};
    if (containerStyle.value.left !== undefined) {
        style.left = `${containerStyle.value.left}px`;
    }
    if (containerStyle.value.top !== undefined) {
        style.top = `${containerStyle.value.top}px`;
    }
    if (containerStyle.value.transform) {
        style.transform = containerStyle.value.transform;
    }
    return style;
});

const wrapperStyle = computed(() => {
    const style: Record<string, any> = { ...props.style };

    if (displayNone.value) {
        style.display = 'none';
    }

    if (props.motion && isPositionUpdated.value && containerStyle.value.transformOrigin) {
        style.transformOrigin = containerStyle.value.transformOrigin;
    }

    // 注意：Dropdown/Tooltip 的基础样式本身会通过 `${prefixCls}-wrapper` / `${prefixCls}-wrapper-show`
    // 控制透明度。如果这里强制在定位完成前 opacity=0，会导致某些场景下（例如 Dropdown 基于 Tooltip）
    // 即便 visible=true 也一直不可见（用户看到“点击没反应”）。
    // 因此这里仅尊重用户显式传入的 opacity，不做额外强制。
    const userOpacity = props.style?.opacity;
    if (userOpacity !== undefined) {
        style.opacity = userOpacity;
    }

    return style;
});

// 如果 showArrow 是 VNode（自定义组件），直接使用它
// 否则使用默认的 TriangleArrow 组件
const arrowComponent = computed(() => {
    // 如果 showArrow 是 VNode（自定义组件），直接返回它
    if (props.showArrow && typeof props.showArrow !== 'boolean') {
        return props.showArrow;
    }
    // 否则使用默认的箭头组件
    const pos = placement.value;
    return pos?.includes('left') || pos?.includes('right') ? TriangleArrowVertical : TriangleArrow;
});

const arrowClasses = computed(() => {
    // 如果 showArrow 是自定义组件，不应用默认的类名
    if (props.showArrow && typeof props.showArrow !== 'boolean') {
        return undefined;
    }
    return classnames([`${prefixCls.value}-icon-arrow`]);
});

const arrowStyle = computed(() => {
    // 如果 showArrow 是自定义组件，不应用默认的样式
    if (props.showArrow && typeof props.showArrow !== 'boolean') {
        return undefined;
    }
    const bgColor = props.style?.backgroundColor;
    return {
        color: bgColor,
        fill: 'currentColor',
    };
});

const adapter: TooltipAdapter = {
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => {
        const stateMap: Record<string, any> = {
            visible: visible.value,
            isInsert: isInsert.value,
            placement: placement.value,
        };
        return stateMap[key];
    },
    getStates: () => ({
        visible: visible.value,
        isInsert: isInsert.value,
        placement: placement.value,
    }),
    setState: () => {},
    getContext: () => null,
    getContexts: () => ({}),
    getCache: () => null,
    setCache: () => {},
    getCaches: () => ({}),
    stopPropagation: (e: any) => e?.stopPropagation?.(),
    persistEvent: () => {},

    notifyVisibleChange: (isVisible: boolean) => {
        emit('update:visible', isVisible);
        emit('visibleChange', isVisible);
    },
    notifyEscKeydown: (event: KeyboardEvent) => {
        emit('escKeyDown', event);
    },
    insertPortal: (_content: any, { position: pos, ...style }: any) => {
        isInsert.value = true;
        transitionState.value = 'enter';
        containerStyle.value = { ...containerStyle.value, ...style };
        placement.value = pos;
        portalInsertedTime = Date.now();

        const delay = props.trigger === 'hover' ? 100 : 0;
        setTimeout(() => {
            adapter.on('portalInserted', null as any);
        }, delay);
    },
    removePortal: () => {
        isInsert.value = false;
        isPositionUpdated.value = false;
    },
    setDisplayNone: (display: boolean, cb?: () => void) => {
        displayNone.value = display;
        nextTick(() => cb?.());
    },
    getEventName: () => ({
        mouseEnter: 'onMouseEnter',
        mouseLeave: 'onMouseLeave',
        mouseOut: 'onMouseOut',
        mouseOver: 'onMouseOver',
        click: 'onClick',
        focus: 'onFocus',
        blur: 'onBlur',
        keydown: 'onKeyDown',
        contextMenu: 'onContextMenu',
    }),
    registerTriggerEvent: (events: Record<string, any>) => {
        foundation.setState({ triggerEventSet: events });
        nextTick(() => {
            if (triggerWrapperRef.value) {
                boundEventHandlers.forEach((handlers, eventName) => {
                    handlers.forEach((handler) => {
                        triggerWrapperRef.value?.removeEventListener(eventName, handler as EventListener);
                        // 也需要移除子元素的事件监听器
                        if (eventName === 'focus' || eventName === 'blur') {
                            const childElements = triggerWrapperRef.value?.querySelectorAll('*');
                            childElements?.forEach((child) => {
                                child.removeEventListener(eventName, handler as EventListener);
                            });
                        }
                    });
                });
                boundEventHandlers.clear();

                Object.keys(events).forEach((key) => {
                    const eventName = key.replace('on', '').toLowerCase();
                    const handler = events[key];

                    // 对于focus和blur事件，需要监听所有子元素，因为这些事件不会冒泡
                    if (eventName === 'focus' || eventName === 'blur') {
                        triggerWrapperRef.value?.addEventListener(eventName, handler, true); // 使用捕获阶段
                        // 同时监听所有子元素
                        const childElements = triggerWrapperRef.value?.querySelectorAll('*');
                        childElements?.forEach((child) => {
                            child.addEventListener(eventName, handler, true);
                        });
                    } else {
                        triggerWrapperRef.value?.addEventListener(eventName, handler);
                    }

                    if (!boundEventHandlers.has(eventName)) {
                        boundEventHandlers.set(eventName, []);
                    }
                    boundEventHandlers.get(eventName)?.push(handler);
                });
            }
        });
    },
    registerPortalEvent: () => {},
    getTriggerBounding: () => {
        if (triggerWrapperRef.value) {
            const computedStyle = window.getComputedStyle(triggerWrapperRef.value);
            if (computedStyle.display === 'contents') {
                const firstChild = triggerWrapperRef.value.children[0] as HTMLElement;
                if (firstChild) {
                    return firstChild.getBoundingClientRect();
                }
            }
            return triggerWrapperRef.value.getBoundingClientRect();
        }
        return new DOMRect();
    },
    getPopupContainerRect: () => {
        const container = getContainer();
        if (container) {
            const boundingRect = container.getBoundingClientRect();
            return {
                left: boundingRect.left,
                top: boundingRect.top,
                right: boundingRect.right,
                bottom: boundingRect.bottom,
                width: boundingRect.width,
                height: boundingRect.height,
                x: boundingRect.x,
                y: boundingRect.y,
                scrollLeft: container.scrollLeft,
                scrollTop: container.scrollTop,
                scrollHeight: container.scrollHeight,
                scrollWidth: container.scrollWidth,
            };
        }
        return null;
    },
    containerIsBody: () => typeof document !== 'undefined' && getContainer() === document.body,
    containerIsRelative: () => {
        const computedStyle = window.getComputedStyle(getContainer());
        return computedStyle.getPropertyValue('position') === 'relative';
    },
    containerIsRelativeOrAbsolute: () => {
        const computedStyle = window.getComputedStyle(getContainer());
        const position = computedStyle.getPropertyValue('position');
        return ['relative', 'absolute'].includes(position);
    },
    getWrapperBounding: () => {
        const elem = portalInnerRef.value;
        return elem?.getBoundingClientRect() || new DOMRect();
    },
    getDocumentElementBounding: (): DOMRect =>
        typeof document !== 'undefined' ? document.documentElement.getBoundingClientRect() : new DOMRect(0, 0, 0, 0),
    setPosition: ({ position: pos, ...style }: any) => {
        containerStyle.value = { ...containerStyle.value, ...style };
        placement.value = pos;
        isPositionUpdated.value = true;

        setTimeout(() => {
            adapter.on('positionUpdated', null as any);
        }, 0);
    },
    updatePlacementAttr: (pos: Position) => {
        placement.value = pos;
    },
    /**
     * 切换 Portal 的可见性
     * 处理 hover 触发时的防抖和边界情况检查
     */
    togglePortalVisible: (isVisible: boolean, cb: () => void) => {
        // 只有在打开时（isVisible: true）才需要检查 isPositionUpdated
        // 关闭时（isVisible: false）应该允许关闭，即使 isPositionUpdated 为 false
        // 这样可以避免在 Popover 刚插入但位置还未更新时，无法关闭的问题
        // 但是，如果 Popover 已经可见（visible.value: true），且位置还未更新，可能是刚插入的状态，此时不应该关闭
        if (!isVisible && props.trigger === 'hover' && !isPositionUpdated.value && visible.value) {
            return;
        }

        if (!isVisible && props.trigger === 'hover') {
            const trigger = triggerWrapperRef.value;
            if (trigger) {
                const timeSinceInsert = Date.now() - portalInsertedTime;
                const isTriggerHover = trigger.matches?.(':hover');
                const isMouseInRange = timeSinceInsert < 300;

                // 如果 trigger 仍然处于 hover 状态，或者时间太短（可能是误触发），保持打开
                if (isMouseInRange || isTriggerHover) {
                    return;
                }

                // 检查鼠标是否在当前 Popover 的 portal 或 trigger 中
                // 如果鼠标还在 Popover 相关区域，不应该关闭
                if (latestMousePosition) {
                    const currentPortal = portalInnerRef.value;
                    const currentTrigger = triggerWrapperRef.value;

                    // 首先检查鼠标是否在 portal 的 rect 范围内（即使不在 DOM 中）
                    // 这可以处理从 trigger 移动到 Popover 内容时中间有间隙的情况
                    if (currentPortal) {
                        const rect = (currentPortal as HTMLElement).getBoundingClientRect();
                        const tolerance = 10;
                        const isMouseInRect =
                            latestMousePosition.x >= rect.left - tolerance &&
                            latestMousePosition.x <= rect.right + tolerance &&
                            latestMousePosition.y >= rect.top - tolerance &&
                            latestMousePosition.y <= rect.bottom + tolerance;

                        if (isMouseInRect) {
                            return;
                        }
                    }

                    // 然后检查鼠标是否在 portal 的 DOM 中
                    const elementUnderMouse =
                        typeof document !== 'undefined'
                            ? (document.elementFromPoint(latestMousePosition.x, latestMousePosition.y) as HTMLElement)
                            : null;
                    if (elementUnderMouse) {
                        // 如果鼠标在当前 Popover 的 portal 中，保持打开
                        if (currentPortal && currentPortal.contains(elementUnderMouse)) {
                            return;
                        }

                        // 如果鼠标在当前 trigger 中，且 trigger 处于 hover 状态，保持打开
                        if (currentTrigger && currentTrigger.contains(elementUnderMouse) && isTriggerHover) {
                            return;
                        }
                    }
                }
            }
        }

        transitionState.value = isVisible ? 'enter' : 'leave';
        visible.value = isVisible;

        if (!isVisible && !props.motion) {
            nextTick(() => {
                if (props.keepDOM) {
                    foundation.setDisplayNone(true);
                } else {
                    foundation.removePortal();
                }
                foundation.unBindEvent();
                props.afterClose?.();
                cb?.();
            });
        } else {
            nextTick(() => {
                cb?.();
            });
        }
    },
    registerClickOutsideHandler: (cb: () => void) => {
        if (clickOutsideCleanup) {
            clickOutsideCleanup();
            clickOutsideCleanup = null;
        }

        const handler = (e: MouseEvent) => {
            if (!mounted.value) return;

            const trigger = triggerWrapperRef.value;
            const portal = portalInnerRef.value;
            const target = e.target as HTMLElement;

            if (!portal || !isInsert.value) return;

            const timeSinceInsert = Date.now() - portalInsertedTime;
            if (timeSinceInsert < 150) return;

            const path = (e as any).composedPath?.() || [target];
            const isClickOnTrigger = trigger && (trigger.contains(target) || path.includes(trigger));

            if (isClickOnTrigger && !props.clickTriggerToHide) return;

            const isClickTriggerToHide = props.clickTriggerToHide && isClickOnTrigger;

            const allDropdownPortals =
                typeof document !== 'undefined'
                    ? document.querySelectorAll('[class*="semi-tooltip-portal-inner"]')
                    : [];
            let isClickInAnyDropdown = false;
            for (const dropdownPortal of allDropdownPortals) {
                if (dropdownPortal.contains(target) || path.includes(dropdownPortal as HTMLElement)) {
                    isClickInAnyDropdown = true;
                    break;
                }
            }

            const isClickOnDropdownTrigger = (() => {
                if (target.getAttribute('aria-haspopup') === 'true') {
                    return true;
                }
                if (target.classList.contains('semi-dropdown-item')) {
                    const hasDropdownChild = target.querySelector('[aria-haspopup="true"]');
                    if (hasDropdownChild) {
                        return true;
                    }
                }
                let current: HTMLElement | null = target.parentElement;
                while (current) {
                    if (current.getAttribute('aria-haspopup') === 'true') {
                        return true;
                    }
                    if (current.classList.contains('semi-dropdown-item')) {
                        const hasDropdownChild = current.querySelector('[aria-haspopup="true"]');
                        if (hasDropdownChild) {
                            return true;
                        }
                    }
                    current = current.parentElement;
                }
                return false;
            })();

            const isClickOutside =
                trigger &&
                !trigger.contains(target) &&
                portal &&
                !portal.contains(target) &&
                !(path.includes(portal) || path.includes(trigger)) &&
                !isClickInAnyDropdown &&
                !isClickOnDropdownTrigger;

            if (isClickOutside || isClickTriggerToHide) {
                emit('clickOutside', e);
                cb();
            }
        };

        window.addEventListener('mousedown', handler);
        clickOutsideCleanup = () => {
            window.removeEventListener('mousedown', handler);
            clickOutsideCleanup = null;
        };

        return clickOutsideCleanup;
    },
    unregisterClickOutsideHandler: () => {
        if (clickOutsideCleanup) {
            clickOutsideCleanup();
            clickOutsideCleanup = null;
        }
    },
    registerResizeHandler: (cb: () => void) => {
        const handler = () => mounted.value && cb();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    },
    unregisterResizeHandler: () => {},
    registerScrollHandler: (cb: (arg: { x: number; y: number }) => void) => {
        const handler = (e: Event) => {
            if (!mounted.value) return;
            const trigger = triggerWrapperRef.value;
            const target = e.target as HTMLElement;
            if (target.contains(trigger)) {
                cb({ x: target.scrollLeft, y: target.scrollTop });
            }
        };
        window.addEventListener('scroll', handler, true);
        return () => window.removeEventListener('scroll', handler, true);
    },
    unregisterScrollHandler: () => {},
    canMotion: () => Boolean(props.motion),
    updateContainerPosition: () => {},
    getContainerPosition: () => {
        const computedStyle = window.getComputedStyle(getContainer());
        return computedStyle.getPropertyValue('position');
    },
    getContainer: () => containerRef.value,
    getTriggerNode: () => triggerWrapperRef.value,
    getTriggerDOM: () => {
        const trigger = triggerWrapperRef.value;
        if (trigger && props.trigger === 'hover') {
            const timeSinceInsert = Date.now() - portalInsertedTime;
            const isTriggerHover = trigger.matches?.(':hover');
            const portal = portalInnerRef.value;
            const isPortalHover = portal?.matches?.(':hover');
            const isMouseInRange = timeSinceInsert < 300;

            let isInAnyDropdownPortal = false;
            let isInDropdownTrigger = false;
            if (latestMousePosition) {
                try {
                    const elementUnderMouse =
                        typeof document !== 'undefined'
                            ? (document.elementFromPoint(latestMousePosition.x, latestMousePosition.y) as HTMLElement)
                            : null;
                    if (elementUnderMouse) {
                        const allPortals =
                            typeof document !== 'undefined'
                                ? document.querySelectorAll('[class*="semi-tooltip-portal-inner"]')
                                : [];
                        for (const p of allPortals) {
                            if (p.contains(elementUnderMouse)) {
                                isInAnyDropdownPortal = true;
                                break;
                            }
                        }

                        if (!isInAnyDropdownPortal) {
                            if (trigger && (trigger.contains(elementUnderMouse) || elementUnderMouse === trigger)) {
                                if (isTriggerHover) {
                                    isInDropdownTrigger = true;
                                }
                            } else {
                                let current: HTMLElement | null = elementUnderMouse.parentElement;
                                while (current) {
                                    if (trigger && (trigger.contains(current) || current === trigger)) {
                                        if (isTriggerHover) {
                                            isInDropdownTrigger = true;
                                        }
                                        break;
                                    }
                                    current = current.parentElement;
                                }
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }

            if (isMouseInRange || isPortalHover || isTriggerHover || isInAnyDropdownPortal || isInDropdownTrigger) {
                const virtualTrigger = Object.create(Object.getPrototypeOf(trigger));
                Object.assign(virtualTrigger, trigger);
                virtualTrigger.matches = function (selector?: string) {
                    if (selector === ':hover') {
                        return true;
                    }
                    return trigger?.matches?.call(trigger, selector || '') || false;
                };
                return virtualTrigger as HTMLElement;
            }
        }
        return trigger;
    },
    getFocusableElements: () => [],
    getActiveElement: () => (typeof document !== 'undefined' ? document.activeElement : null),
    setInitialFocus: () => {
        const focusOnce = () => {
            const target: any = initialFocusNode;
            if (!target) {
                return false;
            }

            // 1) DOM 节点
            if (target instanceof HTMLElement && typeof target.focus === 'function') {
                target.focus({ preventScroll: props.preventScroll });
                return true;
            }

            // 2) 组件实例（defineExpose 暴露 focus）
            if (typeof target.focus === 'function') {
                target.focus({ preventScroll: props.preventScroll });
                return true;
            }

            // 3) 组件实例的 exposed（某些场景 focus 暴露在 $?.exposed 上）
            const exposedFocus = target?.$?.exposed?.focus;
            if (typeof exposedFocus === 'function') {
                exposedFocus({ preventScroll: props.preventScroll });
                return true;
            }

            // 4) Semi Input 暴露 inputRef：尝试聚焦内部 input DOM
            const inputEl = target?.inputRef?.value || target?.$?.exposed?.inputRef?.value;
            if (inputEl && typeof inputEl.focus === 'function') {
                inputEl.focus({ preventScroll: props.preventScroll });
                return true;
            }

            // 5) 最后兜底：从根节点里找可聚焦 input/textarea
            const rootEl: HTMLElement | null = target?.$el || null;
            const focusable = rootEl?.querySelector?.('input,textarea,[tabindex]:not([tabindex="-1"])') as any;
            if (focusable && typeof focusable.focus === 'function') {
                focusable.focus({ preventScroll: props.preventScroll });
                return true;
            }

            return false;
        };

        // portal 场景下，ref 绑定可能晚多拍：做多次延迟尝试兜底
        if (focusOnce()) {
            return;
        }
        nextTick(() => {
            if (focusOnce()) {
                return;
            }
            requestAnimationFrame(() => {
                if (focusOnce()) {
                    return;
                }
                setTimeout(() => {
                    if (focusOnce()) {
                        return;
                    }
                    setTimeout(() => {
                        focusOnce();
                    }, 120);
                }, 0);
            });
        });
    },
    on: (eventName: string, callback?: (() => void) | null) => {
        if (!eventName) return;

        if (callback) {
            if (!eventHandlers.has(eventName)) {
                eventHandlers.set(eventName, []);
            }
            eventHandlers.get(eventName)?.push(callback);
        } else {
            const handlers = eventHandlers.get(eventName);
            if (handlers) {
                [...handlers].forEach((handler) => {
                    handler();
                });
            }
        }
    },
    off: (eventName: string, callback?: () => void) => {
        if (!eventName) return;

        if (callback) {
            const handlers = eventHandlers.get(eventName);
            if (handlers) {
                const index = handlers.indexOf(callback);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        } else {
            eventHandlers.delete(eventName);
        }
    },
    setId: () => {
        id.value = getUuidShort();
    },
    getAnimatingState: () => isAnimating.value,
};

const foundation: TooltipFoundation = new TooltipFoundation(adapter);
foundationRef.value = foundation;

const createStopPropagationHandler =
    <T extends Event>(handler?: (e: T) => void) =>
    (e: T) => {
        if (props.stopPropagation) {
            e.stopPropagation();
        }
        handler?.(e);
    };

const handlePortalInnerClick = createStopPropagationHandler<MouseEvent>(() => {
    if (props.clickToHide) {
        foundation.hide();
    }
});

const handlePortalMouseDown = createStopPropagationHandler<MouseEvent>();
const handlePortalFocus = createStopPropagationHandler<FocusEvent>();
const handlePortalBlur = createStopPropagationHandler<FocusEvent>();

const handlePortalInnerKeyDown = (e: KeyboardEvent) => {
    foundation.handleContainerKeydown(e);
};

/**
 * 处理 Portal 鼠标移入事件
 * 包含防止误关闭的逻辑（检查 relatedTarget 和鼠标位置）
 */
const handlePortalMouseEnter = (e?: MouseEvent) => {
    if (props.trigger !== 'custom') {
        // 如果最近触发了 mouseLeave，且时间间隔很短（< 100ms），说明可能是误触发
        // 此时不应该清除延迟定时器，避免阻止 Popover 关闭
        const now = Date.now();
        if (lastMouseLeaveTime > 0 && now - lastMouseLeaveTime < 100) {
            return;
        }

        const currentPortal = portalInnerRef.value;
        const currentTrigger = triggerWrapperRef.value;

        // 如果 relatedTarget 不在 portal 或 trigger 中，检查鼠标当前位置是否在 portal 的 rect 范围内
        // 这可以处理从 trigger 移动到 Popover 内容时中间有间隙的情况
        if (e?.relatedTarget) {
            const relatedTarget = e.relatedTarget as HTMLElement;

            const isInPortal = currentPortal?.contains(relatedTarget);
            const isInTrigger = currentTrigger?.contains(relatedTarget);

            // 如果 relatedTarget 在 portal 或 trigger 中，直接清除延迟定时器
            if (isInPortal || isInTrigger) {
                foundation.clearDelayTimer();
                return;
            }

            // 如果 relatedTarget 不在 portal/trigger 中，检查鼠标当前位置是否在 portal 的 rect 范围内
            // 这可以处理从 trigger 移动到 Popover 内容时中间有间隙的情况
            if (e && currentPortal) {
                const rect = (currentPortal as HTMLElement).getBoundingClientRect();
                const tolerance = 10;
                const isMouseInRect =
                    e.clientX >= rect.left - tolerance &&
                    e.clientX <= rect.right + tolerance &&
                    e.clientY >= rect.top - tolerance &&
                    e.clientY <= rect.bottom + tolerance;

                if (isMouseInRect) {
                    foundation.clearDelayTimer();
                    return;
                }
            }

            // 如果 relatedTarget 不在 portal/trigger 中，且鼠标也不在 portal 的 rect 范围内
            // 说明鼠标是从外部移入的，不应该清除延迟定时器，避免误触发
            return;
        }

        // 如果没有 relatedTarget（某些浏览器可能不支持），检查鼠标当前位置
        if (e && currentPortal) {
            const rect = (currentPortal as HTMLElement).getBoundingClientRect();
            const tolerance = 10;
            const isMouseInRect =
                e.clientX >= rect.left - tolerance &&
                e.clientX <= rect.right + tolerance &&
                e.clientY >= rect.top - tolerance &&
                e.clientY <= rect.bottom + tolerance;

            if (isMouseInRect) {
                foundation.clearDelayTimer();
                return;
            }
        }

        foundation.clearDelayTimer();
    }
};

const handleDocumentMouseMove = (e: MouseEvent) => {
    latestMousePosition = { x: e.clientX, y: e.clientY };
};

/**
 * 处理 Portal 鼠标离开事件
 * 包含防止误关闭的逻辑（检查 relatedTarget）
 */
const handlePortalMouseLeave = (e?: MouseEvent) => {
    if (props.trigger !== 'custom') {
        if (e?.relatedTarget) {
            const relatedTarget = e.relatedTarget as HTMLElement;
            const currentPortal = portalInnerRef.value;
            const currentTrigger = triggerWrapperRef.value;

            // 检查 relatedTarget 是否在 portal 的 DOM 树中
            // portalInnerRef 是最外层容器，containerRef 是内部 wrapper
            // 由于 containerRef 是 portalInnerRef 的子元素，只需要检查 portalInnerRef 即可
            const isInPortal = currentPortal?.contains(relatedTarget);
            const isInTrigger = currentTrigger?.contains(relatedTarget);

            // 如果 relatedTarget 在 portal 中，说明鼠标移到了 Popover 内容区域，应该保持打开
            if (isInPortal) {
                return;
            }

            // 如果 relatedTarget 在 trigger 中，说明鼠标移回了 trigger
            // 此时需要检查鼠标当前位置是否在 Popover 的 rect 范围内
            // 这可以处理从 trigger 移动到 Popover content 的情况（如 ellipsisTrigger 模式下的 +N tag）
            if (isInTrigger) {
                if (e && currentPortal) {
                    const rect = (currentPortal as HTMLElement).getBoundingClientRect();
                    const tolerance = 10;
                    const isMouseInRect =
                        e.clientX >= rect.left - tolerance &&
                        e.clientX <= rect.right + tolerance &&
                        e.clientY >= rect.top - tolerance &&
                        e.clientY <= rect.bottom + tolerance;
                    // 只有当鼠标在 rect 范围内时，才保持打开（说明正在从 trigger 移动到 content）
                    if (isMouseInRect) {
                        return;
                    }
                }
            }
        }
        lastMouseLeaveTime = Date.now();
        foundation.delayHide();
    }
};

const handlePortalContextMenu = () => {};

const handleAnimationStart = () => {
    isAnimating.value = true;
};

const handleAnimationEnd = () => {
    if (transitionState.value === 'leave') {
        if (props.keepDOM) {
            foundation.setDisplayNone(true);
        } else {
            foundation.removePortal();
        }
        foundation.unBindEvent();
        props.afterClose?.();
    }
    isAnimating.value = false;
};

const rePosition = () => foundation?.calcPosition();
const focusTrigger = () => foundation?.focusTrigger();

const getPopupId = () => id.value;

defineExpose({
    rePosition,
    focusTrigger,
    getPopupId,
});

foundationRef.value = foundation;

onMounted(() => {
    mounted.value = true;
    if (typeof document !== 'undefined') {
        document.addEventListener('mousemove', handleDocumentMouseMove);
    }
    nextTick(() => {
        foundation.init();

        if (props.visible !== undefined && props.visible) {
            if (['hover', 'focus'].includes(props.trigger)) {
                foundation.delayShow();
            } else {
                foundation.show();
            }
        }

        setTimeout(() => {
            if (triggerWrapperRef.value) {
                try {
                    foundation.updateStateIfCursorOnTrigger(triggerWrapperRef.value);
                } catch (e) {
                    // ignore
                }
            }
        }, 10);
    });
});

onBeforeUnmount(() => {
    mounted.value = false;
    if (foundation) {
        foundation.destroy();
    }
    if (typeof document !== 'undefined') {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
    }
});

watch(
    () => props.visible,
    (newVal, oldVal) => {
        if (!foundation || !mounted.value || newVal === oldVal) {
            return;
        }

        if (newVal !== undefined) {
            if (['hover', 'focus'].includes(props.trigger)) {
                newVal ? foundation.delayShow() : foundation.delayHide();
            } else {
                newVal ? foundation.show() : foundation.hide();
            }
        } else if (oldVal !== undefined) {
            if (['hover', 'focus'].includes(props.trigger)) {
                foundation.delayHide();
            } else {
                foundation.hide();
            }
        }
    }
);

watch(
    () => props.rePosKey,
    (newVal, oldVal) => {
        if (newVal !== oldVal && foundation) {
            nextTick(() => {
                const checkWidth = () => {
                    const container = portalInnerRef.value;
                    const content = containerRef.value;
                    if (container) {
                        const containerWidth = container.getBoundingClientRect().width;
                        const contentWidth = content?.getBoundingClientRect().width || 0;
                        if (contentWidth < 10 && containerWidth < 10) {
                            setTimeout(checkWidth, 50);
                            return;
                        }
                        rePosition();
                    } else {
                        setTimeout(() => rePosition(), 100);
                    }
                };
                setTimeout(checkWidth, 50);
            });
        }
    }
);
</script>

<style scoped>
.semi-tooltip-trigger {
    display: inline-block;
}
</style>

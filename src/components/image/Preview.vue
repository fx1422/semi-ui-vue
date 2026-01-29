<template>
    <div :id="previewGroupId" :class="groupCls" :style="props.style">
        <template v-for="(child, index) in renderedChildren" :key="index">
            <component :is="child" />
        </template>
    </div>
    <PreviewInner
        ref="previewRef"
        v-bind="previewInnerProps"
        :src="finalSrcList"
        :currentIndex="state.currentIndex"
        :visible="state.visible"
    />
</template>

<script setup lang="ts">
import {
    ref,
    computed,
    watch,
    onMounted,
    onBeforeUnmount,
    onUpdated,
    nextTick,
    VNode,
    useSlots,
    Fragment,
    reactive,
    isVNode,
    Comment,
    h,
} from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/image/constants';
import PreviewFoundation from '@douyinfe/semi-foundation/image/previewFoundation';
import { PreviewProps, PreviewState } from './interface';
import { useFoundation } from '../_utils';
import { providePreviewContext } from './context';
import PreviewInner from './PreviewInner.vue';
import { isObject, isEqual, omit } from 'lodash-es';
import { getUuidShort } from '@douyinfe/semi-foundation/utils/uuid';

defineOptions({
    name: 'Preview',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<PreviewProps>(), {
    src: () => [],
    lazyLoad: true,
    lazyLoadMargin: '0px 100px 100px 0px',
    closable: true,
    maskClosable: true,
    visible: false,
    currentIndex: 0,
    defaultCurrentIndex: 0,
    defaultVisible: false,
});

const emit = defineEmits<{
    visibleChange: [visible: boolean];
    change: [index: number];
}>();

// Refs
const previewRef = ref<any>(null);
const previewObserver = ref<IntersectionObserver | null>(null);
const previewGroupId = ref<string>(getUuidShort({ prefix: 'semi-image-preview-group', length: 4 }));

// State
const state = ref<PreviewState>({
    currentIndex: props.currentIndex ?? props.defaultCurrentIndex ?? 0,
    visible: props.visible ?? props.defaultVisible ?? false,
});

const srcListInChildren = ref<string[]>([]);
const titles = ref<VNode[]>([]);
const prevChildrenKeys = ref<(string | number | symbol | null)[]>([]);

const slots = useSlots();

/**
 * 扁平化子节点，处理数组和 Fragment
 */
const flattenChildren = (children: any[]): any[] => {
    const result: any[] = [];
    for (const child of children) {
        if (!child) continue;
        if (Array.isArray(child)) {
            result.push(...flattenChildren(child));
        } else if (isVNode(child)) {
            if (child.type === Fragment) {
                // Fragment 需要展开其子节点
                if (child.children) {
                    const fragmentChildren = Array.isArray(child.children) ? child.children : [child.children];
                    result.push(...flattenChildren(fragmentChildren));
                }
            } else if (child.type !== Comment) {
                result.push(child);
            }
        }
    }
    return result;
};

/**
 * 检查是否是 Image 组件
 * 优先使用 isSemiImage 标识（与 React 版本一致，最稳定）
 */
const isImageComponent = (componentType: any): boolean => {
    if (!componentType) return false;
    // 优先检查 isSemiImage（与 React 版本的 child.type.isSemiImage 一致）
    if ((componentType as any)?.isSemiImage === true) {
        return true;
    }
    // 备用检查：组件名称
    const componentName =
        (componentType as any)?.__name || (componentType as any)?.name || (componentType as any)?.__file;
    return componentName === 'Image';
};

/**
 * 处理子组件，识别 Image 组件并收集预览信息
 * 参考 React 版本的 loopImageIndex 实现，保持逻辑一致性
 */
const processChildren = (
    children: any[],
    index: number = 0
): { children: any[]; srcList: string[]; titles: VNode[]; nextIndex: number } => {
    const processedChildren: any[] = [];
    const srcList: string[] = [];
    const titleList: VNode[] = [];
    let currentIndex = index;

    for (const child of children) {
        if (!child) {
            processedChildren.push(child);
            continue;
        }

        // 处理数组类型的子节点
        if (Array.isArray(child)) {
            const result = processChildren(child, currentIndex);
            processedChildren.push(...result.children);
            srcList.push(...result.srcList);
            titleList.push(...result.titles);
            currentIndex = result.nextIndex;
            continue;
        }

        // 处理 VNode
        if (!isVNode(child)) {
            processedChildren.push(child);
            continue;
        }

        // 处理 Fragment
        if (child.type === Fragment) {
            if (child.children) {
                const fragmentChildren = Array.isArray(child.children) ? child.children : [child.children];
                const result = processChildren(fragmentChildren, currentIndex);
                // 只有当 Fragment 有处理后的子节点时才重新创建 Fragment
                if (result.children.length > 0) {
                    processedChildren.push(h(Fragment, {}, result.children));
                    srcList.push(...result.srcList);
                    titleList.push(...result.titles);
                    currentIndex = result.nextIndex;
                } else {
                    processedChildren.push(child);
                }
            } else {
                processedChildren.push(child);
            }
            continue;
        }

        const componentType = child.type;
        const childProps = child.props || {};

        // 检查是否是 Image 组件
        if (isImageComponent(componentType)) {
            const { src, preview } = childProps;

            // 只有当 preview 不为 false 时才处理
            if (preview !== false) {
                const previewSrc = isObject(preview) ? ((preview as any).src ?? src) : src;
                if (previewSrc) {
                    srcList.push(previewSrc);
                    titleList.push((preview as any)?.previewTitle);
                }
                // 克隆 VNode 并添加 imageID（类似 React 的 cloneElement）
                const clonedChild = h(componentType as any, { ...childProps, imageID: currentIndex++ }, child.children);
                processedChildren.push(clonedChild);
            } else {
                processedChildren.push(child);
            }
            continue;
        }

        // 非 Image 组件：如果有子节点，递归处理
        if (child.children) {
            const childChildren = Array.isArray(child.children) ? child.children : [child.children];
            const result = processChildren(childChildren, currentIndex);

            // 如果子节点被处理过，需要重新创建父组件（类似 React 的 cloneElement）
            if (result.srcList.length > 0 || result.children.length !== childChildren.length) {
                const newChild = h(componentType as any, childProps, result.children);
                processedChildren.push(newChild);
                srcList.push(...result.srcList);
                titleList.push(...result.titles);
                currentIndex = result.nextIndex;
            } else {
                processedChildren.push(child);
            }
        } else {
            processedChildren.push(child);
        }
    }

    return {
        children: processedChildren,
        srcList,
        titles: titleList,
        nextIndex: currentIndex,
    };
};

const validChildren = computed(() => {
    if (!slots.default) return [];
    try {
        const children = slots.default();
        return flattenChildren(Array.isArray(children) ? children : [children]);
    } catch (e) {
        return [];
    }
});

/**
 * 获取子组件的 keys，用于判断子组件是否变化
 * 参考 React 版本的 componentDidUpdate 逻辑
 */
const getChildrenKeys = (children: any[]): (string | number | symbol | null)[] => {
    return children.map((child) => {
        if (!isVNode(child)) return null;
        return child.key ?? null;
    });
};

const renderedChildren = computed(() => {
    const children = validChildren.value;
    const result = processChildren(children, 0);

    // 更新 srcList 和 titles
    if (!isEqual(result.srcList, srcListInChildren.value)) {
        srcListInChildren.value = result.srcList;
        titles.value = result.titles;
    }

    return result.children;
});

const finalSrcList = computed(() => {
    const srcArr = Array.isArray(props.src) ? props.src : typeof props.src === 'string' ? [props.src] : [];
    return [...srcArr, ...srcListInChildren.value];
});

const groupCls = computed(() => {
    return cls(`${prefixCls}-preview-group`, props.className);
});

const adapter = {
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (states: Partial<PreviewState>, cb?: () => void) => {
        Object.assign(state.value, states);
        cb?.();
    },
    getContext: () => null,
    getContexts: () => ({}),
    getCache: () => null,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: Event) => e?.stopPropagation(),
    persistEvent: () => {},
};

const { foundation } = useFoundation(PreviewFoundation, adapter);
const handleVisibleChange = (newVisible: boolean) => {
    foundation.handleVisibleChange(newVisible);
    emit('visibleChange', newVisible);
};

const previewInnerProps = computed(() => {
    const { previewCls, previewStyle, onVisibleChange, onChange, ...restProps } = props;
    const handleVisibleChangeWrapper = (visible: boolean) => {
        handleVisibleChange(visible);
        if (onVisibleChange) {
            onVisibleChange(visible);
        }
    };
    return {
        ...restProps,
        className: previewCls,
        style: previewStyle,
        onVisibleChange: handleVisibleChangeWrapper,
        onChange: onChange,
    };
});

const handleCurrentIndexChange = (index: number) => {
    foundation.handleCurrentIndexChange(index);
    emit('change', index);
};

/**
 * 初始化或更新图片懒加载观察器
 * 参考 React 版本的 observerImages 实现
 */
const observerImages = () => {
    if (!props.lazyLoad) return;

    // 如果观察器已存在，先断开连接
    if (previewObserver.value) {
        previewObserver.value.disconnect();
    }

    // 创建新的观察器
    previewObserver.value = new IntersectionObserver(
        (entries) => {
            entries.forEach((item) => {
                const target = item.target as HTMLElement;
                const src = target.dataset?.src;
                if (item.isIntersecting && src) {
                    (target as HTMLImageElement).src = src;
                    target.removeAttribute('data-src');
                    previewObserver.value?.unobserve(target);
                }
            });
        },
        {
            root: document.querySelector(`#${previewGroupId.value}`),
            rootMargin: props.lazyLoadMargin,
        }
    );

    // 观察所有图片元素
    const allImgElements = document.querySelectorAll(`.${prefixCls}-img`);
    allImgElements.forEach((item) => previewObserver.value?.observe(item));
};

/**
 * 监听 currentIndex 变化
 * 参考 React 版本的 getDerivedStateFromProps
 * 只有当 props 中明确包含 currentIndex 时才更新（受控组件）
 *
 * 注意：Vue 3 的 props 是 Proxy 对象，'in' 操作符可以正常工作
 * 但为了更准确，我们同时检查值是否与当前状态不同
 */
watch(
    () => props.currentIndex,
    (newIndex) => {
        // 检查是否是受控组件：props 中包含 currentIndex 且值发生变化
        // 与 React 版本的 "currentIndex" in props 逻辑一致
        if (newIndex !== undefined && newIndex !== state.value.currentIndex) {
            state.value.currentIndex = newIndex;
        }
    }
);

/**
 * 监听 visible 变化
 * 参考 React 版本的 getDerivedStateFromProps
 * 只有当 props 中明确包含 visible 时才更新（受控组件）
 */
watch(
    () => props.visible,
    (newVisible) => {
        // 检查是否是受控组件：props 中包含 visible 且值发生变化
        // 与 React 版本的 "visible" in props 逻辑一致
        if (newVisible !== undefined && newVisible !== state.value.visible) {
            state.value.visible = newVisible;
        }
    }
);

const previewContextValue = reactive({
    isGroup: true,
    get previewSrc() {
        return finalSrcList.value;
    },
    get titles() {
        return titles.value;
    },
    get currentIndex() {
        return state.value.currentIndex;
    },
    get visible() {
        return state.value.visible;
    },
    get lazyLoad() {
        return props.lazyLoad;
    },
    get previewObserver() {
        return previewObserver.value;
    },
    setCurrentIndex: handleCurrentIndexChange,
    handleVisibleChange: handleVisibleChange,
    get setDownloadName() {
        return props.setDownloadName;
    },
});

providePreviewContext(previewContextValue);

onMounted(() => {
    nextTick(() => {
        // 记录初始子组件的 keys
        const children = validChildren.value;
        prevChildrenKeys.value = getChildrenKeys(children);
        observerImages();
    });
});

onUpdated(() => {
    // 参考 React 版本的 componentDidUpdate 逻辑
    // 只在懒加载启用且子组件 keys 变化时才更新观察器，避免重复观察
    if (props.lazyLoad) {
        nextTick(() => {
            const children = validChildren.value;
            const currChildrenKeys = getChildrenKeys(children);

            // 只有当子组件的 keys 发生变化时才重新观察
            if (!isEqual(prevChildrenKeys.value, currChildrenKeys)) {
                prevChildrenKeys.value = currChildrenKeys;
                observerImages();
            }
        });
    }
});

onBeforeUnmount(() => {
    if (previewObserver.value) {
        previewObserver.value.disconnect();
        previewObserver.value = null;
    }
});

defineExpose({
    previewRef,
});
</script>

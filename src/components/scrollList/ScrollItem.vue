<template>
    <div v-if="isWheelMode()" :class="wrapperCls" :style="style">
        <div :class="preShadeCls" />
        <div ref="selectorRef" :class="selectorCls" />
        <div :class="postShadeCls" />
        <div ref="wrapperRef" :class="listWrapperCls" @scroll="scrollToSelectItem">
            <ul
                ref="listRef"
                role="listbox"
                :aria-label="props['aria-label']"
                aria-multiselectable="false"
                @click="clickToSelectItem"
            >
                <li
                    v-for="(entry, i) in prependList"
                    :key="`pre_${i}`"
                    :class="{
                        [`${cssClasses.PREFIX}-item-disabled`]: entry.item.disabled,
                    }"
                    role="option"
                    :aria-disabled="entry.item.disabled"
                >
                    {{ getItemText(entry.item, entry.index) }}
                </li>
                <li
                    v-for="(item, index) in list"
                    :key="index"
                    :class="{
                        [`${cssClasses.PREFIX}-item-disabled`]: item.disabled,
                    }"
                    role="option"
                    :aria-disabled="item.disabled"
                >
                    {{ getItemText(item, index) }}
                </li>
                <li
                    v-for="(entry, i) in appendList"
                    :key="`app_${i}`"
                    :class="{
                        [`${cssClasses.PREFIX}-item-disabled`]: entry.item.disabled,
                    }"
                    role="option"
                    :aria-disabled="entry.item.disabled"
                >
                    {{ getItemText(entry.item, entry.index) }}
                </li>
            </ul>
        </div>
    </div>
    <div v-else ref="wrapperRef" :style="style" :class="normalWrapperCls">
        <ul ref="listRef" role="listbox" aria-multiselectable="false" :aria-label="props['aria-label']">
            <li
                v-for="(item, index) in list"
                :key="index"
                :class="{
                    [`${cssClasses.PREFIX}-item-sel`]: index === props.selectedIndex && !isWheelMode(),
                    [`${cssClasses.PREFIX}-item-disabled`]: item.disabled,
                }"
                role="option"
                :aria-disabled="item.disabled"
                @click="!item.disabled ? foundation.selectIndex(index, listRef) : null"
            >
                {{ getItemText(item, index) }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, type CSSProperties } from 'vue';
import classnames from 'classnames';
import { debounce, throttle } from 'lodash-es';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/scrollList/constants';
import ItemFoundation, { type ScrollItemAdapter, type Item } from '@douyinfe/semi-foundation/scrollList/itemFoundation';
import animatedScrollTo from '@douyinfe/semi-foundation/scrollList/scrollTo';
import { useBaseComponent } from '../_utils/useBaseComponent';

interface ScrollItemProps {
    mode?: string;
    cycled?: boolean;
    list?: Item[];
    selectedIndex?: number;
    transform?: (value: any, text: string) => string;
    className?: string;
    motion?: boolean | (() => void) | Record<string, any>;
    style?: CSSProperties;
    type?: string | number;
    'aria-label'?: string;
}

const props = withDefaults(defineProps<ScrollItemProps>(), {
    selectedIndex: 0,
    motion: true,
    list: () => [],
    cycled: false,
    mode: 'wheel',
});

const emit = defineEmits<{
    (e: 'select', data: Item): void;
}>();

const msPerFrame = 1000 / 60;
const wheelMode = 'wheel';

// Refs
const wrapperRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const selectorRef = ref<HTMLElement | null>(null);

// State
const prependCount = ref(0);
const appendCount = ref(0);
const selectedNode = ref<HTMLElement | null>(null);
const willSelectNode = ref<HTMLElement | null>(null);

let scrollAnimation: any = null;

// Computed
const isWheelMode = () => props.mode === wheelMode;

const wrapperCls = computed(() => classnames(`${cssClasses.PREFIX}-item-wheel`, props.className));
const normalWrapperCls = computed(() => classnames(`${cssClasses.PREFIX}-item`, props.className));
const listWrapperCls = computed(() =>
    classnames(`${cssClasses.PREFIX}-list-outer`, {
        [`${cssClasses.PREFIX}-list-outer-nocycle`]: !props.cycled,
    })
);
const selectorCls = computed(() => classnames(`${cssClasses.PREFIX}-selector`));
const preShadeCls = computed(() => classnames(`${cssClasses.PREFIX}-shade`, `${cssClasses.PREFIX}-shade-pre`));
const postShadeCls = computed(() => classnames(`${cssClasses.PREFIX}-shade`, `${cssClasses.PREFIX}-shade-post`));

const prependList = computed(() => {
    if (prependCount.value <= 0) return [];
    const result: { item: Item; index: number }[] = [];
    for (let i = 0; i < prependCount.value; i++) {
        const index = props.list.length - 1 - (i % props.list.length);
        result.unshift({ item: props.list[index], index });
    }
    return result;
});

const appendList = computed(() => {
    if (appendCount.value <= 0) return [];
    const result: { item: Item; index: number }[] = [];
    for (let i = 0; i < appendCount.value; i++) {
        const index = i % props.list.length;
        result.push({ item: props.list[index], index });
    }
    return result;
});

// Adapter
const { adapter: baseAdapter } = useBaseComponent(props, {});
const adapter: ScrollItemAdapter = {
    ...baseAdapter,
    setPrependCount: (count: number) => {
        prependCount.value = count;
    },
    setAppendCount: (count: number) => {
        appendCount.value = count;
    },
    setSelectedNode: (node: HTMLElement) => {
        willSelectNode.value = node;
    },
    isDisabledIndex: (index: number) => {
        if (props.list && props.list.length && index > -1) {
            const size = props.list.length;
            const indexInData = index % size;
            const data = props.list[indexInData];
            return data && data.disabled;
        }
        return false;
    },
    notifySelectItem: (data: Item) => {
        emit('select', data);
    },
    scrollToCenter: (node: Element, scrollWrapper?: Element, duration?: number) => {
        scrollToCenter(node as HTMLElement, scrollWrapper as HTMLElement, duration);
    },
};

const foundation = new ItemFoundation(adapter);

// Methods
const getItemText = (item: Item, index: number) => {
    const selected = index === props.selectedIndex;
    if (selected && typeof props.transform === 'function') {
        return props.transform(item.value, item.text || '');
    }
    return item.text == null ? item.value : item.text;
};

const getItmHeight = (itm: HTMLElement) => (itm && itm.offsetHeight) || numbers.DEFAULT_ITEM_HEIGHT;

const scrollToPos = (targetTop: number, duration = numbers.DEFAULT_SCROLL_DURATION) => {
    const wrapper = wrapperRef.value;
    if (!wrapper) return;

    if (duration && props.motion) {
        if (scrollAnimation) {
            scrollAnimation.destroy();
        }

        if (Math.abs(wrapper.scrollTop - targetTop) < 1) {
            if (isWheelMode()) {
                const nodeInfo = foundation.getNearestNodeInfo(listRef.value, selectorRef.value);
                if (nodeInfo && nodeInfo.nearestNode) {
                    addClassToNode(nodeInfo.nearestNode);
                }
            }
            // 如果已经到达目标位置，清除程序化滚动标志
            isProgrammaticScrolling.value = false;
        } else {
            // 开始程序化滚动，设置标志
            isProgrammaticScrolling.value = true;
            scrollAnimation = animatedScrollTo(wrapper, targetTop, duration);
            scrollAnimation.on('rest', () => {
                // 滚动动画完成，清除程序化滚动标志
                isProgrammaticScrolling.value = false;
                if (isWheelMode()) {
                    const nodeInfo = foundation.getNearestNodeInfo(listRef.value, selectorRef.value);
                    if (nodeInfo && nodeInfo.nearestNode) {
                        addClassToNode(nodeInfo.nearestNode);
                    }
                }
            });
            scrollAnimation.start();
        }
    } else {
        // 直接设置 scrollTop，也需要标记为程序化滚动
        isProgrammaticScrolling.value = true;
        wrapper.scrollTop = targetTop;
        // 使用 nextTick 确保 DOM 更新后再清除标志
        nextTick(() => {
            isProgrammaticScrolling.value = false;
            if (isWheelMode()) {
                const nodeInfo = foundation.getNearestNodeInfo(listRef.value, selectorRef.value);
                if (nodeInfo && nodeInfo.nearestNode) {
                    addClassToNode(nodeInfo.nearestNode);
                }
            }
        });
    }
};

const scrollToNode = (node: HTMLElement, duration: number) => {
    const wrapper = wrapperRef.value;
    const list = listRef.value;
    if (!wrapper || !list) return;

    const wrapperHeight = wrapper.offsetHeight;
    const itemHeight = getItmHeight(node);
    const targetTop = (node.offsetTop || (list.children.length * itemHeight) / 2) - (wrapperHeight - itemHeight) / 2;

    scrollToPos(targetTop, duration);
};

const scrollToCenter = (node: HTMLElement, scrollWrapper?: HTMLElement, duration?: number) => {
    const targetNode = node || selectedNode.value;
    const wrapper = scrollWrapper || wrapperRef.value;

    if (targetNode && wrapper && listRef.value) {
        // 在无限滚动模式下，调整列表
        if (props.cycled) {
            foundation.adjustInfiniteList(listRef.value, wrapper, targetNode);
            const prependCnt = foundation.shouldPrepend(listRef.value, wrapper);
            const appendCnt = foundation.shouldAppend(listRef.value, wrapper);
            if (prependCnt !== prependCount.value) {
                prependCount.value = prependCnt;
            }
            if (appendCnt !== false && appendCnt !== appendCount.value) {
                appendCount.value = appendCnt;
            }
            // 等待 DOM 更新后再计算滚动位置
            nextTick(() => {
                const scrollRect = wrapper.getBoundingClientRect();
                const selectedRect = targetNode.getBoundingClientRect();

                const targetTop =
                    wrapper.scrollTop +
                    (selectedRect.top - (scrollRect.top + scrollRect.height / 2 - selectedRect.height / 2));

                scrollToPos(targetTop, typeof duration === 'number' ? duration : numbers.DEFAULT_SCROLL_DURATION);
            });
        } else {
            // 非无限滚动模式，直接计算
            const scrollRect = wrapper.getBoundingClientRect();
            const selectedRect = targetNode.getBoundingClientRect();

            const targetTop =
                wrapper.scrollTop +
                (selectedRect.top - (scrollRect.top + scrollRect.height / 2 - selectedRect.height / 2));

            scrollToPos(targetTop, typeof duration === 'number' ? duration : numbers.DEFAULT_SCROLL_DURATION);
        }
    }
};

const addClassToNode = (node: HTMLElement, selectedCls = cssClasses.SELECTED) => {
    const list = listRef.value;
    if (!node || !list) return;

    const children = list.children;
    const reg = new RegExp(`\\s*${selectedCls}\\s*`, 'g');

    for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        child.className = child.className && child.className.replace(reg, ' ');
        if (!child.className.trim()) {
            child.className = '';
        }
    }

    if (node.className && node.className.trim()) {
        node.className += ` ${selectedCls}`;
    } else {
        node.className = selectedCls;
    }
};

// Event Handlers
const throttledAdjustList = throttle((_e, nearestNode) => {
    if (!wrapperRef.value || !listRef.value) return;

    foundation.adjustInfiniteList(listRef.value, wrapperRef.value, nearestNode);

    const prependCnt = foundation.shouldPrepend(listRef.value, wrapperRef.value);
    const appendCnt = foundation.shouldAppend(listRef.value, wrapperRef.value);

    if (prependCnt !== prependCount.value) {
        prependCount.value = prependCnt;
    }
    if (appendCnt !== false && appendCnt !== appendCount.value) {
        appendCount.value = appendCnt;
    }
}, msPerFrame);

// 标记是否正在执行点击选择，用于防止滚动事件覆盖点击选择
const isClickSelecting = ref(false);
// 保存点击选择的目标值，用于在 scrollToCenter 中匹配节点
const clickSelectTargetValue = ref<any>(null);
// 标记是否正在执行程序化滚动，用于防止滚动事件触发循环滚动
const isProgrammaticScrolling = ref(false);

const debouncedSelect = debounce((e, nearestNode, isFromClick = false) => {
    if (nearestNode && listRef.value) {
        // 如果不是点击选择，且正在执行点击选择，则忽略
        if (!isFromClick && isClickSelecting.value) {
            console.log('[ScrollItem] debouncedSelect ignored (click selecting)', {
                nodeText: nearestNode.textContent?.trim(),
            });
            return;
        }

        console.log('[ScrollItem] debouncedSelect called', {
            nodeText: nearestNode.textContent?.trim(),
            nodeIndex: Array.from(listRef.value.children).indexOf(nearestNode),
            cycled: props.cycled,
            listLength: listRef.value.children.length,
            isFromClick,
        });
        selectedNode.value = nearestNode;
        foundation.selectNode(nearestNode, listRef.value);

        // 如果是点击选择，设置标志，并在选择完成后清除
        if (isFromClick) {
            isClickSelecting.value = true;
            setTimeout(() => {
                isClickSelecting.value = false;
            }, msPerFrame * 4); // 等待滚动动画完成
        }
    }
}, msPerFrame * 2);

const scrollToSelectItem = (e: Event) => {
    if (!isWheelMode()) return;

    // 如果正在执行点击选择，忽略滚动触发的选择
    if (isClickSelecting.value) {
        return;
    }

    // 如果正在执行程序化滚动，忽略滚动事件触发的选择，避免循环滚动
    if (isProgrammaticScrolling.value) {
        return;
    }

    const nodeInfo = foundation.getNearestNodeInfo(listRef.value, selectorRef.value);
    if (!nodeInfo) return;

    const { nearestNode } = nodeInfo;

    console.log('[ScrollItem] scrollToSelectItem called', {
        nodeText: nearestNode?.textContent?.trim(),
        nodeIndex: nearestNode ? Array.from(listRef.value.children).indexOf(nearestNode) : -1,
        cycled: props.cycled,
        listLength: listRef.value.children.length,
    });

    if (props.cycled) {
        throttledAdjustList(e, nearestNode);
    }

    debouncedSelect(e, nearestNode, false);
};

const clickToSelectItem = (e: MouseEvent) => {
    if (e) {
        e.stopPropagation();
    }
    const { targetNode: node, infoInList, indexInList, targetIndex } = foundation.getTargetNode(e, listRef.value);

    console.log('[ScrollItem] clickToSelectItem called', {
        nodeText: node?.textContent?.trim(),
        indexInList,
        targetIndex,
        infoInList,
        cycled: props.cycled,
        listLength: listRef.value?.children.length,
        prependCount: prependCount.value,
    });

    if (node && !node.classList.contains(`${cssClasses.PREFIX}-item-disabled`)) {
        // 在无限滚动模式下，需要根据 prepend 节点数量修正数据索引
        let correctInfoInList = infoInList;
        let correctTargetValue: any = null;

        if (props.cycled && targetIndex !== undefined && targetIndex >= 0 && listRef.value) {
            // 计算正确的数据索引
            const dataLength = props.list.length;
            let actualDataIndex: number;

            if (targetIndex < prependCount.value) {
                // 这是 prepend 节点，从后往前映射
                actualDataIndex = dataLength - 1 - targetIndex;
            } else {
                // 这是数据节点或 append 节点
                actualDataIndex = (targetIndex - prependCount.value) % dataLength;
            }

            console.log('[ScrollItem] clickToSelectItem calculating index', {
                targetIndex,
                prependCount: prependCount.value,
                dataLength,
                actualDataIndex,
                expectedValue: props.list[actualDataIndex]?.value,
                nodeText: node?.textContent?.trim(),
            });

            correctInfoInList = props.list[actualDataIndex];
            correctTargetValue = correctInfoInList?.value;
        } else if (infoInList) {
            correctTargetValue = infoInList.value;
        }

        // 如果节点被禁用，则不处理
        if (correctInfoInList?.disabled) {
            return;
        }

        if (correctTargetValue !== null && correctTargetValue !== undefined) {
            // 保存点击选择的目标值
            clickSelectTargetValue.value = correctTargetValue;
            // 设置点击选择标志，防止滚动事件覆盖
            isClickSelecting.value = true;
            debouncedSelect(null, node, true); // 标记为点击选择
            // 等待滚动动画完成后清除标志
            setTimeout(() => {
                isClickSelecting.value = false;
                clickSelectTargetValue.value = null;
            }, msPerFrame * 10); // 增加等待时间，确保滚动动画完成
        }
    }
};

// Lifecycle
onMounted(() => {
    foundation.init();

    const { mode, cycled, selectedIndex } = props;

    nextTick(() => {
        if (!listRef.value) return;

        let targetNode: HTMLElement | null = null;
        if (selectedIndex > -1 && listRef.value.children.length > selectedIndex) {
            targetNode = listRef.value.children[selectedIndex] as HTMLElement;
        } else {
            targetNode = listRef.value.children[0] as HTMLElement;
        }

        if (targetNode) {
            selectedNode.value = targetNode;
            willSelectNode.value = targetNode;

            if (mode === wheelMode && cycled) {
                const prependCnt = foundation.shouldPrepend(listRef.value, wrapperRef.value);
                const appendCnt = foundation.shouldAppend(listRef.value, wrapperRef.value);
                prependCount.value = typeof prependCnt === 'number' ? prependCnt : 0;
                appendCount.value = typeof appendCnt === 'number' ? appendCnt : 0;

                nextTick(() => {
                    scrollToNode(targetNode as HTMLElement, 0);
                });
            } else {
                scrollToNode(targetNode, 0);
            }
        }
    });
});

onUnmounted(() => {
    foundation.destroy();
    throttledAdjustList.cancel();
    debouncedSelect.cancel();
    if (scrollAnimation) {
        scrollAnimation.destroy();
        scrollAnimation = null;
    }
    isProgrammaticScrolling.value = false;
    isClickSelecting.value = false;
    clickSelectTargetValue.value = null;
});

watch(
    () => props.selectedIndex,
    (newIndex, oldIndex) => {
        if (newIndex !== oldIndex) {
            nextTick(() => {
                if (!listRef.value) return;

                const items = listRef.value.querySelectorAll('li');
                const realIndex = newIndex + prependCount.value;
                if (items[realIndex]) {
                    scrollToNode(items[realIndex] as HTMLElement, numbers.DEFAULT_SCROLL_DURATION);
                }
            });
        }
    }
);

defineExpose({
    scrollToIndex: (index: number) => {
        if (!listRef.value) return;
        const items = listRef.value.querySelectorAll('li');
        const realIndex = index + prependCount.value;
        if (items[realIndex]) {
            scrollToNode(items[realIndex] as HTMLElement, numbers.DEFAULT_SCROLL_DURATION);
        }
    },
});
</script>

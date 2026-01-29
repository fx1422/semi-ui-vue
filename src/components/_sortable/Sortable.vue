<template>
    <div ref="containerRef" :class="containerCls" :style="containerStyle">
        <template v-if="hasSlot">
            <div
                v-for="(item, index) in items"
                :key="item"
                :data-id="item"
                :class="[itemCls, { [`${props.prefix}-sortable-item-active`]: activeId === item }]"
            >
                <slot :id="item" :sortable-handle="createSortableHandle()" :index="index" />
            </div>
        </template>
        <template v-else>
            <div
                v-for="item in items"
                :key="item"
                :data-id="item"
                :class="[itemCls, { [`${props.prefix}-sortable-item-active`]: activeId === item }]"
            >
                <component :is="renderItem({ id: item, sortableHandle: createSortableHandle() })" />
            </div>
        </template>
    </div>
    <Teleport v-if="useDragOverlay && activeId !== null" to="body">
        <div :class="dragOverlayCls" :style="dragOverlayStyle">
            <template v-if="hasSlot">
                <slot :id="activeId" :sortable-handle="(WrapperComponent) => WrapperComponent" :index="-1" />
            </template>
            <template v-else>
                <component :is="renderItem({ id: activeId, sortableHandle: (WrapperComponent) => WrapperComponent })" />
            </template>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, h, VNode, watch, nextTick, useSlots } from 'vue';
import SortableJS from 'sortablejs';
import cls from 'classnames';

const slots = useSlots();
const hasSlot = computed(() => Boolean(slots.default));

export interface OnSortEndProps {
    oldIndex: number;
    newIndex: number;
}

export type OnSortEnd = (props: OnSortEndProps) => void;

export interface RenderItemProps {
    id?: string | number;
    sortableHandle?: any;
    [x: string]: any;
}

export interface SortableProps {
    onSortEnd?: OnSortEnd;
    items?: any[];
    renderItem?: (props: RenderItemProps) => VNode;
    useDragOverlay?: boolean;
    container?: any;
    prefix?: string;
    dragOverlayCls?: string;
    handle?: string;
    direction?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<SortableProps>(), {
    items: () => [],
    useDragOverlay: true,
    prefix: 'semi-sortable',
    handle: undefined,
    direction: 'vertical',
});

const containerRef = ref<HTMLElement | null>(null);
const activeId = ref<string | number | null>(null);
let sortableInstance: SortableJS | null = null;

const containerCls = computed(() => {
    return `${props.prefix}-container`;
});

const containerStyle = computed(() => {
    return {};
});

const itemCls = computed(() => {
    return `${props.prefix}-item`;
});

const dragOverlayCls = computed(() => {
    return cls(props.dragOverlayCls || `${props.prefix}-drag-overlay`, {
        [`${props.prefix}-drag-overlay-active`]: activeId.value !== null,
    });
});

const dragOverlayStyle = computed(() => {
    return {
        position: 'fixed' as const,
        pointerEvents: 'none' as const,
    };
});

const createSortableHandle = () => {
    return (WrapperComponent: any) => {
        return () =>
            h(
                'span',
                { class: `${props.prefix}-handle`, style: { lineHeight: 0, cursor: 'grab', userSelect: 'none' } },
                [h(WrapperComponent)]
            );
    };
};

const initSortable = () => {
    if (!containerRef.value || !props.items.length) {
        return;
    }

    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }

    sortableInstance = new SortableJS(containerRef.value, {
        animation: 200,
        handle: props.handle,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        forceFallback: true,
        fallbackClass: 'sortable-drag',
        fallbackOnBody: true,
        fallbackTolerance: 0,
        fallbackOffset: { x: 0, y: 0 },
        swapThreshold: 0.65,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        supportPointer: false,
        invertSwap: false,
        direction: props.direction,
        onStart: (evt) => {
            const id = props.items[evt.oldIndex!];
            activeId.value = id;
        },
        onEnd: (evt) => {
            activeId.value = null;
            if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
                props.onSortEnd?.({
                    oldIndex: evt.oldIndex,
                    newIndex: evt.newIndex,
                });
            }
        },
    });
};

onMounted(() => {
    nextTick(() => {
        initSortable();
    });
});

watch(
    () => props.items,
    async (newItems, oldItems) => {
        await nextTick();
        if (newItems.length !== oldItems?.length || (!oldItems?.length && newItems.length)) {
            initSortable();
        }
    },
    { deep: true }
);

onBeforeUnmount(() => {
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
});
</script>

<style lang="scss" scoped>
.semi-sortable-container {
    position: relative;
}

.semi-sortable-item {
    position: relative;
    transition: transform 200ms cubic-bezier(0.2, 0, 0, 1) !important;
    transform-origin: center center;
    will-change: transform;
}

.semi-sortable-item.sortable-drag {
    transition: none !important;
}

.semi-sortable-item:not(.sortable-drag):not(.sortable-ghost) {
    transition: transform 200ms cubic-bezier(0.2, 0, 0, 1) !important;
    will-change: transform;
}

.semi-sortable-item.sortable-ghost {
    opacity: 0.4;
    transition:
        opacity 200ms ease-out,
        transform 200ms cubic-bezier(0.2, 0, 0, 1);
}

.semi-sortable-item.sortable-chosen {
    transform: scale(1.01);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
        transform 150ms ease-out,
        box-shadow 150ms ease-out;
}

.semi-sortable-item-active {
    opacity: 0.4;
    transition: opacity 150ms ease-out;
}

.semi-sortable-handle {
    display: inline-block;
    cursor: grab;
    transition: cursor 0.1s ease;

    &:active {
        cursor: grabbing;
    }

    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.semi-sortable-drag-overlay {
    pointer-events: none;
    z-index: 2000;
    transition: transform 0.1s ease-out;
}
</style>

<style lang="scss">
.sortable-drag {
    opacity: 0.95 !important;
    z-index: 2000 !important;
    box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(0, 0, 0, 0.05) !important;
    background-color: var(--semi-color-bg-1, #ffffff) !important;
    border-radius: 6px !important;
    pointer-events: none !important;
    position: fixed !important;
    margin: 0 !important;

    &[class*='transfer-right-item'],
    &[class*='transfer-item'],
    &[class*='panel-item'],
    &[class*='semi-transfer-item'] {
        background-color: var(--semi-color-bg-1, #ffffff) !important;
        > * {
            background-color: inherit !important;
        }
    }
}
</style>

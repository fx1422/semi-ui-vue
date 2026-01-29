<template>
    <template v-for="(notices, position) in noticesInPosition" :key="position">
        <div v-if="notices.length > 0" :class="listCls" :style="getPositionStyle(notices[0])" :placement="position">
            <CSSAnimation
                v-for="notice in notices"
                :key="notice.id"
                :motion="notice.motion !== false"
                :animationState="isRemoved(notice) ? 'leave' : 'enter'"
                :startClassName="`${prefixCls}-animation-${isRemoved(notice) ? 'hide' : 'show'}_${position}`"
                :endClassName="''"
            >
                <template #default="{ animationClassName, animationEventsNeedBind, isAnimating }">
                    <Notice
                        v-if="!(isRemoved(notice) && !isAnimating)"
                        :id="notice.id"
                        :ref="(el: any) => handleNoticeRef(el, notice)"
                        :title="notice.title"
                        :content="notice.content"
                        :type="notice.type"
                        :duration="notice.duration"
                        :icon="notice.icon"
                        :showClose="notice.showClose"
                        :onClose="notice.onClose"
                        :onCloseClick="notice.onCloseClick"
                        :onClick="notice.onClick"
                        :style="notice.style"
                        :className="classNames(notice.className, animationClassName)"
                        :theme="notice.theme"
                        :position="notice.position"
                        :direction="notice.direction"
                        :motion="notice.motion !== false"
                        v-bind="animationEventsNeedBind"
                        @animationstart="
                            (e: AnimationEvent) => {
                                animationEventsNeedBind.onAnimationstart?.();
                                notice.onAnimationStart?.(e);
                            }
                        "
                        @animationend="
                            (e: AnimationEvent) => {
                                animationEventsNeedBind.onAnimationend?.();
                                notice.onAnimationEnd?.(e);
                            }
                        "
                        @close="handleCloseWrapper"
                    />
                </template>
            </CSSAnimation>
        </div>
    </template>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/notification/constants';
import type {
    NotificationListProps,
    NotificationListState,
    NoticeInstance,
    NoticePosition,
    NoticesInPosition,
} from './interface';
import { useFoundation } from '../_utils';
import NotificationListFoundation, {
    NotificationListAdapter,
} from '@douyinfe/semi-foundation/notification/notificationListFoundation';
import Notice from './Notice.vue';
import CSSAnimation from '../_cssAnimation/index.vue';

defineOptions({
    name: 'NotificationList',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<NotificationListProps>(), {
    direction: 'ltr',
});

const prefixCls = cssClasses.NOTICE;
const noticeStorage = ref<NoticeInstance[]>([]);
const removeItemStorage = ref<NoticeInstance[]>([]);

// State
const state = ref<NotificationListState>({
    notices: [],
    removedItems: [],
    updatedItems: [],
});

// Adapter
const adapter: NotificationListAdapter = {
    getProps: () => props,
    getProp: (key: keyof NotificationListProps) => props[key],
    getState: (key: keyof NotificationListState) => state.value[key],
    getStates: () => state.value,
    setState: (newState: Partial<NotificationListState>, callback?: () => void) => {
        if (newState.notices !== undefined) {
            state.value.notices = newState.notices;
        }
        if (newState.removedItems !== undefined) {
            state.value.removedItems = newState.removedItems;
        }
        if (newState.updatedItems !== undefined) {
            state.value.updatedItems = newState.updatedItems;
        }
        callback?.();
    },
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e?: Event) => e?.stopPropagation(),
    persistEvent: () => {},
    updateNotices: (
        notices: NoticeInstance[],
        removedItems: NoticeInstance[] = [],
        updatedItems: NoticeInstance[] = []
    ) => {
        noticeStorage.value = [...notices];
        removeItemStorage.value = [...removedItems];
        state.value.notices = notices;
        state.value.removedItems = removedItems;
        state.value.updatedItems = updatedItems;
    },
    getNotices: () => noticeStorage.value,
};

const { foundation } = useFoundation(NotificationListFoundation, adapter);

// Computed - group notices by position
const noticesInPosition = computed<NoticesInPosition>(() => {
    const { notices } = state.value;
    const allNotices = Array.from(new Set([...notices, ...state.value.removedItems]));

    const noticesInPos: NoticesInPosition = {
        top: [],
        topLeft: [],
        topRight: [],
        bottom: [],
        bottomLeft: [],
        bottomRight: [],
    };

    allNotices.forEach((notice) => {
        const direction = notice.direction || props.direction || 'ltr';
        const defaultPosition: NoticePosition = direction === 'rtl' ? 'topLeft' : 'topRight';
        const position = notice.position || defaultPosition;
        noticesInPos[position].push(notice);
    });

    return noticesInPos;
});

// List class
const listCls = computed(() => {
    return classNames(cssClasses.LIST);
});

// Methods
const isRemoved = (item: NoticeInstance) => {
    return state.value.removedItems.find((removedItem) => removedItem.id === item.id) !== undefined;
};

const getPositionStyle = (notice: NoticeInstance) => {
    const style: Record<string, string | number> = {};
    ['top', 'left', 'bottom', 'right'].forEach((pos) => {
        const val = notice[pos as keyof NoticeInstance];
        if (val !== undefined && val !== null) {
            // Only process string or number values for style
            if (typeof val === 'string' || typeof val === 'number') {
                style[pos] = typeof val === 'number' ? `${val}px` : val;
            }
        }
    });
    return style;
};

const handleClose = (id?: string) => {
    if (id) {
        foundation.removeNotice(id);
    }
};

// Create a wrapper function that can handle both call signatures
const handleCloseWrapper = ((id?: string) => {
    if (id) {
        handleClose(id);
    }
}) as (() => void) & ((id: string) => void);

// Store notice refs
const noticeRefs = new Map<string, any>();

// Handle notice ref
const handleNoticeRef = (el: any, notice: NoticeInstance) => {
    if (el) {
        noticeRefs.set(notice.id || '', el);
        // If this notice is in updatedItems, restart its timer
        if (state.value.updatedItems.some((item) => item.id === notice.id)) {
            nextTick(() => {
                el?.restartCloseTimer?.();
            });
        }
    } else {
        noticeRefs.delete(notice.id || '');
    }
};

// Watch for updated items to restart timer
watch(
    () => state.value.updatedItems,
    (updatedItems) => {
        if (updatedItems.length > 0) {
            nextTick(() => {
                updatedItems.forEach((item) => {
                    const noticeRef = noticeRefs.get(item.id || '');
                    if (noticeRef) {
                        noticeRef.restartCloseTimer?.();
                    }
                });
            });
        }
    },
    { deep: true }
);

// Expose methods
defineExpose({
    has: (id: string) => foundation.has(id),
    add: (opts: NoticeInstance) => foundation.addNotice(opts),
    update: (id: string, opts: NoticeInstance) => foundation.update(id, opts),
    remove: (id: string) => foundation.removeNotice(id),
    destroyAll: () => foundation.destroyAll(),
});
</script>

<template>
    <LocaleConsumer componentName="Pagination">
        <template #default="{ locale }">
            <div v-if="size === 'small' && !shouldHide" :class="smallPaginationCls" :style="style" v-bind="restAttrs">
                <li
                    role="button"
                    :aria-disabled="prevDisabled || disabled"
                    aria-label="Previous"
                    :class="prevBtnCls"
                    x-semi-prop="prevText"
                    @click="handlePrevClick"
                >
                    <component :is="prevText" v-if="prevText" />
                    <IconChevronLeft v-else size="large" />
                </li>

                <Popover v-if="hoverShowPageSelect && !disabled" :content="renderSmallPageSelect()">
                    <div :class="pageCls">{{ currentPage }}/{{ totalPageNum }}</div>
                </Popover>
                <div v-else :class="pageCls">{{ currentPage }}/{{ totalPageNum }}</div>

                <li
                    role="button"
                    :aria-disabled="nextDisabled || disabled"
                    aria-label="Next"
                    :class="nextBtnCls"
                    x-semi-prop="nextText"
                    @click="handleNextClick"
                >
                    <component :is="nextText" v-if="nextText" />
                    <IconChevronRight v-else size="large" />
                </li>

                <div v-if="showQuickJumper" :class="quickJumpCls">
                    <span>{{ (locale as PaginationLocale).jumpTo }}</span>
                    <InputNumber
                        :value="quickJumpPage"
                        :class="`${prefixCls}-quickjump-input-number`"
                        hideButtons
                        :disabled="totalPageNum === 1 || disabled"
                        @blur="handleQuickJumpBlur"
                        @enter-press="handleQuickJumpEnterPress"
                        @change="handleQuickJumpNumberChange"
                    />
                    <span>{{ (locale as PaginationLocale).page }}</span>
                </div>
            </div>

            <ul v-else-if="!shouldHide" :class="defaultPaginationCls" :style="style" v-bind="restAttrs">
                <span v-if="showTotal" :class="`${prefixCls}-total`">
                    {{ (locale as PaginationLocale).total.replace('${total}', String(totalPageNum)) }}
                </span>

                <li
                    role="button"
                    :aria-disabled="prevDisabled || disabled"
                    aria-label="Previous"
                    :class="prevBtnCls"
                    x-semi-prop="prevText"
                    @click="handlePrevClick"
                >
                    <component :is="prevText" v-if="prevText" />
                    <IconChevronLeft v-else size="large" />
                </li>

                <template v-for="(page, i) in pageList" :key="`${page}${i}`">
                    <Popover
                        v-if="page === '...' && !disabled"
                        :rePosKey="currentPage"
                        trigger="hover"
                        :content="renderRestPageList(i < 3 ? restLeftPageList : restRightPageList)"
                        :position="popoverPosition"
                        :zIndex="popoverZIndex"
                    >
                        <li
                            :class="getPageItemCls(page)"
                            :aria-label="page === '...' ? 'More' : `Page ${page}`"
                            :aria-current="page !== '...' && currentPage === page ? 'page' : false"
                            @click="handlePageClick(page)"
                        >
                            {{ page }}
                        </li>
                    </Popover>
                    <li
                        v-else
                        :class="getPageItemCls(page)"
                        :aria-label="page === '...' ? 'More' : `Page ${page}`"
                        :aria-current="page !== '...' && currentPage === page ? 'page' : false"
                        @click="handlePageClick(page)"
                    >
                        {{ page }}
                    </li>
                </template>

                <li
                    role="button"
                    :aria-disabled="nextDisabled || disabled"
                    aria-label="Next"
                    :class="nextBtnCls"
                    x-semi-prop="nextText"
                    @click="handleNextClick"
                >
                    <component :is="nextText" v-if="nextText" />
                    <IconChevronRight v-else size="large" />
                </li>

                <div v-if="showSizeChanger" :class="`${prefixCls}-switch`">
                    <Select
                        :key="`${pageSize}${(locale as PaginationLocale).pageSize}`"
                        aria-label="Page size selector"
                        :disabled="disabled"
                        :value="pageSize"
                        :position="pageSizePopoverPosition"
                        clickToHide
                        :zIndex="popoverZIndex"
                        :dropdownClassName="`${prefixCls}-select-dropdown`"
                        @change="handlePageSizeChange as any"
                    >
                        <Option v-for="size in newPageSizeOpts" :key="size" :value="size">
                            <span>
                                {{ (locale as PaginationLocale).pageSize.replace('${pageSize}', String(size)) }}
                            </span>
                        </Option>
                    </Select>
                </div>

                <div v-if="showQuickJumper" :class="quickJumpCls">
                    <span>{{ (locale as PaginationLocale).jumpTo }}</span>
                    <InputNumber
                        :value="quickJumpPage"
                        :class="`${prefixCls}-quickjump-input-number`"
                        hideButtons
                        :disabled="totalPageNum === 1 || disabled"
                        @blur="handleQuickJumpBlur"
                        @enter-press="handleQuickJumpEnterPress"
                        @change="handleQuickJumpNumberChange"
                    />
                    <span>{{ (locale as PaginationLocale).page }}</span>
                </div>
            </ul>
        </template>
    </LocaleConsumer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useAttrs, h } from 'vue';
import classNames from 'classnames';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/pagination/constants';
import PaginationFoundation, {
    PaginationAdapter,
    AdapterPageList,
    PageList,
    KeyDownHandler,
} from '@douyinfe/semi-foundation/pagination/foundation';
import { numbers as popoverNumbers } from '@douyinfe/semi-foundation/popover/constants';
import { IconChevronLeft, IconChevronRight } from '../icons';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import Select from '../select/Select.vue';
import { Option } from '../select';
import InputNumber from '../inputNumber/InputNumber.vue';
import Popover from '../popover/Popover.vue';
import { useConfigContext } from '../configProvider/context';
import RestPageList from './RestPageList.vue';
import type { PaginationProps, PaginationLocale } from './interface';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<PaginationProps>(), {
    total: 1,
    popoverZIndex: popoverNumbers.DEFAULT_Z_INDEX,
    showTotal: false,
    pageSize: undefined,
    pageSizeOpts: () => numbers.PAGE_SIZE_OPTION as unknown as Array<number>,
    defaultCurrentPage: 1,
    size: 'default',
    showSizeChanger: false,
    className: '',
    hideOnSinglePage: false,
    showQuickJumper: false,
    disabled: false,
    popoverPosition: undefined,
});

const emit = defineEmits<{
    pageChange: [currentPage: number];
    pageSizeChange: [newPageSize: number];
    change: [currentPage: number, pageSize: number];
}>();

const attrs = useAttrs();

const configContext = useConfigContext();
const direction = computed(() => {
    const dir = configContext.direction;
    return typeof dir === 'string' ? dir : dir?.value || 'ltr';
});

const currentPage = ref(props.currentPage || props.defaultCurrentPage);
const pageSize = ref(props.pageSize || props.pageSizeOpts[0] || numbers.DEFAULT_PAGE_SIZE);
const pageList = ref<PageList>([]);
const prevDisabled = ref(false);
const nextDisabled = ref(false);
const restLeftPageList = ref<number[]>([]);
const restRightPageList = ref<number[]>([]);
const quickJumpPage = ref<string | number>('');
const total = ref(props.total);
const showTotal = ref(props.showTotal);

// 监听 props.total 的变化，更新内部的 total
watch(
    () => props.total,
    (newTotal) => {
        total.value = newTotal;
    }
);

// 监听 props.showTotal 的变化，更新内部的 showTotal
watch(
    () => props.showTotal,
    (newShowTotal) => {
        showTotal.value = newShowTotal;
    }
);

const shouldFillAllNumber = computed(() => props.size === 'small' && props.hoverShowPageSelect && !props.disabled);

const allPageNumbers = ref<number[]>(
    shouldFillAllNumber.value ? Array.from({ length: Math.ceil(total.value / pageSize.value) }, (v, i) => i + 1) : []
);

const virtualScrollTopMap = ref<Map<string, number>>(new Map());

const totalPageNum = computed(() => Math.ceil(total.value / pageSize.value));

const newPageSizeOpts = computed(() => {
    const opts = [...props.pageSizeOpts];
    if (opts.indexOf(pageSize.value) === -1) {
        const firstLargerIndex = opts.findIndex((el) => el > pageSize.value);
        opts.splice(firstLargerIndex, 0, pageSize.value);
    }
    return opts;
});

const pageSizePopoverPosition = computed(() => {
    return props.popoverPosition || 'bottomLeft';
});

const prevBtnCls = computed(() =>
    classNames({
        [`${prefixCls}-item`]: true,
        [`${prefixCls}-prev`]: true,
        [`${prefixCls}-item-disabled`]: prevDisabled.value || props.disabled,
    })
);

const nextBtnCls = computed(() =>
    classNames({
        [`${prefixCls}-item`]: true,
        [`${prefixCls}-item-disabled`]: nextDisabled.value || props.disabled,
        [`${prefixCls}-next`]: true,
    })
);

const smallPaginationCls = computed(() =>
    classNames(`${prefixCls}-small`, prefixCls, props.className, { [`${prefixCls}-disabled`]: props.disabled })
);

const defaultPaginationCls = computed(() =>
    classNames(props.className, prefixCls, { [`${prefixCls}-disabled`]: props.disabled })
);

const pageCls = computed(() =>
    classNames({
        [`${prefixCls}-item`]: true,
        [`${prefixCls}-item-small`]: true,
        [`${prefixCls}-item-all-disabled`]: props.disabled,
    })
);

const quickJumpCls = computed(() =>
    classNames({
        [`${prefixCls}-quickjump`]: true,
        [`${prefixCls}-quickjump-disabled`]: totalPageNum.value === 1 || props.disabled,
    })
);

const restAttrs = computed(() => {
    const { class: _, style: __, ...rest } = attrs;
    return rest;
});

function handleVirtualScroll(event: Event, listKey: string) {
    const target = event.target as HTMLElement;
    const newMap = new Map(virtualScrollTopMap.value);
    newMap.set(listKey, target.scrollTop);
    virtualScrollTopMap.value = newMap;
}

const adapter: PaginationAdapter = {
    getContext: () => ({}),
    getContexts: () => ({}),
    setState: () => {},
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
    setPageList: (pageListState: AdapterPageList) => {
        pageList.value = pageListState.pageList;
        restLeftPageList.value = pageListState.restLeftPageList;
        restRightPageList.value = pageListState.restRightPageList;
    },
    setDisabled: (prevIsDisabled: boolean, nextIsDisabled: boolean) => {
        prevDisabled.value = prevIsDisabled;
        nextDisabled.value = nextIsDisabled;
    },
    updateTotal: (newTotal: number) => {
        total.value = newTotal;
    },
    updatePageSize: (newPageSize: number) => {
        pageSize.value = newPageSize;
    },
    updateQuickJumpPage: (newQuickJumpPage: string | number) => {
        quickJumpPage.value = newQuickJumpPage;
    },
    updateAllPageNumbers: (newAllPageNumbers: number[]) => {
        allPageNumbers.value = newAllPageNumbers;
    },
    setCurrentPage: (pageIndex: number) => {
        currentPage.value = pageIndex;
    },
    registerKeyDownHandler: (handler: KeyDownHandler) => {
        document.addEventListener('keydown', handler);
    },
    unregisterKeyDownHandler: (handler: KeyDownHandler) => {
        document.removeEventListener('keydown', handler);
    },
    notifyPageChange: (pageIndex: number) => {
        emit('pageChange', pageIndex);
    },
    notifyPageSizeChange: (newPageSize: number) => {
        emit('pageSizeChange', newPageSize);
    },
    notifyChange: (pageIndex: number, newPageSize: number) => {
        emit('change', pageIndex, newPageSize);
    },
    getProps: () => props as any,
    getStates: () => ({
        total: total.value,
        showTotal: showTotal.value,
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        pageList: pageList.value,
        prevDisabled: prevDisabled.value,
        quickJumpPage: quickJumpPage.value,
        nextDisabled: nextDisabled.value,
        restLeftPageList: restLeftPageList.value,
        restRightPageList: restRightPageList.value,
        allPageNumbers: allPageNumbers.value,
    }),
    getState: (key: string) => {
        const states: any = {
            total: total.value,
            showTotal: showTotal.value,
            currentPage: currentPage.value,
            pageSize: pageSize.value,
            pageList: pageList.value,
            prevDisabled: prevDisabled.value,
            quickJumpPage: quickJumpPage.value,
            nextDisabled: nextDisabled.value,
            restLeftPageList: restLeftPageList.value,
            restRightPageList: restRightPageList.value,
            allPageNumbers: allPageNumbers.value,
        };
        return states[key];
    },
    getProp: (key: string) => (props as any)[key],
};

const foundation = new PaginationFoundation(adapter);

function getPageItemCls(page: number | '...') {
    return classNames(`${prefixCls}-item`, {
        [`${prefixCls}-item-active`]: currentPage.value === page,
        [`${prefixCls}-item-all-disabled`]: props.disabled,
        [`${prefixCls}-item-all-disabled-active`]: currentPage.value === page && props.disabled,
    });
}

function handlePageClick(page: number | '...') {
    if (!props.disabled) {
        foundation.goPage(page);
    }
}

function handlePrevClick() {
    if (!prevDisabled.value && !props.disabled) {
        foundation.goPrev();
    }
}

function handleNextClick() {
    if (!nextDisabled.value && !props.disabled) {
        foundation.goNext();
    }
}

function handlePageSizeChange(value: string | number) {
    foundation.changePageSize(value as number);
}

function handleQuickJumpNumberChange(value: string | number) {
    foundation.handleQuickJumpNumberChange(value);
}

function handleQuickJumpBlur() {
    foundation.handleQuickJumpBlur();
}

function handleQuickJumpEnterPress(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    foundation.handleQuickJumpEnterPress(target.value);
}

function renderRestPageList(restList: number[]) {
    const listKey = restList.length > 0 ? `list-${restList[0]}` : 'list-empty';
    return h(RestPageList, {
        restList,
        prefixCls,
        listKey,
        foundation,
        direction: direction.value,
        scrollTopMap: virtualScrollTopMap.value,
        onScroll: handleVirtualScroll,
    });
}

function renderSmallPageSelect() {
    return renderRestPageList(allPageNumbers.value);
}

onMounted(() => {
    // 初始化 foundation
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});
// 监听 props 变化，更新分页状态
watch(
    () => [props.currentPage, props.total, props.pageSize],
    (newValues, oldValues) => {
        const [newCurrentPage, newTotal, newPageSize] = newValues || [];
        const [oldCurrentPage, oldTotal, oldPageSize] = oldValues || [];

        // 首次执行时，oldValues 可能是 undefined
        const isFirstRun = oldValues === undefined;

        let pagerHasChanged = false;
        let allPageNumberNeedUpdate = false;

        if (isFirstRun || newCurrentPage !== oldCurrentPage) {
            pagerHasChanged = true;
        }

        if (isFirstRun || newTotal !== oldTotal) {
            pagerHasChanged = true;
            allPageNumberNeedUpdate = true;
        }

        if (isFirstRun || newPageSize !== oldPageSize) {
            pagerHasChanged = true;
            allPageNumberNeedUpdate = true;
        }

        if (pagerHasChanged) {
            foundation.updatePage(
                newCurrentPage || props.defaultCurrentPage || 1,
                newTotal || 0,
                newPageSize || props.pageSizeOpts[0] || 10
            );
        }

        if (allPageNumberNeedUpdate) {
            foundation.updateAllPageNumbers(newTotal || 0, newPageSize || props.pageSizeOpts[0] || 10);
        }
    },
    { immediate: true }
);

const shouldHide = computed(() => {
    return totalPageNum.value < 2 && props.hideOnSinglePage && !props.showSizeChanger;
});
</script>

<script lang="ts">
export default {
    name: 'Pagination',
};
</script>

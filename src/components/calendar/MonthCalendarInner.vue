<template>
    <div :ref="setDomRef" role="grid" :class="monthCls" :style="monthStyle" v-bind="getDataAttr()">
        <div role="presentation" :class="`${prefixCls}-sticky-top`">
            <slot name="header">
                <component :is="() => props.props.header" v-if="props.props.header" />
            </slot>
            <div :class="`${prefixCls}-header`" role="presentation">
                <div role="presentation" :class="`${prefixCls}-grid`">
                    <ul role="row" :class="`${prefixCls}-grid-row`">
                        <li
                            v-for="day in monthHeaderDays"
                            :key="`${day.weekday}-monthheader`"
                            role="columnheader"
                            :aria-label="day.weekday"
                            :class="getHeaderDayCls(day)"
                        >
                            <span>{{ day.weekday }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div role="presentation" :class="`${prefixCls}-grid-wrapper`">
            <div role="presentation" :class="`${prefixCls}-week`">
                <ul role="presentation" :class="`${prefixCls}-grid-col`">
                    <div
                        v-for="(week, weekIndex) in monthlyWeeks"
                        :key="`${weekIndex}-weekrow`"
                        :ref="(el) => weekIndex === 0 && setCellDomRef(el)"
                        role="presentation"
                        :class="`${prefixCls}-weekrow`"
                    >
                        <ul role="row" :class="`${prefixCls}-skeleton`">
                            <template v-for="day in week" :key="`${day.date}-weeksk`">
                                <template v-if="shouldRenderCollapsed(weekIndex, day)">
                                    <Popover
                                        :key="`${day.date.valueOf()}-popover`"
                                        :visible="getCardVisible(day.date)"
                                        :position="getCardPosition(day.date)"
                                        trigger="custom"
                                        @click-outside="handleClickOutside(day.date)"
                                        @visible-change="(visible: boolean) => handleVisibleChange(day.date, visible)"
                                    >
                                        <template #default>
                                            <li
                                                role="gridcell"
                                                :aria-label="day.date.toLocaleDateString()"
                                                :aria-current="day.isToday ? 'date' : false"
                                                :class="getDayCls(day)"
                                                @click="handleClick($event, [day.date])"
                                            >
                                                <slot name="dateDisplay" :date="day.date" :day="day">
                                                    <component
                                                        :is="() => props.props.renderDateDisplay(day.date)"
                                                        v-if="props.props.renderDateDisplay"
                                                    />
                                                    <template v-else>
                                                        <span v-if="day.dayString === '1'" :class="`${prefixCls}-date`">
                                                            {{ day.month }}
                                                            <span :class="`${cssClasses.PREFIX}-today-date`">
                                                                &nbsp;{{ day.dayString }}
                                                            </span>
                                                            {{ props.locale?.datestring || '' }}
                                                        </span>
                                                        <span v-else :class="`${prefixCls}-date`">
                                                            <span :class="`${cssClasses.PREFIX}-today-date`">
                                                                {{ day.dayString }}
                                                            </span>
                                                        </span>
                                                    </template>
                                                </slot>
                                                <slot
                                                    name="dateGrid"
                                                    :dateString="day.date.toString()"
                                                    :date="day.date"
                                                >
                                                    <component
                                                        :is="
                                                            () =>
                                                                props.props.dateGridRender(
                                                                    day.date.toString(),
                                                                    day.date
                                                                )
                                                        "
                                                        v-if="props.props.dateGridRender"
                                                    />
                                                </slot>
                                                <div
                                                    v-if="getRemainingText(weekIndex, day)"
                                                    :class="`${prefixCls}-event-card-wrapper`"
                                                    style="bottom: 0; cursor: pointer"
                                                    @click.stop="handleShowCard($event, day.date)"
                                                >
                                                    {{ getRemainingText(weekIndex, day) }}
                                                </div>
                                            </li>
                                        </template>
                                        <template #content>
                                            <div :class="`${prefixCls}-event-card`">
                                                <div :class="`${prefixCls}-event-card-content`">
                                                    <div :class="`${prefixCls}-event-card-header`">
                                                        <div :class="`${prefixCls}-event-card-header-info`">
                                                            <div :class="`${prefixCls}-event-card-header-info-weekday`">
                                                                {{ day.weekday }}
                                                            </div>
                                                            <div :class="`${prefixCls}-event-card-header-info-date`">
                                                                {{ day.dayString }}
                                                            </div>
                                                        </div>
                                                        <IconButton
                                                            :icon="h(IconClose)"
                                                            type="tertiary"
                                                            theme="borderless"
                                                            @click="handleCloseCard($event, day.date)"
                                                        />
                                                    </div>
                                                    <div
                                                        :class="`${prefixCls}-event-card-body`"
                                                        style="max-height: 300px; overflow-y: auto"
                                                    >
                                                        <ul :class="`${prefixCls}-event-card-list`">
                                                            <li
                                                                v-for="event in getDayEventsForCard(weekIndex, day)"
                                                                :key="event.key || `${event.start?.toString()}-event`"
                                                            >
                                                                <slot
                                                                    name="event"
                                                                    :event="event"
                                                                    :index="0"
                                                                    :weekIndex="weekIndex"
                                                                >
                                                                    <RenderVNode
                                                                        v-if="event.children"
                                                                        :vnode="event.children"
                                                                    />
                                                                </slot>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </Popover>
                                </template>
                                <template v-else>
                                    <li
                                        role="gridcell"
                                        :aria-label="day.date.toLocaleDateString()"
                                        :aria-current="day.isToday ? 'date' : false"
                                        :class="getDayCls(day)"
                                        @click="handleClick($event, [day.date])"
                                    >
                                        <slot name="dateDisplay" :date="day.date" :day="day">
                                            <component
                                                :is="() => props.props.renderDateDisplay(day.date)"
                                                v-if="props.props.renderDateDisplay"
                                            />
                                            <template v-else>
                                                <span v-if="day.dayString === '1'" :class="`${prefixCls}-date`">
                                                    {{ day.month }}
                                                    <span :class="`${cssClasses.PREFIX}-today-date`">
                                                        &nbsp;{{ day.dayString }}
                                                    </span>
                                                    {{ props.locale?.datestring || '' }}
                                                </span>
                                                <span v-else :class="`${prefixCls}-date`">
                                                    <span :class="`${cssClasses.PREFIX}-today-date`">
                                                        {{ day.dayString }}
                                                    </span>
                                                </span>
                                            </template>
                                        </slot>
                                        <slot name="dateGrid" :dateString="day.date.toString()" :date="day.date">
                                            <component
                                                :is="() => props.props.dateGridRender(day.date.toString(), day.date)"
                                                v-if="props.props.dateGridRender"
                                            />
                                        </slot>
                                    </li>
                                </template>
                            </template>
                        </ul>
                        <ul :class="`${cssClasses.PREFIX}-event-items`">
                            <li
                                v-for="(event, ind) in getWeekDisplayEvents(weekIndex)"
                                :key="event.key || `${ind}-monthevent`"
                                :class="`${cssClasses.PREFIX}-event-item ${cssClasses.PREFIX}-event-month`"
                                :style="getEventStyle(event)"
                            >
                                <slot name="event" :event="event" :index="ind" :weekIndex="weekIndex">
                                    <RenderVNode v-if="event.children" :vnode="event.children" />
                                </slot>
                            </li>
                        </ul>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, onMounted, nextTick, isVNode, defineComponent, h } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/calendar/constants';
import Popover from '../popover/Popover.vue';
import IconButton from '../iconButton/IconButton.vue';
import { IconClose } from '../icons';
import type { MonthCalendarProps } from './interface';

const RenderVNode = defineComponent({
    name: 'RenderVNode',
    props: {
        vnode: {
            type: [Object, Function],
            required: true,
        },
    },
    setup(props) {
        return () => {
            if (!props.vnode) {
                return null;
            }

            if (typeof props.vnode === 'function') {
                const result = props.vnode();
                if (isVNode(result)) {
                    return result;
                }
                if (Array.isArray(result)) {
                    return result;
                }
                return null;
            }

            if (isVNode(props.vnode)) {
                return props.vnode;
            }

            return null;
        };
    },
});

defineOptions({
    name: 'SemiMonthCalendarInner',
});

const props = defineProps<{
    locale: any;
    dateFnsLocale: any;
    monthCls: string;
    monthStyle: any;
    domRef: any;
    cellDomRef?: any;
    getDataAttr: () => any;
    props: MonthCalendarProps;
    monthHeaderDays: any[];
    monthlyWeeks: any[][];
    parsedEvents?: any;
    itemLimit?: number;
    getDayCls: (day: any) => string;
    getHeaderDayCls: (day: any) => string;
    getDayEvents: (date: Date) => any[];
    getWeekDisplayEvents?: (weekIndex: number) => any[];
    getEventStyle: (event: any) => any;
    handleClick: (e: MouseEvent, val: [Date]) => void;
    initMonthlyData: (dateFnsLocale: any) => void;
    showCard?: Record<string, [boolean] | [boolean, string]>;
    closeCard?: (e: MouseEvent, key: string) => void;
    showCardHandler?: (e: MouseEvent, key: string) => void;
    getWeekKey?: (weekIndex: number) => string;
}>();

const setDomRef = (el: HTMLDivElement | null) => {
    if (props.domRef && typeof props.domRef === 'object' && 'value' in props.domRef) {
        // eslint-disable-next-line vue/no-mutating-props
        props.domRef.value = el;
    }
};

const setCellDomRef = (el: any) => {
    if (props.cellDomRef && typeof props.cellDomRef === 'object' && 'value' in props.cellDomRef) {
        // eslint-disable-next-line vue/no-mutating-props
        props.cellDomRef.value = el;
    }
};

const prefixCls = `${cssClasses.PREFIX}-month`;

const getWeekDisplayEvents = (weekIndex: number) => {
    if (props.getWeekDisplayEvents) {
        return props.getWeekDisplayEvents(weekIndex);
    }
    return [];
};

const getWeekKey = (weekIndex: number) => {
    if (props.getWeekKey) {
        return props.getWeekKey(weekIndex);
    }
    return String(weekIndex);
};

const shouldRenderCollapsed = (weekIndex: number, day: any) => {
    const itemLimit = props.itemLimit;
    if (itemLimit === undefined || itemLimit === null || itemLimit <= 0) {
        return false;
    }
    if (!props.parsedEvents) {
        return false;
    }
    const weekKey = getWeekKey(weekIndex);
    const events = props.parsedEvents[weekKey] || props.parsedEvents[weekIndex];
    if (!events || !events.day) {
        return false;
    }
    const dayIndex = typeof day.ind === 'number' ? day.ind : parseInt(day.ind, 10);
    const dayEvents = events.day[dayIndex];
    return Boolean(dayEvents && Array.isArray(dayEvents) && dayEvents.length > itemLimit);
};

const getDayEventsForCard = (weekIndex: number, day: any) => {
    if (!props.parsedEvents) {
        return [];
    }
    const weekKey = getWeekKey(weekIndex);
    const events = props.parsedEvents[weekKey] || props.parsedEvents[weekIndex];
    if (!events || !events.day) {
        return [];
    }
    const dayIndex = typeof day.ind === 'number' ? day.ind : parseInt(day.ind, 10);
    const dayEvents = events.day[dayIndex];
    if (!dayEvents || !Array.isArray(dayEvents)) {
        return [];
    }
    return dayEvents.filter((event: any) => Boolean(event));
};

const getRemainingText = (weekIndex: number, day: any) => {
    const dayEvents = getDayEventsForCard(weekIndex, day);
    const itemLimit = props.itemLimit || 0;
    const remained = dayEvents.length - itemLimit;
    if (remained > 0 && props.locale?.remaining) {
        return props.locale.remaining.replace('${remained}', String(remained));
    }
    return '';
};

const getCardVisible = (date: Date) => {
    if (!props.showCard) {
        return false;
    }
    const key = date.toString();
    const cardState = props.showCard[key];
    return cardState && cardState[0] === true;
};

const getCardPosition = (date: Date): any => {
    if (!props.showCard) {
        return 'leftTopOver';
    }
    const key = date.toString();
    const cardState = props.showCard[key];
    if (cardState && cardState.length > 1 && typeof cardState[1] === 'string') {
        return cardState[1];
    }
    return 'leftTopOver';
};

const handleShowCard = (e: MouseEvent, date: Date) => {
    if (props.showCardHandler) {
        props.showCardHandler(e, date.toString());
    }
};

const handleCloseCard = (e: MouseEvent, date: Date) => {
    e.stopPropagation();
    if (props.closeCard) {
        props.closeCard(e, date.toString());
    }
};

const handleClickOutside = (date: Date) => {
    if (props.closeCard) {
        const e = new MouseEvent('mousedown');
        props.closeCard(e, date.toString());
    }
};

const handleVisibleChange = (date: Date, visible: boolean) => {
    if (!visible && props.closeCard) {
        const e = new MouseEvent('mousedown');
        props.closeCard(e, date.toString());
    }
};

if (props.dateFnsLocale && props.monthHeaderDays.length === 0) {
    props.initMonthlyData(props.dateFnsLocale);
}

watch(
    () => props.dateFnsLocale,
    (newLocale) => {
        if (newLocale) {
            props.initMonthlyData(newLocale);
        }
    },
    { immediate: true }
);

watch(
    () => props.props.displayValue,
    () => {
        if (props.dateFnsLocale) {
            props.initMonthlyData(props.dateFnsLocale);
        }
    }
);

onMounted(async () => {
    await nextTick();
    if (props.dateFnsLocale && props.monthHeaderDays.length === 0) {
        props.initMonthlyData(props.dateFnsLocale);
    }
});
</script>

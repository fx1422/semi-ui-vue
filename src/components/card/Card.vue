<template>
    <div :class="cardCls" :style="style" :aria-busy="loading">
        <div v-if="header || headerExtraContent || title" :style="headerStyle" :class="headerCls">
            <template v-if="header">
                <slot name="header"></slot>
            </template>
            <template v-else>
                <div :class="headerWrapperCls">
                    <div v-if="headerExtraContent" :class="`${prefixcls}-header-wrapper-extra`">
                        <slot name="headerExtraContent"></slot>
                    </div>
                    <div v-if="title" :class="titleCls">
                        <template v-if="typeof title === 'string'">
                            <TypographyTitle :heading="6" :ellipsis="{ showTooltip: true, rows: 1 }">
                                {{ title }}
                            </TypographyTitle>
                        </template>
                        <template v-else>
                            <slot name="title"></slot>
                        </template>
                    </div>
                </div>
            </template>
        </div>
        <div v-if="cover" :class="coverCls">
            <slot name="cover"></slot>
        </div>
        <div :style="bodyStyle" :class="bodyCls">
            <template v-if="loading">
                <div class="semi-skeleton-placeholder">
                    <div class="semi-skeleton-title"></div>
                    <div class="semi-skeleton-paragraph">
                        <div class="semi-skeleton-paragraph-line"></div>
                        <div class="semi-skeleton-paragraph-line"></div>
                        <div class="semi-skeleton-paragraph-line"></div>
                    </div>
                </div>
            </template>
            <template v-else>
                <slot></slot>
            </template>
            <div v-if="actions && actions.length" :class="actionsCls">
                <Space :spacing="12">
                    <div v-for="(item, idx) in actions" :key="idx" :class="actionsItemCls">
                        <component :is="item" />
                    </div>
                </Space>
            </div>
        </div>
        <div v-if="footer" :style="footerStyle" :class="footerCls">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/card/constants';
import TypographyTitle from '../typography/Title.vue';
import Space from '../space/Space.vue';
import { CardProps } from './interface';

const prefixcls = cssClasses.PREFIX;

const props = withDefaults(defineProps<CardProps>(), {
    bordered: true,
    footerLine: false,
    headerLine: true,
    loading: false,
});

const cardCls = computed(() =>
    cls(prefixcls, props.className, {
        [`${prefixcls}-bordered`]: props.bordered,
        [`${prefixcls}-shadows`]: props.shadows,
        [`${prefixcls}-shadows-${props.shadows}`]: props.shadows,
    })
);

const headerCls = computed(() =>
    cls(`${prefixcls}-header`, {
        [`${prefixcls}-header-bordered`]: props.headerLine,
    })
);

const headerWrapperCls = computed(() => cls(`${prefixcls}-header-wrapper`));

const titleCls = computed(() =>
    cls(`${prefixcls}-header-wrapper-title`, {
        [`${prefixcls}-header-wrapper-spacing`]: !!props.headerExtraContent,
    })
);

const coverCls = computed(() => cls(`${prefixcls}-cover`));

const bodyCls = computed(() => cls(`${prefixcls}-body`));

const actionsCls = computed(() => cls(`${prefixcls}-body-actions`));

const actionsItemCls = computed(() => cls(`${prefixcls}-body-actions-item`));

const footerCls = computed(() =>
    cls(`${prefixcls}-footer`, {
        [`${prefixcls}-footer-bordered`]: props.footerLine,
    })
);
</script>

<style scoped>
.semi-skeleton-placeholder {
    padding: 8px 0;
}
.semi-skeleton-title {
    width: 100%;
    height: 24px;
    background-color: #f0f0f0;
    margin-bottom: 16px;
    border-radius: 4px;
}
.semi-skeleton-paragraph {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.semi-skeleton-paragraph-line {
    width: 100%;
    height: 16px;
    background-color: #f0f0f0;
    border-radius: 4px;
}
.semi-skeleton-paragraph-line:last-child {
    width: 60%;
}
</style>

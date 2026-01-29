<template>
    <template v-if="!hidden">
        <tr v-if="layout !== 'horizontal'" :class="className" :style="style" v-bind="dataAttrs">
            <template v-if="align === 'plain'">
                <td :class="`${prefixCls}-item`" :colSpan="span || 1">
                    <span :class="keyCls">
                        <template v-if="hasItemKeySlot">
                            <slot name="itemKey"></slot>
                        </template>
                        <template v-else-if="isVNode(itemKey)">
                            <component :is="itemKey" />
                        </template>
                        <template v-else>{{ itemKey }}</template>
                        :
                    </span>
                    <span :class="valCls">
                        <slot></slot>
                    </span>
                </td>
            </template>
            <template v-else>
                <th :class="`${prefixCls}-item ${prefixCls}-item-th`">
                    <span :class="keyCls">
                        <template v-if="hasItemKeySlot">
                            <slot name="itemKey"></slot>
                        </template>
                        <template v-else-if="isVNode(itemKey)">
                            <component :is="itemKey" />
                        </template>
                        <template v-else>{{ itemKey }}</template>
                    </span>
                </th>
                <td :class="`${prefixCls}-item ${prefixCls}-item-td`" :colSpan="span ? span * 2 - 1 : 1">
                    <span :class="valCls">
                        <slot></slot>
                    </span>
                </td>
            </template>
        </tr>
        <tr v-else :class="className" :style="style" v-bind="dataAttrs">
            <template v-if="align === 'plain'">
                <td :class="`${prefixCls}-item`" :colSpan="span || 1">
                    <span :class="keyCls">
                        <template v-if="hasItemKeySlot">
                            <slot name="itemKey"></slot>
                        </template>
                        <template v-else-if="isVNode(itemKey)">
                            <component :is="itemKey" />
                        </template>
                        <template v-else>{{ itemKey }}</template>
                        :
                    </span>
                    <span :class="valCls">
                        <slot></slot>
                    </span>
                </td>
            </template>
            <template v-else>
                <th :class="`${prefixCls}-item ${prefixCls}-item-th`">
                    <span :class="keyCls">
                        <template v-if="hasItemKeySlot">
                            <slot name="itemKey"></slot>
                        </template>
                        <template v-else-if="isVNode(itemKey)">
                            <component :is="itemKey" />
                        </template>
                        <template v-else>{{ itemKey }}</template>
                    </span>
                </th>
                <td :class="`${prefixCls}-item ${prefixCls}-item-td`" :colSpan="span ? span * 2 - 1 : 1">
                    <span :class="valCls">
                        <slot></slot>
                    </span>
                </td>
            </template>
        </tr>
    </template>
</template>

<script setup lang="ts">
import { computed, isVNode, useSlots } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/descriptions/constants';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import type { DescriptionsItemProps } from './interface';
import { useDescriptionsContext } from './context';

const prefixCls = cssClasses.PREFIX;
const keyCls = `${prefixCls}-key`;
const valCls = `${prefixCls}-value`;

const props = withDefaults(defineProps<DescriptionsItemProps>(), {
    hidden: false,
});

const context = useDescriptionsContext();

const align = computed(() => context.align || 'center');
const layout = computed(() => context.layout || 'vertical');

const slots = useSlots();
const hasItemKeySlot = computed(() => !!slots.itemKey);

const dataAttrs = computed(() => {
    const { ...rest } = props;
    return getDataAttr(rest as any);
});
</script>

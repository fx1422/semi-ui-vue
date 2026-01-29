<template>
    <div :class="spinCls" :style="style">
        <div v-if="loading" :class="`${prefixCls}-wrapper`">
            <div v-if="indicator || $slots.indicator" :class="`${prefixCls}-animate`" x-semi-prop="indicator">
                <slot v-if="$slots.indicator" name="indicator"></slot>
                <component :is="() => indicator" v-else />
            </div>
            <SpinIcon v-else />
            <div v-if="tip || $slots.tip" x-semi-prop="tip">
                <slot v-if="$slots.tip" name="tip"></slot>
                <template v-else-if="isString(tip)">{{ tip }}</template>
                <component :is="() => tip" v-else />
            </div>
        </div>
        <div :class="`${prefixCls}-children`" :style="childStyle" x-semi-prop="children">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, useSlots } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/spin/constants';
import SpinIcon from './SpinIcon.vue';
import { SpinProps } from './interface';

defineOptions({
    name: 'Spin',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<SpinProps>(), {
    size: 'middle',
    spinning: true,
    delay: 0,
});

const slots = useSlots();

// 类型判断辅助函数
const isString = (val: unknown): val is string => typeof val === 'string';

// 状态管理
// Default to true to avoid undefined reactive warning
const loading = ref(props.spinning ?? true);
const delayTimer = ref<number | null>(null);

// 监听 spinning 变化
watch(
    () => props.spinning,
    (newSpinning) => {
        if (!props.delay) {
            loading.value = newSpinning;
            return;
        }

        if (newSpinning === false) {
            loading.value = false;
            if (delayTimer.value) {
                clearTimeout(delayTimer.value);
                delayTimer.value = null;
            }
        } else {
            // 延迟显示
            delayTimer.value = window.setTimeout(() => {
                loading.value = true;
            }, props.delay);
        }
    },
    { immediate: true }
);

// 清理定时器
onUnmounted(() => {
    if (delayTimer.value) {
        clearTimeout(delayTimer.value);
    }
});

// 计算样式类
const spinCls = computed(() => {
    return cls(prefixCls, props.wrapperClassName, {
        [`${prefixCls}-${props.size}`]: props.size,
        [`${prefixCls}-block`]: slots.default,
        [`${prefixCls}-hidden`]: !loading.value,
    });
});
</script>

<template>
    <div :class="classes" :style="rowStyle">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/grid/constants';
import { RowProps, Breakpoint } from './interface';
import { responsiveArray, responsiveMap, RowContextKey } from './constants';

const props = withDefaults(defineProps<RowProps>(), {
    prefixCls: cssClasses.PREFIX,
    gutter: 0,
});

const screens = ref<Partial<Record<Breakpoint, boolean>>>({
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
});

const unRegisters = ref<Array<() => void>>([]);

const registerMediaQuery = (mediaQuery: string, Fns: { match?: () => void; unmatch?: () => void }) => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    if (mediaQueryList.matches) {
        Fns.match?.();
    }
    const listener = (event: MediaQueryListEvent) => {
        if (event.matches) {
            Fns.match?.();
        } else {
            Fns.unmatch?.();
        }
    };
    mediaQueryList.addEventListener('change', listener);
    return () => {
        mediaQueryList.removeEventListener('change', listener);
    };
};

onMounted(() => {
    unRegisters.value = Object.keys(responsiveMap).map((screen) =>
        registerMediaQuery(responsiveMap[screen as Breakpoint], {
            match: () => {
                if (typeof props.gutter !== 'object') {
                    return;
                }
                screens.value = { ...screens.value, [screen]: true };
            },
            unmatch: () => {
                if (typeof props.gutter !== 'object') {
                    return;
                }
                screens.value = { ...screens.value, [screen]: false };
            },
        })
    );
});

onUnmounted(() => {
    unRegisters.value.forEach((unRegister) => unRegister());
});

const getGutter = computed<[number, number]>(() => {
    const { gutter } = props;
    const results: [number, number] = [0, 0];
    const normalizedGutter = Array.isArray(gutter) ? gutter.slice(0, 2) : [gutter, 0];

    normalizedGutter.forEach((g, index) => {
        if (typeof g === 'object') {
            for (let i = 0; i < responsiveArray.length; i++) {
                const breakpoint = responsiveArray[i];
                if (screens.value[breakpoint] && g[breakpoint] !== undefined) {
                    results[index] = g[breakpoint] as number;
                    break;
                }
            }
        } else {
            results[index] = g || 0;
        }
    });
    return results;
});

provide(RowContextKey, { gutters: getGutter });

const classes = computed(() =>
    classnames(
        {
            [`${props.prefixCls}-row`]: props.type !== 'flex',
            [`${props.prefixCls}-row-${props.type}`]: props.type,
            [`${props.prefixCls}-row-${props.type}-${props.justify}`]: props.type && props.justify,
            [`${props.prefixCls}-row-${props.type}-${props.align}`]: props.type && props.align,
        },
        props.className
    )
);

const rowStyle = computed(() => {
    const gutters = getGutter.value;
    const style = { ...props.style };
    if (gutters[0] > 0) {
        style.marginLeft = `${gutters[0] / -2}px`;
        style.marginRight = `${gutters[0] / -2}px`;
    }
    if (gutters[1] > 0) {
        style.marginTop = `${gutters[1] / -2}px`;
        style.marginBottom = `${gutters[1] / -2}px`;
    }
    return style;
});
</script>

<style scoped></style>

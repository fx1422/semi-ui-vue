<template>
    <aside :class="classString" :style="style" :aria-label="ariaLabel" :role="role">
        <div :class="`${prefixCls}-sider-children`">
            <slot></slot>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/layout/constants';
import { SiderProps, ResponsiveMap } from './interface';
import { LayoutContextKey, defaultContext } from './context';

const responsiveMap: ResponsiveMap = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 992px)',
    xl: '(min-width: 1200px)',
    xxl: '(min-width: 1600px)',
};

let siderId = 0;
const generateId = (): string => {
    siderId += 1;
    return `${cssClasses.PREFIX}-sider-${siderId}`;
};

const props = withDefaults(defineProps<SiderProps>(), {
    prefixCls: cssClasses.PREFIX,
});

const emit = defineEmits<{
    breakpoint: [screen: keyof ResponsiveMap, match: boolean];
}>();

const context = inject(LayoutContextKey, defaultContext);

const uniqueId = generateId();
const unRegisters: Array<() => void> = [];

const classString = computed(() =>
    cls(props.className, {
        [`${props.prefixCls}-sider`]: true,
    })
);

const ariaLabel = computed(() => props['aria-label']);
const role = computed(() => props['role']);

const responsiveHandler = (screen: keyof ResponsiveMap, matches: boolean) => {
    emit('breakpoint', screen, matches);
};

const registerMediaQuery = (query: string, callback: { match: () => void; unmatch: () => void }): (() => void) => {
    const mediaQuery = window.matchMedia(query);

    const listener = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
            callback.match();
        } else {
            callback.unmatch();
        }
    };

    listener(mediaQuery);

    mediaQuery.addEventListener('change', listener);

    return () => {
        mediaQuery.removeEventListener('change', listener);
    };
};

onMounted(() => {
    const { breakpoint } = props;
    if (breakpoint) {
        const matchBpt = (Object.keys(responsiveMap) as (keyof ResponsiveMap)[]).filter(
            (item) => breakpoint.indexOf(item) !== -1
        );

        const unRegs = matchBpt.map((screen) =>
            registerMediaQuery(responsiveMap[screen], {
                match: () => {
                    responsiveHandler(screen, true);
                },
                unmatch: () => {
                    responsiveHandler(screen, false);
                },
            })
        );

        unRegisters.push(...unRegs);
    }

    if (context.siderHook) {
        context.siderHook.addSider(uniqueId);
    }
});

onUnmounted(() => {
    unRegisters.forEach((unRegister) => unRegister());

    if (context.siderHook) {
        context.siderHook.removeSider(uniqueId);
    }
});
</script>

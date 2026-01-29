<template>
    <span v-if="render" :ref="forwardRef" :style="{ marginLeft: '4px', ...style }" :class="finalCls">
        <component :is="renderComponent" />
    </span>
    <span v-else :ref="forwardRef" :style="{ marginLeft: '4px', ...style }" :class="finalCls">
        <template v-if="copied">
            <component :is="successTipComponent" />
        </template>
        <Tooltip v-else :content="tooltipContent">
            <component :is="copyIconComponent" />
        </Tooltip>
    </span>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, h, type VNode } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/typography/constants';
import { noop } from 'lodash-es';
import Tooltip from '../tooltip';
import { IconCopy, IconTick } from '../icons';
import { useLocaleContext } from '../locale/context';
import isEnterPress from '@douyinfe/semi-foundation/utils/isEnterPress';
import type { CopyableConfig } from './interface';

const prefixCls = cssClasses.PREFIX;

export interface CopyableProps {
    content?: string;
    copyTip?: any;
    duration?: number;
    forwardRef?: any;
    successTip?: any;
    icon?: any;
    onCopy?: (e: MouseEvent, content: string, res: boolean) => void;
    render?: (copied: boolean, doCopy: (e: MouseEvent) => void, configs: CopyableConfig) => VNode;
    style?: Record<string, any>;
    className?: string;
}

const props = withDefaults(defineProps<CopyableProps>(), {
    content: '',
    onCopy: noop,
    duration: 3,
    style: () => ({}),
    className: '',
});

const locale = useLocaleContext();
const copied = ref(false);
let timeId: ReturnType<typeof setTimeout> | null = null;

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        } catch (e) {
            document.body.removeChild(textArea);
            return false;
        }
    } catch (err) {
        return false;
    }
};

const copy = (e: MouseEvent) => {
    const { content, duration, onCopy } = props;
    copyToClipboard(content).then((res) => {
        onCopy && onCopy(e, content, res);
        setCopied(duration);
    });
};

const setCopied = (timer: number) => {
    copied.value = true;
    if (timeId) {
        clearTimeout(timeId);
    }
    timeId = setTimeout(() => {
        resetCopied();
    }, timer * 1000);
};

const resetCopied = () => {
    if (timeId) {
        clearTimeout(timeId);
        timeId = null;
        copied.value = false;
    }
};

const renderSuccessTip = computed(() => {
    const { successTip } = props;
    if (typeof successTip !== 'undefined') {
        return successTip;
    }
    const localeData = locale && typeof locale === 'object' && 'value' in locale ? locale.value : locale;
    const typographyLocale = (localeData as any)?.Typography || {};
    const copiedText = typographyLocale.copied || '已复制';

    return h('span', [h(IconTick), copiedText]);
});

const renderCopyIcon = computed(() => {
    const { icon } = props;
    const copyProps = {
        role: 'button',
        tabIndex: 0,
        onClick: copy,
        onKeypress: (e: KeyboardEvent) => {
            if (isEnterPress(e)) {
                copy(e as any);
            }
        },
    };

    const defaultIcon = h(
        'a',
        {
            class: `${prefixCls}-action-copy-icon`,
        },
        [
            h(IconCopy, {
                onClick: copy,
                ...copyProps,
            }),
        ]
    );

    // 如果提供了自定义图标，克隆并添加事件
    if (icon && typeof icon === 'object' && 'type' in icon) {
        return h(icon, copyProps);
    }
    return defaultIcon;
});

const finalCls = computed(() => {
    return classNames(props.className, {
        [`${prefixCls}-action-copy`]: !copied.value,
        [`${prefixCls}-action-copied`]: copied.value,
    });
});

const tooltipContent = computed(() => {
    const { copyTip } = props;
    if (typeof copyTip !== 'undefined') {
        return copyTip;
    }
    const localeData = locale && typeof locale === 'object' && 'value' in locale ? locale.value : locale;
    const typographyLocale = (localeData as any)?.Typography || {};
    return typographyLocale.copy || '复制';
});

const successTipComponent = computed(() => renderSuccessTip.value);
const copyIconComponent = computed(() => renderCopyIcon.value);

const renderComponent = computed(() => {
    if (!props.render) {
        return null;
    }
    return props.render(copied.value, copy, props as CopyableConfig);
});

onBeforeUnmount(() => {
    if (timeId) {
        clearTimeout(timeId);
        timeId = null;
    }
});
</script>

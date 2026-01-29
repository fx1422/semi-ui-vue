<script lang="ts">
import { defineComponent, computed, CSSProperties, h } from 'vue';
import cls from 'classnames';

export interface IconProps {
    size?: 'inherit' | 'extra-small' | 'small' | 'default' | 'large' | 'extra-large' | number;
    spin?: boolean;
    rotate?: number;
    prefixCls?: string;
    type?: string;
}

export default defineComponent({
    name: 'Icon',
    props: {
        size: {
            type: [String, Number],
            default: 'default',
        },
        spin: {
            type: Boolean,
            default: false,
        },
        rotate: {
            type: Number,
            default: undefined,
        },
        prefixCls: {
            type: String,
            default: 'semi',
        },
        type: {
            type: String,
            default: undefined,
        },
    },
    setup(props: IconProps, { attrs, slots }) {
        const iconClasses = computed(() => {
            const { prefixCls, size, spin, type } = props;
            const isStringSize = typeof size === 'string';
            return cls(`${prefixCls}-icon`, {
                [`${prefixCls}-icon-extra-small`]: isStringSize && size === 'extra-small', // 8x8
                [`${prefixCls}-icon-small`]: isStringSize && size === 'small', // 12x12
                [`${prefixCls}-icon-default`]: isStringSize && size === 'default', // 16x16
                [`${prefixCls}-icon-large`]: isStringSize && size === 'large', // 20x20
                [`${prefixCls}-icon-extra-large`]: isStringSize && size === 'extra-large', // 24x24
                [`${prefixCls}-icon-spinning`]: spin === true,
                [`${prefixCls}-icon-${type}`]: Boolean(type),
            });
        });

        const iconStyle = computed(() => {
            const style: CSSProperties = {};
            if (Number.isSafeInteger(props.rotate)) {
                style.transform = `rotate(${props.rotate}deg)`;
            }
            if (typeof props.size === 'number') {
                style.fontSize = `${props.size}px`;
            }
            return style;
        });

        return () => {
            return h(
                'span',
                {
                    role: 'img',
                    'aria-label': props.type,
                    class: iconClasses.value,
                    style: iconStyle.value,
                    ...attrs,
                },
                slots.default?.()
            );
        };
    },
});
</script>

<style lang="scss">
.semi-icon {
    display: inline-block;
    font-style: normal;
    line-height: 0;
    text-align: center;
    text-transform: none;
    text-rendering: optimizeLegibility;
    fill: currentColor;

    svg {
        width: 1em;
        height: 1em;
        fill: currentColor;
        display: inline-block;
    }
}

.semi-icon-extra-small {
    font-size: 8px;
}

.semi-icon-small {
    font-size: 12px;
}

.semi-icon-default {
    font-size: 16px;
}

.semi-icon-large {
    font-size: 20px;
}

.semi-icon-extra-large {
    font-size: 24px;
}

.semi-icon-spinning {
    animation: semi-icon-spin 1s linear infinite;
}

@keyframes semi-icon-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>

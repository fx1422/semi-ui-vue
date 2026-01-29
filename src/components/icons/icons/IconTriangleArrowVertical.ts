import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconTriangleArrowVerticalSvg',
    setup() {
        return () =>
            h('svg', {
                viewBox: '0 0 24 24',
                fill: 'none',
                xmlns: 'http://www.w3.org/2000/svg',
                width: '1em',
                height: '1em',
                focusable: false,
                'aria-hidden': true,
                innerHTML:
                    '<path d="M9 0H10C10 4 11 5.5 13 7.5C15 9.5 16 10 16 12C16 14 15 14.5 13 16.5C11 18.5 10 20 10 24H9V0Z" fill="currentColor"/>',
            });
    },
});

const IconTriangleArrowVertical = defineComponent({
    name: 'IconTriangleArrowVertical',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'triangle-arrow-vertical',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconTriangleArrowVertical;

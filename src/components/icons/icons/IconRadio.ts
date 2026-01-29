import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconRadioSvg',
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
                innerHTML: '<circle cx="12" cy="12" r="5" fill="currentColor"/>',
            });
    },
});

const IconRadio = defineComponent({
    name: 'IconRadio',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'radio',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconRadio;

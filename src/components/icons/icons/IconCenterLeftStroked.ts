import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconCenterLeftStrokedSvg',
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
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M4 3C4 2.44772 3.55229 2 3 2C2.44772 2 2 2.44772 2 3V21C2 21.5523 2.44772 22 3 22C3.55228 22 4 21.5523 4 21L4 3ZM11 6C10.4477 6 10 6.44772 10 7V17C10 17.5523 10.4477 18 11 18H21C21.5523 18 22 17.5523 22 17V7C22 6.44772 21.5523 6 21 6H11ZM12 16V8H20V16H12Z" fill="currentColor"/>',
            });
    },
});

const IconCenterLeftStroked = defineComponent({
    name: 'IconCenterLeftStroked',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'center-left-stroked',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconCenterLeftStroked;

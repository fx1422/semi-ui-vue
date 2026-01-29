import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconCenterRightStrokedSvg',
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
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M22 3C22 2.44772 21.5523 2 21 2C20.4477 2 20 2.44772 20 3V21C20 21.5523 20.4477 22 21 22C21.5523 22 22 21.5523 22 21V3ZM3 6C2.44772 6 2 6.44772 2 7V17C2 17.5523 2.44772 18 3 18H13C13.5523 18 14 17.5523 14 17V7C14 6.44772 13.5523 6 13 6H3ZM4 16V8H12V16H4Z" fill="currentColor"/>',
            });
    },
});

const IconCenterRightStroked = defineComponent({
    name: 'IconCenterRightStroked',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'center-right-stroked',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconCenterRightStroked;

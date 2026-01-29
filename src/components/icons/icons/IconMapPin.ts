import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconMapPinSvg',
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
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 23C14 23 21 15.4183 21 10C21 4.58172 17.4183 1 12 1C6.58172 1 3 4.58172 3 10C3 15.4183 10 23 12 23ZM12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z" fill="currentColor"/>',
            });
    },
});

const IconMapPin = defineComponent({
    name: 'IconMapPin',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'map-pin',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconMapPin;

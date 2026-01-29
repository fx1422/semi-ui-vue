import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconBookmarkSvg',
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
                    '<path d="M4 21.5858V3C4 1.89543 4.89543 1 6 1H18C19.1046 1 20 1.89543 20 3V21.5858C20 22.4767 18.9229 22.9229 18.2929 22.2929L12 16L5.70711 22.2929C5.07714 22.9229 4 22.4767 4 21.5858Z" fill="currentColor"/>',
            });
    },
});

const IconBookmark = defineComponent({
    name: 'IconBookmark',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'bookmark',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconBookmark;

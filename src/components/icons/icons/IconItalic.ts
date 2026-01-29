import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconItalicSvg',
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
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M9 3.5C9 2.67157 9.67157 2 10.5 2H17.5C18.3284 2 19 2.67157 19 3.5C19 4.32843 18.3284 5 17.5 5H15.5L12 19H13.5C14.3284 19 15 19.6716 15 20.5C15 21.3284 14.3284 22 13.5 22H6.5C5.67157 22 5 21.3284 5 20.5C5 19.6716 5.67157 19 6.5 19H8.5L12 5H10.5C9.67157 5 9 4.32843 9 3.5Z" fill="currentColor"/>',
            });
    },
});

const IconItalic = defineComponent({
    name: 'IconItalic',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'italic',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconItalic;

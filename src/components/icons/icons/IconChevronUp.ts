import { defineComponent, h } from 'vue';
import Icon from '../Icon.vue';

const SvgComponent = defineComponent({
    name: 'IconChevronUpSvg',
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
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M19.637 16.4369C19.0513 17.0227 18.1015 17.0227 17.5157 16.4369L11.8589 10.7801L6.20202 16.4369C5.61623 17.0227 4.66648 17.0227 4.0807 16.4369C3.49491 15.8511 3.49491 14.9014 4.0807 14.3156L10.7982 7.59809C11.384 7.01231 12.3337 7.01231 12.9195 7.59809L19.637 14.3156C20.2228 14.9014 20.2228 15.8511 19.637 16.4369Z" fill="currentColor"/>',
            });
    },
});

const IconChevronUp = defineComponent({
    name: 'IconChevronUp',
    setup(props, { attrs }) {
        return () =>
            h(
                Icon,
                {
                    type: 'chevron-up',
                    ...attrs,
                },
                {
                    default: () => h(SvgComponent),
                }
            );
    },
});

export default IconChevronUp;

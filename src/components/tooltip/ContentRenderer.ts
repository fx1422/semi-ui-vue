import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ContentRenderer',
    props: {
        content: {
            type: [Function, Object, String],
            required: true,
        },
        initialFocusRef: {
            type: [Object, Function],
            default: null,
        },
    },
    setup(props) {
        return () => {
            if (typeof props.content === 'function') {
                return (props.content as any)({ initialFocusRef: props.initialFocusRef });
            }
            // For VNodes and other content, return as-is
            return props.content;
        };
    },
});

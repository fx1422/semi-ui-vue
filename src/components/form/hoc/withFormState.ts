import { defineComponent, h, type ComponentPublicInstance } from 'vue';
import { useFormState } from '../hooks';
import { getComponentName } from '../utils';

type ComponentConstructor<T = ComponentPublicInstance> = new (...args: any[]) => T;

export function withFormState<C extends ComponentPublicInstance>(Component: ComponentConstructor<C> | any) {
    return defineComponent({
        name: `WithFormState${getComponentName(Component)}`,
        setup(props, { attrs, slots }) {
            const formState = useFormState();
            return () => h(Component, { ...attrs, ...props, formState }, slots);
        },
    });
}

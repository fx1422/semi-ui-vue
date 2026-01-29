import { defineComponent, h, type ComponentPublicInstance } from 'vue';
import { useFormApi } from '../hooks';
import { getComponentName } from '../utils';

type ComponentConstructor<T = ComponentPublicInstance> = new (...args: any[]) => T;

export function withFormApi<C extends ComponentPublicInstance>(Component: ComponentConstructor<C> | any) {
    return defineComponent({
        name: `WithFormApi${getComponentName(Component)}`,
        setup(props, { attrs, slots }) {
            const formApi = useFormApi();
            return () => h(Component, { ...attrs, ...props, formApi }, slots);
        },
    });
}

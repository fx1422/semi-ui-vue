export {
    isValid,
    generateValidatesFromRules,
    mergeOptions,
    mergeProps,
    getDisplayName,
    transformTrigger,
    transformDefaultBooleanAPI,
} from '@douyinfe/semi-foundation/form/utils';

export { isVNode } from 'vue';

export function getComponentName(component: any): string {
    if (typeof component === 'string') {
        return component;
    }
    if (component?.name) {
        return component.name;
    }
    if (component?.__name) {
        return component.__name;
    }
    return 'Unknown';
}

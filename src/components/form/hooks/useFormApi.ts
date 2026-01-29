import { useFormApi as useFormApiContext } from '../context';
import type { BaseFormApi } from '@douyinfe/semi-foundation/form/interface';

export default function useFormApi<T extends Record<string, any> = any>(): BaseFormApi<T> {
    return useFormApiContext<T>();
}

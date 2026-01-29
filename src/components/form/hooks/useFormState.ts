import { useFormState as useFormStateContext } from '../context';
import type { FormState } from '@douyinfe/semi-foundation/form/interface';

export default function useFormState(): FormState {
    return useFormStateContext();
}

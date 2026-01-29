import { ref, type Ref } from 'vue';
import type { FieldState } from '@douyinfe/semi-foundation/form/interface';

export default function useFieldState(): Ref<FieldState | null> {
    return ref<FieldState | null>(null);
}

import { ref, type Ref } from 'vue';
import type { InternalFieldApi } from '@douyinfe/semi-foundation/form/interface';

export default function useFieldApi(): Ref<InternalFieldApi | null> {
    return ref<InternalFieldApi | null>(null);
}

import { useFormUpdater as useFormUpdaterContext } from '../context';
import type { FormUpdaterContextType } from '@douyinfe/semi-foundation/form/interface';

export default function useFormUpdater(): FormUpdaterContextType {
    return useFormUpdaterContext();
}

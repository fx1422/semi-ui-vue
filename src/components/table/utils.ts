import { strings } from '@douyinfe/semi-foundation/table/constants';
import type { SortOrder } from './interface';

export function getNextSortOrder(sortOrder: SortOrder): string {
    switch (sortOrder) {
        case strings.SORT_DIRECTIONS[0]:
            return strings.SORT_DIRECTIONS[1];
        case strings.SORT_DIRECTIONS[1]:
            return 'cancelSort';
        default:
            return strings.SORT_DIRECTIONS[0];
    }
}

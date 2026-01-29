import { InjectionKey } from 'vue';
import { TabContextValue } from './interface';

export const TabsContextKey: InjectionKey<TabContextValue> = Symbol('TabsContext');

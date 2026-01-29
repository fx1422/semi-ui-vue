import { inject, provide, InjectionKey } from 'vue';
import { PreviewContextProps } from './interface';

export const PreviewContextKey: InjectionKey<PreviewContextProps> = Symbol('PreviewContext');

export const usePreviewContext = () => {
    const context = inject(PreviewContextKey, null);
    return context;
};

export const providePreviewContext = (context: PreviewContextProps) => {
    provide(PreviewContextKey, context);
};

import type { CSSProperties } from 'vue';

export interface ComplexSearchWord {
    text: string;
    className?: string;
    style?: Record<string, string>;
}

export type SearchWord = string | ComplexSearchWord | undefined;
export type SearchWords = SearchWord[];

export interface HighlightProps {
    autoEscape?: boolean;
    caseSensitive?: boolean;
    sourceString?: string;
    searchWords?: SearchWords;
    highlightStyle?: CSSProperties;
    highlightClassName?: string;
    component?: string;
}

export interface Chunk {
    start: number;
    end: number;
    highlight: boolean;
    className?: string;
    style?: Record<string, string>;
}

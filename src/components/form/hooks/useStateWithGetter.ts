import { ref, type Ref } from 'vue';

export default function useStateWithGetter<T = any>(initial?: T): [Ref<T>, (value: T) => void, () => T] {
    const state = ref(initial) as Ref<T>;
    const set = (value: T) => {
        state.value = value;
    };
    const get = () => state.value;
    return [state, set, get];
}

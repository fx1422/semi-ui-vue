import BaseSlider from './Slider.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './slider.scss';

const Slider = createFieldEnhancer(BaseSlider, 'SemiSlider');

export type { SliderProps, Marks, HandleDotConfig, SliderState } from './interface';

export default Slider;
export { Slider };

import Steps from './Steps.vue';
import Step from './Step.vue';

// 导入样式（自动引入）
import './steps.scss';

export type {
    Status,
    Size,
    Direction,
    StepsType,
    StepProps,
    BasicStepProps,
    FillStepProps,
    NavStepProps,
    BasicStepsProps,
    FillStepsProps,
    NavStepsProps,
    StepsProps,
    BasicStepsAllProps,
    FillStepsAllProps,
    NavStepsAllProps,
} from './interface';

export { Step };
export default Steps;

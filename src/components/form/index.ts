import Form from './Form.vue';
import ArrayField from './ArrayField.vue';
import Field from './FieldWrapper.vue';
import Label from './Label.vue';
import ErrorMessage from './ErrorMessage.vue';
import Section from './Section.vue';
import Slot from './Slot.vue';
import Group from './Group.vue';

// 导入样式（自动引入）
import './form.scss';

// 只挂载辅助组件到 Form 对象上
(Form as any).Slot = Slot;
(Form as any).ErrorMessage = ErrorMessage;
(Form as any).InputGroup = Group;
(Form as any).Label = Label;
(Form as any).Section = Section;
(Form as any).ArrayField = ArrayField;
(Form as any).Field = Field;

export default Form;

// 导出核心组件
export { ArrayField, Field, Label, ErrorMessage, Section, Slot, Group };

// 导出 HOC 和 Hooks
export { withField, withFormApi, withFormState } from './hoc';
export { useFormApi, useFormState, useFieldApi, useFieldState } from './hooks';

// 导出类型
export * from './interface';

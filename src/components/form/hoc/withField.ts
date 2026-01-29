import {
    defineComponent,
    h,
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
    type ComponentPublicInstance,
    type Component,
} from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import {
    isValid,
    generateValidatesFromRules,
    mergeOptions,
    mergeProps,
    transformTrigger,
    transformDefaultBooleanAPI,
} from '@douyinfe/semi-foundation/form/utils';
import * as ObjectUtil from '@douyinfe/semi-foundation/utils/object';
import isPromise from '@douyinfe/semi-foundation/utils/isPromise';
import warning from '@douyinfe/semi-foundation/utils/warning';
import { useStateWithGetter, useFormUpdater, useArrayFieldState } from '../hooks';
import { useFormId } from '../context';
import ErrorMessage from '../ErrorMessage.vue';
import Label from '../Label.vue';
import { Col } from '../../grid';
import type { CallOpts, WithFieldOption } from '@douyinfe/semi-foundation/form/interface';
import { getComponentName } from '../utils';

const prefix = cssClasses.PREFIX;

type ComponentConstructor<T = ComponentPublicInstance> = new (...args: any[]) => T;

/**
 * 表单字段高阶组件（HOC）
 * 将普通组件包装成表单字段组件，提供值管理、验证、错误处理等功能
 *
 * @param Component - 要包装的组件
 * @param opts - 字段配置选项
 * @returns 包装后的表单字段组件
 */
export function withField<C extends ComponentPublicInstance>(
    Component: ComponentConstructor<C> | Component,
    opts?: WithFieldOption
) {
    return defineComponent({
        name: `Form${getComponentName(Component)}`,
        inheritAttrs: false,
        setup(props: any, { attrs, slots, expose: _expose }) {
            const merged = mergeProps(props);
            const field = merged.field || (attrs as any).field || props.field;
            const label = merged.label || (attrs as any).label || props.label;
            const {
                labelPosition,
                labelWidth,
                labelAlign,
                labelCol,
                wrapperCol,
                noLabel,
                noErrorMessage,
                isInInputGroup,
                initValue,
                validate,
                validateStatus,
                trigger,
                allowEmptyString,
                allowEmpty,
                emptyValue,
                rules,
                required,
                keepState,
                transform,
                name,
                fieldClassName,
                convert,
                stopValidateWithError,
                helpText,
                pure,
                rest,
            } = merged;

            const { options, shouldInject } = mergeOptions(opts, props);

            // 检查是否在 Form 上下文中
            let updater;
            let isInForm = false;
            try {
                updater = useFormUpdater();
                isInForm = updater && typeof updater.getFormProps === 'function';
            } catch (err) {
                updater = null;
                isInForm = false;
            }

            // 检查是否在 InputGroup 上下文中（InputGroup 中的组件可能不需要 field）
            let isInInputGroupContext = false;
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
                const inputGroupModule = require('../../input/context');
                const { useInputGroup } = inputGroupModule;
                const inputGroupContext = useInputGroup();
                isInInputGroupContext = !!inputGroupContext.inputGroup;
            } catch (err) {
                // 不在 InputGroup 上下文中，忽略
            }

            // 仅在以下情况警告：需要注入但未提供 field，且不在 InputGroup 中，且在 Form 中
            const fieldProvided = 'field' in merged;
            const shouldWarn = !fieldProvided && shouldInject && !isInInputGroup && !isInInputGroupContext && isInForm;
            warning(shouldWarn, "[Semi Form]: 'field' is required, please check your props of Field Component");

            if (!shouldInject) {
                return () => h(Component, { ...rest, ...attrs }, slots);
            }

            if (!updater.getFormProps) {
                warning(
                    true,
                    '[Semi Form]: Field Component must be use inside the Form, please check your dom declaration'
                );
                return () => null;
            }

            const formProps = updater.getFormProps([
                'labelPosition',
                'labelWidth',
                'labelAlign',
                'labelCol',
                'wrapperCol',
                'disabled',
                'showValidateIcon',
                'extraTextPosition',
                'stopValidateWithError',
                'trigger',
            ]);

            const currentFormId = useFormId();

            const mergeLabelPos = labelPosition || formProps.labelPosition;
            const mergeExtraPos = (rest as any)?.extraTextPosition || formProps.extraTextPosition || 'bottom';
            const mergeLabelWidth = labelWidth || formProps.labelWidth;
            const mergeLabelAlign = labelAlign || formProps.labelAlign;
            const mergeLabelCol = labelCol || formProps.labelCol;
            const mergeWrapperCol = wrapperCol || formProps.wrapperCol;
            const mergeStopValidateWithError = transformDefaultBooleanAPI(
                stopValidateWithError,
                formProps.stopValidateWithError,
                false
            );
            const mergeTrigger = transformTrigger(trigger, formProps.trigger);

            // 获取初始值：优先使用 initValue prop，否则从表单中获取
            const initValueInFormOpts = typeof field !== 'undefined' ? updater.getValue(field) : undefined;
            let initVal = typeof initValue !== 'undefined' ? initValue : initValueInFormOpts;

            // 如果在 ArrayField 中，根据 shouldUseInitValue 决定使用哪个初始值
            let arrayFieldState;
            try {
                arrayFieldState = useArrayFieldState();
                if (arrayFieldState) {
                    initVal =
                        arrayFieldState.shouldUseInitValue && typeof initValue !== 'undefined'
                            ? initValue
                            : initValueInFormOpts;
                }
            } catch (err) {
                // 不在 ArrayField 中，忽略
            }

            const [value, setValue, getVal] = useStateWithGetter(typeof initVal !== 'undefined' ? initVal : null);
            const validateOnMount = mergeTrigger.includes('mount');

            const allowEmptyValue = allowEmpty || updater.getFormProps().allowEmpty;

            const [error, setError, getError] = useStateWithGetter();
            const [touched, setTouched] = useStateWithGetter<boolean | undefined>();
            const [, setCursor] = useStateWithGetter(0);
            const status = ref(validateStatus);

            const isUnmounted = ref(false);
            const rulesRef = ref(rules);
            const validateRef = ref(validate);
            const validatePromise = ref<Promise<any> | null>(null);

            watch(
                () => rules,
                (newRules) => {
                    rulesRef.value = newRules;
                }
            );

            watch(
                () => validate,
                (newValidate) => {
                    validateRef.value = newValidate;
                }
            );

            const updateTouched = (isTouched: boolean, callOpts?: CallOpts) => {
                setTouched(isTouched);
                updater.updateStateTouched(field, isTouched, callOpts);
            };

            const updateError = (errors: any, callOpts?: CallOpts) => {
                if (isUnmounted.value) {
                    return;
                }
                if (errors === getError()) {
                    return;
                }
                setError(errors);
                updater.updateStateError(field, errors, callOpts);
                if (!isValid(errors)) {
                    status.value = 'error';
                } else {
                    status.value = 'success';
                }
            };

            const updateValue = (val: any, callOpts?: CallOpts) => {
                setValue(val);
                const newOpts = {
                    ...callOpts,
                    allowEmpty: allowEmptyValue,
                };
                updater.updateStateValue(field, val, newOpts);
            };

            /**
             * 重置字段到初始状态
             * 优先级：initVal > emptyValue > undefined
             */
            const reset = () => {
                const callOpts = {
                    notNotify: true,
                    notUpdate: true,
                };
                let finalValue: any;
                if (initVal !== null && initVal !== undefined) {
                    finalValue = initVal;
                } else if (emptyValue !== undefined) {
                    finalValue = emptyValue;
                } else {
                    finalValue = undefined;
                }
                setValue(finalValue);
                updater.updateStateValue(field, finalValue, callOpts);
                updateError(undefined, callOpts);
                updateTouched(undefined, callOpts);
                status.value = 'default';
            };

            /**
             * 内部验证：基于 rules 进行验证
             * 使用 Promise 管理验证流程，防止重复验证冲突
             */
            const _validateInternal = (val: any, callOpts: CallOpts) => {
                const latestRules = rulesRef.value || [];
                const validator = generateValidatesFromRules(field, latestRules);
                const model = {
                    [field]: val,
                };

                const rootPromise = new Promise((resolve, _reject) => {
                    validator
                        .validate(
                            model,
                            {
                                first: mergeStopValidateWithError,
                            },
                            () => {}
                        )
                        .then((_res) => {
                            // 检查验证是否已被新的验证覆盖
                            if (isUnmounted.value || validatePromise.value !== rootPromise) {
                                console.warn(
                                    `[Semi Form]: When FieldComponent (${field}) has an unfinished validation process, you repeatedly trigger a new validation, the old validation will be abandoned, and will neither resolve nor reject. Usually this is an unreasonable practice. Please check your code.`
                                );
                                return;
                            }
                            status.value = 'success';
                            updateError(undefined, callOpts);
                            resolve({});
                        })
                        .catch((err) => {
                            // 检查验证是否已被新的验证覆盖
                            if (isUnmounted.value || validatePromise.value !== rootPromise) {
                                console.warn(
                                    `[Semi Form]: When FieldComponent (${field}) has an unfinished validation process, you repeatedly trigger a new validation, the old validation will be abandoned, and will neither resolve nor reject. Usually this is an unreasonable practice. Please check your code.`
                                );
                                return;
                            }
                            const { errors, fields } = err;
                            if (errors && fields) {
                                let messages = errors.map((e: any) => e.message);
                                if (messages.length === 1) {
                                    messages = messages[0];
                                }
                                updateError(messages, callOpts);
                                if (!isValid(messages)) {
                                    status.value = 'error';
                                    resolve(errors);
                                }
                            } else {
                                status.value = 'error';
                                updateError(err.message, callOpts);
                                resolve(err.message);
                                throw err;
                            }
                        });
                });

                validatePromise.value = rootPromise;
                return rootPromise;
            };

            /**
             * 自定义验证：使用 validate 函数进行验证
             * 支持同步和异步验证函数
             */
            const _validate = (val: any, values: any, callOpts: CallOpts) => {
                const rootPromise = new Promise((resolve) => {
                    let maybePromisedErrors;
                    try {
                        maybePromisedErrors = validateRef.value?.(val, values);
                    } catch (err) {
                        maybePromisedErrors = err;
                    }
                    if (maybePromisedErrors === undefined) {
                        resolve({});
                        updateError(undefined, callOpts);
                    } else if (isPromise(maybePromisedErrors)) {
                        // 异步验证
                        maybePromisedErrors.then((result: any) => {
                            if (isUnmounted.value || validatePromise.value !== rootPromise) {
                                console.warn(
                                    `[Semi Form]: When Field: (${field}) has an unfinished validation process, you repeatedly trigger a new validation, the old validation will be abandoned, and will neither resolve nor reject. Usually this is an unreasonable practice. Please check your code.`
                                );
                                return;
                            }

                            if (isValid(result)) {
                                updateError(undefined, callOpts);
                                resolve(null);
                            } else {
                                updateError(result, callOpts);
                                resolve(result);
                            }
                        });
                    } else {
                        // 同步验证
                        if (isValid(maybePromisedErrors)) {
                            updateError(undefined, callOpts);
                            resolve(null);
                        } else {
                            updateError(maybePromisedErrors, callOpts);
                            resolve(maybePromisedErrors);
                        }
                    }
                });

                validatePromise.value = rootPromise;
                return rootPromise;
            };

            const fieldValidate = (val: any, callOpts?: CallOpts) => {
                let finalVal = val;
                const latestRules = rulesRef.value;
                if (transform) {
                    finalVal = transform(val);
                }
                if (validateRef.value) {
                    return _validate(finalVal, updater.getValue(), callOpts);
                } else if (latestRules) {
                    return _validateInternal(finalVal, callOpts);
                }
                return null;
            };

            /**
             * 处理字段值变化
             * 支持多种值来源：事件对象、直接值、通过 valuePath 获取嵌套值
             */
            const handleChange = (newValue: any, e: any, ...other: any[]) => {
                // 调用用户自定义的 onChange 处理函数
                const fnKey = options.onKeyChangeFnName;
                if (fnKey && fnKey in props && typeof (props as any)[fnKey] === 'function') {
                    (props as any)[fnKey](newValue, e, ...other);
                }

                // 从事件对象或直接值中提取实际值
                // 优先级：newValue.target.value > e.target.value > newValue > valuePath
                let val;
                if (
                    newValue &&
                    typeof newValue === 'object' &&
                    newValue.target &&
                    typeof newValue.target.value !== 'undefined' &&
                    !options.valuePath
                ) {
                    val = newValue.target.value;
                } else if (
                    e &&
                    e.target &&
                    typeof e.target.value !== 'undefined' &&
                    !options.valuePath &&
                    (typeof newValue === 'undefined' || newValue === null)
                ) {
                    val = e.target.value;
                } else if (!options.valuePath) {
                    val = newValue;
                } else {
                    val = ObjectUtil.get(newValue, options.valuePath);
                }

                // 应用值转换函数
                if (typeof convert === 'function') {
                    val = convert(val);
                }

                // 处理空值：根据 allowEmpty 配置决定是否保留空值
                if (allowEmptyString || allowEmptyValue) {
                    // 允许空值，不做处理
                } else {
                    if (val === emptyValue) {
                        val = undefined;
                    }
                }

                // 保存光标位置（用于 Input 组件）
                try {
                    if (e && e.target && e.target.selectionStart) {
                        setCursor(e.target.selectionStart);
                    }
                } catch (err) {
                    // 忽略错误
                }

                updateTouched(true, { notNotify: true, notUpdate: true });
                updateValue(val);
                if (mergeTrigger.includes('change')) {
                    fieldValidate(val);
                }
            };

            const handleBlur = (...e: any[]) => {
                if ((props as any).onBlur) {
                    (props as any).onBlur(...e);
                }
                if (!touched.value) {
                    updateTouched(true);
                }
                if (mergeTrigger.includes('blur')) {
                    const val = getVal();
                    fieldValidate(val);
                }
            };

            const fieldApi = {
                setValue: updateValue,
                setTouched: updateTouched,
                setError: updateError,
                reset,
                validate: fieldValidate,
            };

            onMounted(() => {
                isUnmounted.value = false;
                if (validateOnMount) {
                    fieldValidate(value.value);
                }

                if (typeof field === 'undefined') {
                    return;
                }

                const refValue = getVal();
                updater.register(
                    field,
                    {
                        value: refValue,
                        error: error.value,
                        touched: touched.value,
                        status: status.value,
                    },
                    {
                        field,
                        fieldApi,
                        keepState: keepState || false,
                        allowEmpty: allowEmptyValue,
                    }
                );
            });

            onUnmounted(() => {
                isUnmounted.value = true;
                if (typeof field !== 'undefined') {
                    updater.unRegister(field);
                }
            });

            const valueKey = options.valueKey || 'value';
            const changeEventName = options.onKeyChangeFnName || 'onChange';

            // 创建稳定的事件处理函数引用，避免在 computed 中被缓存
            const onChangeHandler = (newValue: any, e: any, ...other: any[]) => {
                handleChange(newValue, e, ...other);
            };

            const onInputHandler = (e: Event) => {
                const target = e.target as HTMLInputElement;
                if (target && target.value !== undefined) {
                    handleChange(target.value, e);
                }
            };

            /**
             * 计算传递给原始组件的 props
             * 排除表单相关属性，添加值绑定和事件处理
             */
            const componentProps = computed(() => {
                // 排除表单相关属性，避免传递给原始组件
                const {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    field: _field,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    label: _label,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    labelPosition: _labelPosition,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    labelWidth: _labelWidth,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    labelAlign: _labelAlign,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    labelCol: _labelCol,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    wrapperCol: _wrapperCol,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    noLabel: _noLabel,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    noErrorMessage: _noErrorMessage,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    isInInputGroup: _isInInputGroup,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    initValue: _initValue,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    validate: _validate,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    validateStatus: _validateStatus,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    trigger: _trigger,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    allowEmptyString: _allowEmptyString,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    allowEmpty: _allowEmpty,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    emptyValue: _emptyValue,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    rules: _rules,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    required: _required,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    keepState: _keepState,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    transform: _transform,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    name: _name,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    fieldClassName: _fieldClassName,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    fieldStyle: _fieldStyle,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    convert: _convert,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    stopValidateWithError: _stopValidateWithError,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    helpText: _helpText,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    extraText: _extraText,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    extraTextPosition: _extraTextPosition,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    pure: _pure,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    id: _id,
                    ...cleanRest
                } = rest || {};

                // 清理 attrs，移除表单相关属性
                const cleanAttrs = { ...attrs };
                if ('field' in cleanAttrs) {
                    delete (cleanAttrs as any).field;
                }
                if ('label' in cleanAttrs) {
                    delete (cleanAttrs as any).label;
                }
                if ('id' in cleanAttrs) {
                    delete (cleanAttrs as any).id;
                }

                // 确定默认值：emptyValue > checked(false) > value('')
                let defaultValue: any;
                if (emptyValue !== undefined) {
                    defaultValue = emptyValue;
                } else if (valueKey === 'checked') {
                    defaultValue = false;
                } else {
                    defaultValue = '';
                }

                const propsToPass: any = {
                    ...cleanRest,
                    ...cleanAttrs,
                    [valueKey]: value.value === undefined || value.value === null ? defaultValue : value.value,
                    [changeEventName]: onChangeHandler,
                };

                // 生成唯一的 id，避免多个表单实例间的 id 冲突
                // 优先级：用户指定的唯一 id（包含 formId 前缀）> 自动生成的 id（formId-field）> field
                if (field) {
                    const existingId = propsToPass.id;
                    if (
                        existingId &&
                        existingId !== field &&
                        currentFormId &&
                        existingId.startsWith(`${currentFormId}-`)
                    ) {
                        propsToPass.id = existingId;
                    } else {
                        propsToPass.id = currentFormId ? `${currentFormId}-${field}` : field;
                    }
                }

                // Switch/Checkbox 使用 checked，不需要 onInput 事件
                if (valueKey !== 'checked') {
                    propsToPass.onInput = onInputHandler;
                }

                // 传递表单级别的 disabled 状态
                if (formProps.disabled !== undefined) {
                    propsToPass.disabled = formProps.disabled;
                }

                if (options.maintainCursor) {
                    propsToPass.onBlur = handleBlur;
                }

                // 处理清除功能：自动处理 showClear 和 onClear
                if (cleanRest.showClear !== undefined || cleanAttrs.showClear !== undefined) {
                    propsToPass.showClear = cleanRest.showClear ?? cleanAttrs.showClear;
                }
                if (cleanRest.onClear || cleanAttrs.onClear) {
                    const userOnClear = cleanRest.onClear || cleanAttrs.onClear;
                    propsToPass.onClear = (e: MouseEvent) => {
                        userOnClear?.(e);
                        handleChange('', e);
                    };
                } else if (cleanRest.showClear || cleanAttrs.showClear) {
                    propsToPass.onClear = (e: MouseEvent) => {
                        handleChange('', e);
                    };
                }

                return propsToPass;
            });

            return () => {
                if (pure) {
                    return h(Component, componentProps.value, slots);
                }

                const fieldCls = classNames(`${prefix}-field`, fieldClassName, {
                    [`${prefix}-field-error`]: !isValid(error.value),
                });

                let labelText: string | undefined = undefined;
                let labelExtra: any = undefined;
                let labelOptional: boolean | undefined = undefined;
                if (typeof label === 'string') {
                    labelText = label;
                } else if (label && typeof label === 'object' && !Array.isArray(label)) {
                    labelText = (label as any).text;
                    labelExtra = (label as any).extra;
                    labelOptional = (label as any).optional;
                }
                if (labelText === undefined) {
                    labelText = field || '';
                }

                const labelExtraSlot = slots['label-extra'] || slots.labelExtra;

                const labelProps = {
                    text: labelText,
                    align: mergeLabelAlign,
                    width: mergeLabelWidth,
                    required,
                    optional: labelOptional !== undefined ? labelOptional : false,
                    name: name || field || '',
                    id: field ? `${field}-label` : undefined,
                    extra: labelExtra,
                };

                const errorMessageProps = {
                    error: error.value,
                    showValidateIcon: formProps.showValidateIcon,
                    validateStatus: status.value,
                    helpText,
                    isInInputGroup,
                    errorMessageId: `${field}-error-message`,
                    helpTextId: `${field}-help-text`,
                };

                const fieldContent = h('div', { class: `${prefix}-field-main` }, [
                    h(Component, componentProps.value, slots),
                    !noErrorMessage ? h(ErrorMessage, errorMessageProps) : null,
                ]);

                // 渲染 Label 组件
                const renderLabel = () => {
                    if (noLabel) {
                        return null;
                    }

                    let labelSlotProps: any = {};
                    if (labelExtraSlot) {
                        labelSlotProps = { extra: labelExtraSlot };
                    } else if (labelExtra && typeof labelExtra !== 'string') {
                        labelSlotProps = { extra: () => labelExtra };
                    }

                    return h(Label, labelProps, labelSlotProps);
                };

                // 渲染字段容器
                const renderFieldWrapper = (children: any[]) => {
                    return h(
                        'div',
                        {
                            class: fieldCls,
                            'data-field': field,
                            'x-field-id': field,
                            'x-label-pos': mergeLabelPos,
                            'x-extra-pos': mergeExtraPos,
                        },
                        children
                    );
                };

                // 使用 Grid 布局（labelCol/wrapperCol）
                if (mergeLabelCol && mergeWrapperCol) {
                    const labelColCls = classNames(`${prefix}-col-${mergeLabelAlign}`);
                    const labelNode = renderLabel();
                    const labelColNode = h(Col, { ...mergeLabelCol, class: labelColCls }, { default: () => labelNode });
                    const wrapperColNode = h(Col, { ...mergeWrapperCol }, { default: () => fieldContent });

                    if (mergeLabelPos === 'top') {
                        return renderFieldWrapper([
                            h('div', { style: { overflow: 'hidden' } }, [labelColNode]),
                            wrapperColNode,
                        ]);
                    }

                    return renderFieldWrapper([labelColNode, wrapperColNode]);
                }

                // 使用默认布局
                const labelNode = renderLabel();
                return renderFieldWrapper([labelNode, fieldContent]);
            };
        },
    });
}

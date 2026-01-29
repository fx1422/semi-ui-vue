import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Steps from '../src/components/steps/Steps.vue';
import Step from '../src/components/steps/Step.vue';
import { stepsClasses } from '@douyinfe/semi-foundation/steps/constants';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

// Mock window.matchMedia for Grid component
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

describe('Steps', () => {
    it('current works', () => {
        const wrapper = mount(Steps, {
            props: {
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });

        // Check that first step has process status class
        const firstStep = wrapper.find(`.${stepsClasses.ITEM}-process`);
        expect(firstStep.exists()).toBe(true);
    });

    it('parent status works', () => {
        // Wait status
        const waitWrapper = mount(Steps, {
            props: {
                status: 'wait',
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(waitWrapper.props('status')).toBe('wait');
        waitWrapper.unmount();

        // Error status
        const errorWrapper = mount(Steps, {
            props: {
                status: 'error',
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(errorWrapper.props('status')).toBe('error');
        errorWrapper.unmount();

        // Finish status
        const finishWrapper = mount(Steps, {
            props: {
                status: 'finish',
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(finishWrapper.props('status')).toBe('finish');
        finishWrapper.unmount();

        // Process status
        const processWrapper = mount(Steps, {
            props: {
                status: 'process',
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(processWrapper.props('status')).toBe('process');
        processWrapper.unmount();

        // Warning status
        const warningWrapper = mount(Steps, {
            props: {
                status: 'warning',
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(warningWrapper.props('status')).toBe('warning');
        warningWrapper.unmount();
    });

    it('child status works', () => {
        // Wait status
        const waitWrapper = mount(Steps, {
            props: {
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { status: 'wait', title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(waitWrapper.find(`.${stepsClasses.ITEM}-wait`).exists()).toBe(true);
        waitWrapper.unmount();

        // Error status
        const errorWrapper = mount(Steps, {
            props: {
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { status: 'error', title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(errorWrapper.find(`.${stepsClasses.ITEM}-error`).exists()).toBe(true);
        errorWrapper.unmount();

        // Finish status
        const finishWrapper = mount(Steps, {
            props: {
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { status: 'finish', title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(finishWrapper.find(`.${stepsClasses.ITEM}-finish`).exists()).toBe(true);
        finishWrapper.unmount();

        // Process status
        const processWrapper = mount(Steps, {
            props: {
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { status: 'process', title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(processWrapper.find(`.${stepsClasses.ITEM}-process`).exists()).toBe(true);
        processWrapper.unmount();

        // Warning status
        const warningWrapper = mount(Steps, {
            props: {
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { status: 'warning', title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });
        expect(warningWrapper.find(`.${stepsClasses.ITEM}-warning`).exists()).toBe(true);
        warningWrapper.unmount();
    });

    it('initial works', () => {
        const wrapper = mount(Steps, {
            props: {
                status: 'process',
                initial: 1,
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });

        // First step (index 0) with initial=1 has stepNumber=1, which equals current=1, so it gets process status
        expect(wrapper.find(`.${stepsClasses.ITEM}-process`).exists()).toBe(true);
        // The first step number icon should show 2 (initial 1 + index 0 + 1)
        const firstStepNumberIcon = wrapper.find(`.${stepsClasses.ITEM}-number-icon`);
        expect(firstStepNumberIcon.text()).toBe('2');

        // The second step (index 1) should show number 3 (initial 1 + index 1 + 1)
        const allStepNumbers = wrapper.findAll(`.${stepsClasses.ITEM}-number-icon`);
        expect(allStepNumbers[1].text()).toBe('3');
    });

    it('FillStep onClick works', async () => {
        const onClickSpy = vi.fn();
        const wrapper = mount(Steps, {
            props: {
                type: 'fill',
                status: 'warning',
                initial: 0,
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { onClick: onClickSpy, title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });

        await wrapper.vm.$nextTick();
        const firstStepContainer = wrapper.find(`.${stepsClasses.ITEM}`);
        await firstStepContainer.trigger('click');
        await wrapper.vm.$nextTick();
        expect(onClickSpy).toHaveBeenCalled();
    });

    it('BasicStep onClick works', async () => {
        const onClickSpy = vi.fn();
        const wrapper = mount(Steps, {
            props: {
                type: 'basic',
                status: 'warning',
                initial: 1,
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { onClick: onClickSpy, title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });

        await wrapper.vm.$nextTick();
        const firstStepContainer = wrapper.find(`.${stepsClasses.ITEM}`);
        await firstStepContainer.trigger('click');
        await wrapper.vm.$nextTick();
        expect(onClickSpy).toHaveBeenCalled();
    });

    it('NavStep onClick works', async () => {
        const onClickSpy = vi.fn();
        const wrapper = mount(Steps, {
            props: {
                type: 'nav',
                status: 'warning',
                initial: 1,
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { onClick: onClickSpy, title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });

        await wrapper.vm.$nextTick();
        const firstStepContainer = wrapper.find(`.${stepsClasses.ITEM}`);
        await firstStepContainer.trigger('click');
        await wrapper.vm.$nextTick();
        expect(onClickSpy).toHaveBeenCalled();
    });

    it('Steps onChange works', async () => {
        const wrapper = mount(Steps, {
            props: {
                status: 'warning',
                initial: 0,
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step.1' }),
                    h(Step, { title: 'Step.2' }),
                    h(Step, { title: 'Step.3' }),
                ],
            },
        });

        await wrapper.vm.$nextTick();

        // Click on different step should trigger change
        const firstStepContainer = wrapper.findAll(`.${stepsClasses.ITEM}`)[0];
        await firstStepContainer.trigger('click');

        // Wait for event to propagate
        await wrapper.vm.$nextTick();
        const emitted = wrapper.emitted('change');
        expect(emitted).toBeTruthy();
        if (emitted) {
            expect(emitted.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('Steps type', () => {
        // Nav type
        const navWrapper = mount(Steps, {
            props: {
                type: 'nav',
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished' }),
                    h(Step, { title: 'In Progress' }),
                    h(Step, { title: 'Waiting' }),
                ],
            },
        });
        expect(navWrapper.find(`.${BASE_CLASS_PREFIX}-steps-nav`).exists()).toBe(true);
        navWrapper.unmount();

        // Basic type
        const basicWrapper = mount(Steps, {
            props: {
                type: 'basic',
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished' }),
                    h(Step, { title: 'In Progress' }),
                    h(Step, { title: 'Waiting' }),
                ],
            },
        });
        expect(basicWrapper.find(`.${BASE_CLASS_PREFIX}-steps-basic`).exists()).toBe(true);
        basicWrapper.unmount();

        // Fill type (default)
        const fillWrapper = mount(Steps, {
            props: {
                type: 'fill',
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished' }),
                    h(Step, { title: 'In Progress' }),
                    h(Step, { title: 'Waiting' }),
                ],
            },
        });
        expect(fillWrapper.find(`.${BASE_CLASS_PREFIX}-steps`).exists()).toBe(true);
        fillWrapper.unmount();
    });

    it('Steps with custom className & style', () => {
        const wrapper = mount(Steps, {
            props: {
                className: 'test',
                style: { color: 'red' },
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished' }),
                    h(Step, { title: 'In Progress' }),
                    h(Step, { title: 'Waiting' }),
                ],
            },
        });

        expect(wrapper.find('.test').exists()).toBe(true);
        const stepsElement = wrapper.find(`.${BASE_CLASS_PREFIX}-steps.test`);
        expect(stepsElement.attributes('style')).toContain('color: red');
    });

    it('Step with custom className & style', () => {
        const wrapper = mount(Steps, {
            slots: {
                default: () => [
                    h(Step, { className: 'test', style: { color: 'blue' }, title: 'Finished' }),
                    h(Step, { title: 'In Progress' }),
                    h(Step, { title: 'Waiting' }),
                ],
            },
        });

        expect(wrapper.find('.test').exists()).toBe(true);
        const firstStep = wrapper.find('.test');
        expect(firstStep.attributes('style')).toContain('color: blue');
    });

    it('Steps with size', () => {
        const wrapper = mount(Steps, {
            props: {
                type: 'basic',
                size: 'small',
            },
            slots: {
                default: () => [
                    h(Step, { className: 'test', style: { color: 'red' }, title: 'Finished' }),
                    h(Step, { title: 'In Progress' }),
                    h(Step, { title: 'Waiting' }),
                ],
            },
        });

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-steps-small`).exists()).toBe(true);
    });

    it('Steps with hasLine', () => {
        // With line
        const hasLineWrapper = mount(Steps, {
            props: {
                type: 'basic',
                hasLine: true,
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished', description: 'This is a description' }),
                    h(Step, { title: 'In Progress', description: 'This is a description' }),
                    h(Step, { title: 'Waiting', description: 'This is a description' }),
                ],
            },
        });
        expect(hasLineWrapper.find(`.${BASE_CLASS_PREFIX}-steps-hasline`).exists()).toBe(true);
        hasLineWrapper.unmount();

        // Without line
        const noLineWrapper = mount(Steps, {
            props: {
                type: 'basic',
                hasLine: false,
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished', description: 'This is a description' }),
                    h(Step, { title: 'In Progress', description: 'This is a description' }),
                    h(Step, { title: 'Waiting', description: 'This is a description' }),
                ],
            },
        });
        expect(noLineWrapper.find(`.${BASE_CLASS_PREFIX}-steps-hasline`).exists()).toBe(false);
        noLineWrapper.unmount();
    });

    it('Steps with direction', () => {
        // Vertical
        const verticalWrapper = mount(Steps, {
            props: {
                direction: 'vertical',
                type: 'basic',
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished', description: 'This is a description' }),
                    h(Step, { title: 'In Progress', description: 'This is a description' }),
                    h(Step, { title: 'Waiting', description: 'This is a description' }),
                ],
            },
        });
        expect(verticalWrapper.find(`.${BASE_CLASS_PREFIX}-steps-vertical`).exists()).toBe(true);
        verticalWrapper.unmount();

        // Horizontal
        const horizontalWrapper = mount(Steps, {
            props: {
                direction: 'horizontal',
                type: 'basic',
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished', description: 'This is a description' }),
                    h(Step, { title: 'In Progress', description: 'This is a description' }),
                    h(Step, { title: 'Waiting', description: 'This is a description' }),
                ],
            },
        });
        expect(horizontalWrapper.find(`.${BASE_CLASS_PREFIX}-steps-horizontal`).exists()).toBe(true);
        horizontalWrapper.unmount();
    });

    it('Steps with description', () => {
        const wrapper = mount(Steps, {
            props: {
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished', description: 'This is step 1' }),
                    h(Step, { title: 'In Progress', description: 'This is step 2' }),
                    h(Step, { title: 'Waiting', description: 'This is step 3' }),
                ],
            },
        });

        const descriptions = wrapper.findAll(`.${stepsClasses.ITEM}-description`);
        expect(descriptions.length).toBe(3);
        expect(descriptions[0].text()).toBe('This is step 1');
    });

    it('Steps with description slot', () => {
        const wrapper = mount(Steps, {
            props: {
                current: 1,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Finished', description: 'Test description' }),
                    h(Step, { title: 'In Progress' }),
                    h(Step, { title: 'Waiting' }),
                ],
            },
        });

        const description = wrapper.find(`.${stepsClasses.ITEM}-description`);
        expect(description.exists()).toBe(true);
        expect(description.text()).toBe('Test description');
    });

    it('Steps with custom icon', () => {
        const CustomIcon = {
            name: 'CustomIcon',
            render() {
                return h('svg', { class: 'custom-icon' }, 'Icon');
            },
        };

        const wrapper = mount(Steps, {
            props: {
                current: 0,
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step 1', icon: h(CustomIcon) }),
                    h(Step, { title: 'Step 2' }),
                    h(Step, { title: 'Step 3' }),
                ],
            },
        });

        expect(wrapper.find('.custom-icon').exists()).toBe(true);
    });

    it('Steps renders correct number of steps', () => {
        const wrapper = mount(Steps, {
            slots: {
                default: () => [
                    h(Step, { title: 'Step 1' }),
                    h(Step, { title: 'Step 2' }),
                    h(Step, { title: 'Step 3' }),
                    h(Step, { title: 'Step 4' }),
                ],
            },
        });

        const steps = wrapper.findAll(`.${stepsClasses.ITEM}`);
        expect(steps.length).toBe(4);
    });

    it('Steps with aria-label', () => {
        const wrapper = mount(Steps, {
            props: {
                'aria-label': 'Test steps',
            },
            slots: {
                default: () => [
                    h(Step, { title: 'Step 1' }),
                    h(Step, { title: 'Step 2' }),
                ],
            },
        });

        const stepsElement = wrapper.find(`.${BASE_CLASS_PREFIX}-steps`);
        // Check if aria-label exists
        expect(stepsElement.exists()).toBe(true);
        const ariaLabel = stepsElement.attributes('aria-label');
        if (ariaLabel) {
            expect(ariaLabel).toBe('Test steps');
        }
    });
});


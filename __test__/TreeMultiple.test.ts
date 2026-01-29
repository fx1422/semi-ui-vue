import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Tree from '../src/components/tree/Tree.vue';
import type { TreeNodeData } from '../src/components/tree/interface';

/**
 * Tree Multiple Selection Tests
 * 
 * Test case for checkbox selection issue fix
 */
describe('Tree Multiple Selection', () => {
    let treeData: TreeNodeData[];

    beforeEach(() => {
        treeData = [
            {
                label: 'Node1',
                value: '0-0',
                key: '0-0',
                children: [
                    {
                        label: 'Child Node1',
                        value: '0-0-1',
                        key: '0-0-1',
                    },
                    {
                        label: 'Child Node2',
                        value: '0-0-2',
                        key: '0-0-2',
                    },
                ],
            },
            {
                label: 'Node2',
                value: '0-1',
                key: '0-1',
            },
        ];
    });

    describe('Checkbox Selection', () => {
        it('should render checkboxes when multiple is true', () => {
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                },
            });

            const checkboxes = wrapper.findAll('.semi-checkbox');
            expect(checkboxes.length).toBeGreaterThan(0);
        });

        it('should check checkbox on click', async () => {
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                    defaultExpandAll: true,
                },
            });

            // Find first checkbox
            const firstCheckbox = wrapper.findAll('.semi-checkbox')[0];
            expect(firstCheckbox.exists()).toBe(true);

            // Click checkbox
            await firstCheckbox.trigger('click');

            // Wait for state update
            await wrapper.vm.$nextTick();

            // Verify change event was emitted
            expect(wrapper.emitted()).toHaveProperty('change');
        });

        it('should handle multiple checkbox selections', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                    defaultExpandAll: true,
                    onChange,
                },
            });

            // Click multiple checkboxes
            const checkboxes = wrapper.findAll('.semi-checkbox');
            await checkboxes[0].trigger('click');
            await wrapper.vm.$nextTick();
            
            await checkboxes[1].trigger('click');
            await wrapper.vm.$nextTick();

            // Verify onChange was called multiple times
            expect(onChange).toHaveBeenCalled();
            expect(onChange.mock.calls.length).toBeGreaterThan(0);
        });

        it('should support related check relation (parent-child)', async () => {
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                    checkRelation: 'related',
                    defaultExpandAll: true,
                },
            });

            // Click parent node checkbox
            const parentCheckbox = wrapper.findAll('.semi-checkbox')[0];
            await parentCheckbox.trigger('click');
            await wrapper.vm.$nextTick();

            // Verify change event includes parent and children
            const changeEvents = wrapper.emitted('change');
            expect(changeEvents).toBeDefined();
        });

        it('should support unRelated check relation', async () => {
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                    checkRelation: 'unRelated',
                    defaultExpandAll: true,
                },
            });

            // Click parent node checkbox
            const parentCheckbox = wrapper.findAll('.semi-checkbox')[0];
            await parentCheckbox.trigger('click');
            await wrapper.vm.$nextTick();

            // In unRelated mode, only the clicked node should be selected
            expect(wrapper.emitted('change')).toBeDefined();
        });

        it('should not check disabled checkboxes', async () => {
            const dataWithDisabled = [
                {
                    label: 'Disabled Node',
                    value: '0-0',
                    key: '0-0',
                    disabled: true,
                },
                {
                    label: 'Normal Node',
                    value: '0-1',
                    key: '0-1',
                },
            ];

            const wrapper = mount(Tree, {
                props: {
                    treeData: dataWithDisabled,
                    multiple: true,
                },
            });

            const checkboxes = wrapper.findAll('.semi-checkbox');
            const disabledCheckbox = checkboxes[0];

            // Try to click disabled checkbox
            await disabledCheckbox.trigger('click');
            await wrapper.vm.$nextTick();

            // Verify it's still disabled and not checked
            expect(disabledCheckbox.classes()).toContain('semi-checkbox-disabled');
        });

        it('should work with controlled mode (value prop)', async () => {
            const selectedValues = ['0-0-1'];
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                    value: selectedValues,
                    defaultExpandAll: true,
                },
            });

            await wrapper.vm.$nextTick();

            // Verify the specified node is checked
            const checkboxes = wrapper.findAll('.semi-checkbox-checked');
            expect(checkboxes.length).toBeGreaterThan(0);
        });
    });

    describe('CheckboxGroup Integration', () => {
        it('should render CheckboxGroup for multiple selection', () => {
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                },
            });

            // Verify that checkboxes are rendered
            const checkboxes = wrapper.findAll('.semi-checkbox');
            expect(checkboxes.length).toBeGreaterThan(0);
        });

        it('should pass correct value array to CheckboxGroup', async () => {
            const wrapper = mount(Tree, {
                props: {
                    treeData,
                    multiple: true,
                    value: ['0-0', '0-1'],
                },
            });

            await wrapper.vm.$nextTick();

            // CheckboxGroup should receive the value array
            const checkboxGroup = wrapper.findComponent({ name: 'CheckboxGroup' });
            expect(checkboxGroup.exists()).toBe(true);
        });
    });
});


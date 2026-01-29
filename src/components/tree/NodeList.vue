<template>
    <template v-for="(treeNode, index) in mapData" :key="getNodeKey(treeNode, index)">
        <NodeCollapsible v-if="isMotionNode(treeNode)" v-bind="getMotionProps(treeNode)">
            <component :is="renderTreeNode(node)" v-for="node in treeNode as FlattenNode[]" :key="node.key" />
        </NodeCollapsible>
        <component :is="renderTreeNode(treeNode as FlattenNode)" v-else />
    </template>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { isEqual } from 'lodash-es';
import NodeCollapsible from './NodeCollapsible.vue';
import { FlattenNode, NodeListProps, TransitionNodes } from './interface';
import { TreeContextKey, TreeContextValue } from './treeContext';

// Animation constants
const DEFAULT_ANIMATION_DURATION = 200;

const props = defineProps<NodeListProps>();

const emit = defineEmits<{
    (e: 'motionEnd'): void;
}>();

const context = inject<TreeContextValue>(TreeContextKey);

const transitionNodes = ref<TransitionNodes<FlattenNode>>([]);
const cachedMotionKeys = ref<Set<string>>();
const cachedData = ref<FlattenNode[]>([]);
const cachedMotionType = ref<string>();

const getTreeNodeKey = (treeNode: FlattenNode) => {
    return treeNode.key;
};

const isMotionNode = (treeNode: any): treeNode is FlattenNode[] => {
    return Array.isArray(treeNode);
};

const getNodeKey = (treeNode: any, index: number) => {
    if (isMotionNode(treeNode)) {
        return treeNode[0] ? `motion-${treeNode[0].key}` : `motion-${index}`;
    }
    return (treeNode as FlattenNode).key;
};

const getMotionProps = (treeNode: any) => {
    if (!isMotionNode(treeNode)) {
        return {};
    }
    return {
        open: props.motionType === 'hide',
        duration: DEFAULT_ANIMATION_DURATION,
        motion: Boolean(props.motionType),
        onMotionEnd: onMotionEnd,
    };
};

const mapData = computed(() => {
    return transitionNodes.value.length && !props.searchTargetIsDeep ? transitionNodes.value : props.flattenNodes;
});

const onMotionEnd = () => {
    emit('motionEnd');
    transitionNodes.value = [];
};

// Equivalent to getDerivedStateFromProps
// 性能优化：先进行浅比较，只在必要时进行深度比较
watch(
    () => [props.flattenNodes, props.motionKeys, props.motionType, props.flattenList],
    () => {
        const { flattenNodes = [], motionKeys, motionType, flattenList = [] } = props;

        // 性能优化：先进行浅比较，减少不必要的深度比较
        const motionKeysChanged =
            cachedMotionKeys.value !== motionKeys &&
            (cachedMotionKeys.value?.size !== motionKeys?.size || !isEqual(cachedMotionKeys.value, motionKeys));

        // 性能优化：只比较 keys 数组，而不是整个对象
        const flattenNodesKeysChanged =
            cachedData.value.length !== flattenNodes.length ||
            cachedData.value.map((i) => i.key).join(',') !== flattenNodes.map((i) => i.key).join(',');

        const hasChanged = motionKeysChanged || flattenNodesKeysChanged;
        const motionArr = [...motionKeys];

        if (!hasChanged || !motionArr.length) {
            return;
        }

        const newTransitionNodes: TransitionNodes<FlattenNode> = [];
        const transitionRange: FlattenNode[] = [];
        let rangeStart = 0;
        const lookUpTarget = motionType === 'hide' && flattenList ? flattenList : flattenNodes;
        lookUpTarget.forEach((treeNode, ind) => {
            const nodeKey = getTreeNodeKey(treeNode);
            if (motionKeys.has(nodeKey)) {
                transitionRange.push(treeNode);
                if (nodeKey === motionArr[0]) {
                    rangeStart = ind;
                }
            } else {
                newTransitionNodes.push(treeNode);
            }
        });
        newTransitionNodes.splice(rangeStart, 0, transitionRange);
        transitionNodes.value = newTransitionNodes;
        cachedData.value = flattenNodes;
        cachedMotionKeys.value = motionKeys;
        cachedMotionType.value = motionType;
    },
    { immediate: true, deep: true }
);
</script>

# Vue 组件 Foundation 层集成工具

## 概述

这两个工具函数用于简化 Vue 组件与 Semi Design Foundation 层的集成：

- **`useFoundation`**: 自动处理 Foundation 实例的创建和生命周期管理
- **`useBaseComponent`**: 提供标准的 adapter 基础方法，减少重复代码

## 使用指南

### 1. `useFoundation` - 生命周期管理

**适用场景**：所有使用 Foundation 层的组件

**作用**：
- 自动创建 Foundation 实例
- 在 `onMounted` 时调用 `foundation.init()`
- 在 `onUnmounted` 时调用 `foundation.destroy()`

**使用示例**：

```typescript
import { useFoundation } from '../_utils';
import ComponentFoundation from '@douyinfe/semi-foundation/component/foundation';

const adapter = { /* ... */ };
const { foundation } = useFoundation(ComponentFoundation, adapter);
```

**已使用的组件**：
- ✅ Input
- ✅ Collapse
- ✅ Navigation
- ✅ Breadcrumb
- ✅ BackTop
- ✅ Descriptions
- ✅ Collapsible

**建议**：**所有新组件都应该使用 `useFoundation`**，避免手动管理生命周期。

---

### 2. `useBaseComponent` - 基础 Adapter 方法

**适用场景**：需要完整 Foundation 层集成的复杂组件

**作用**：
提供标准的 adapter 基础方法：
- `getProps()`, `getProp(key)`
- `getStates()`, `getState(key)`
- `setState(states, callback)`
- `getCache(key)`, `setCache(key, value)`
- `getContext(key)`, `getContexts()`
- `stopPropagation(e)`, `persistEvent(e)`
- `getDataAttr(props)` - 辅助函数

**使用示例**：

```typescript
import { useBaseComponent } from '../_utils';
import ComponentFoundation from '@douyinfe/semi-foundation/component/foundation';

const state = ref({ /* ... */ });
const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const foundation = new ComponentFoundation({
    ...baseAdapter,  // 使用基础 adapter
    // 添加组件特定的方法
    notifyChange: (value) => emit('change', value),
    updateCustomState: (val) => { /* ... */ },
});
```

**已使用的组件**：
- ✅ Tree（第一个使用，作为参考实现）

**建议使用的组件**：
- 🔄 **Table** - 复杂的数据展示组件，需要完整的 Foundation 集成
- 🔄 **Form** - 表单组件，需要管理多个字段状态
- 🔄 **DatePicker** - 复杂的日期选择组件
- 🔄 **Cascader** - 级联选择器，状态管理复杂
- 🔄 **TreeSelect** - 树形选择器，基于 Tree 组件
- 🔄 **Transfer** - 穿梭框，状态管理复杂

**不需要使用的组件**：
- ❌ **简单组件**（如 Button, Icon）- 不使用 Foundation 层
- ❌ **简单表单组件**（如 Switch, Checkbox, Radio）- adapter 方法较少，手动实现更清晰
- ❌ **展示组件**（如 Avatar, Badge, Tag）- 逻辑简单，不需要 Foundation

---

## 决策流程图

```
组件是否需要 Foundation 层？
├─ 否 → 不使用这两个工具
└─ 是 → 组件复杂度如何？
    ├─ 简单（adapter < 10 个方法）
    │   ├─ 使用 useFoundation ✅
    │   └─ 手动实现 adapter（更清晰）
    │
    └─ 复杂（adapter > 10 个方法，或需要标准基础方法）
        ├─ 使用 useFoundation ✅
        └─ 使用 useBaseComponent ✅
            └─ 在此基础上添加组件特定方法
```

---

## 迁移建议

### 高优先级（建议立即迁移）

以下组件可以立即使用 `useFoundation` 来简化代码：

1. **Switch** - 目前手动管理生命周期
2. **Checkbox** - 目前手动管理生命周期
3. **Radio** - 目前手动管理生命周期
4. **Avatar** - 目前手动管理生命周期
5. **Tooltip** - 目前手动管理生命周期

### 中优先级（新组件时使用）

以下组件在迁移或新建时建议使用 `useBaseComponent`：

1. **Table** - 复杂的数据展示组件
2. **Form** - 表单组件
3. **DatePicker** - 日期选择器
4. **Cascader** - 级联选择器
5. **TreeSelect** - 树形选择器（基于 Tree）

---

## 代码对比

### 使用前（手动实现）

```typescript
const adapter = {
    getProps: () => props,
    getProp: (key: string) => props[key],
    getState: (key: string) => state[key],
    getStates: () => state,
    setState: (states, callback) => {
        Object.assign(state, states);
        callback?.();
    },
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e) => e?.stopPropagation(),
    persistEvent: () => {},
    // 组件特定的方法
    notifyChange: (value) => emit('change', value),
};

const foundation = new ComponentFoundation(adapter);

onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});
```

### 使用后（使用工具函数）

```typescript
import { useFoundation, useBaseComponent } from '../_utils';

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const adapter = {
    ...baseAdapter,  // 基础方法
    // 只需添加组件特定的方法
    notifyChange: (value) => emit('change', value),
};

const { foundation } = useFoundation(ComponentFoundation, adapter);
```

**优势**：
- ✅ 减少重复代码（~15 行 → ~3 行）
- ✅ 统一的生命周期管理
- ✅ 更好的类型安全
- ✅ 更容易维护

---

## 注意事项

1. **`useBaseComponent` 的 state 参数**：
   - 可以是 `ref` 对象：`useBaseComponent(props, stateRef)`
   - 也可以是普通对象：`useBaseComponent(props, state)`
   - 工具函数会自动处理

2. **`getDataAttr` 的使用**：
   ```vue
   <div v-bind="getDataAttr()">
   ```

3. **组件特定方法**：
   - 使用 `useBaseComponent` 后，只需添加组件特定的 adapter 方法
   - 基础方法会被自动提供

4. **类型安全**：
   - `useBaseComponent` 支持泛型：`useBaseComponent<PropsType, StateType>(props, state)`
   - 但通常 TypeScript 可以自动推断

---

## 总结

- **`useFoundation`**: 所有使用 Foundation 的组件都应该使用 ✅
- **`useBaseComponent`**: 复杂组件（adapter 方法多）建议使用 ✅
- **简单组件**: 可以继续手动实现，保持代码清晰

这两个工具函数的目标是：
1. 减少重复代码
2. 统一代码风格
3. 提高可维护性
4. 降低出错概率


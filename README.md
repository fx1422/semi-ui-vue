# @transsionfe/semi-ui-vue

Vue 3 implementation of Semi Design - A modern, comprehensive, and flexible design system.

[![npm version](https://img.shields.io/npm/v/@transsionfe/semi-ui-vue.svg?style=flat)](https://www.npmjs.com/package/@transsionfe/semi-ui-vue)
[![npm downloads](https://img.shields.io/npm/dm/@transsionfe/semi-ui-vue.svg)](https://www.npmjs.com/package/@transsionfe/semi-ui-vue)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@transsionfe/semi-ui-vue)](https://bundlephobia.com/package/@transsionfe/semi-ui-vue)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DouyinFE/semi-design/blob/main/LICENSE)

## 特性

- 🎨 **设计系统** - 基于 Semi Design 设计语言
- 🧩 **Foundation/Adapter 架构** - 业务逻辑与 UI 框架解耦
- 📦 **按需加载** - 支持 Tree Shaking
- 🎯 **TypeScript** - 完整的类型定义
- ⚡️ **Vue 3** - Composition API
- 🔧 **可定制** - 3000+ Design Tokens
- ♿️ **无障碍** - 遵循 W3C 标准
- 🌍 **国际化** - 支持多语言

## 安装

```bash
# npm
npm install @transsionfe/semi-ui-vue

# yarn
yarn add @transsionfe/semi-ui-vue

# pnpm
pnpm add @transsionfe/semi-ui-vue
```

## 运行时依赖（重要）

本库将若干运行时包声明为 peerDependencies，使用本库的项目需要在自身项目中安装这些依赖以保证运行时兼容性。推荐安装：

- 必装（peer dependencies）：
  - `vue`
  - `@douyinfe/semi-foundation`（已验证：v2.90.13）
  - `@douyinfe/semi-theme-default`（已验证：v2.90.13）
  - `@douyinfe/semi-animation`（已验证：v2.90.13）

- 可选（按需）：
  - `date-fns`

安装示例：

```bash
# npm
npm install vue @douyinfe/semi-foundation @douyinfe/semi-theme-default @douyinfe/semi-animation date-fns

# pnpm
pnpm add vue @douyinfe/semi-foundation @douyinfe/semi-theme-default @douyinfe/semi-animation date-fns
```

> 注：在 monorepo 场景下，这些包可能已由工作区提供；在普通项目中请确保满足 peerDependencies 要求的版本范围。

## 快速开始

### 完整引入

```typescript
// main.ts
import { createApp } from 'vue';
import SemiUIVue from '@transsionfe/semi-ui-vue';
// import package-exported CSS (recommended)
import '@transsionfe/semi-ui-vue/css';

const app = createApp(App);
app.use(SemiUIVue);
app.mount('#app');
```

```vue
<!-- App.vue -->
<template>
    <Button type="primary">Hello Semi</Button>
</template>
```

### 按需引入（推荐）

```vue
<template>
    <Button type="primary" @click="handleClick">点击我</Button>
</template>

<script setup lang="ts">
import { Button } from '@transsionfe/semi-ui-vue';
import type { ButtonProps } from '@transsionfe/semi-ui-vue';
// 导入组件样式
import '@douyinfe/semi-foundation/button/button.scss';

const handleClick = (e: MouseEvent) => {
    console.log('clicked', e);
};
</script>
```

## 样式导入

**🎉 新特性**：从 v0.1.0 开始，Semi UI Vue 完全对齐 React 版本的样式处理策略，**样式自动跟随组件按需加载**！

### 方式一：按需引入（推荐，自动加载样式）⭐⭐⭐⭐⭐

**适用场景**：所有项目类型，最佳实践

导入组件时，**样式会自动跟随加载**，无需手动导入：

```vue
<template>
    <Button type="primary">按钮</Button>
    <Input v-model="value" placeholder="输入框" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
// ✅ 导入组件
import { Button, Input } from '@transsionfe/semi-ui-vue';
// ✅ 样式自动跟随加载，无需手动导入！

const value = ref('');
</script>
```

**工作原理**：

1. 组件源码中包含样式导入：`import './button.scss'`
2. 构建时转换为：`import './button.css'`
3. 构建时将 SCSS 编译为 CSS 并输出到 `lib/` 目录
4. 用户的打包工具（Vite/Webpack）自动加载 CSS

**优点**：

- ✅ 真正的按需加载（只加载使用的组件样式）
- ✅ 零配置，开箱即用
- ✅ 与 React 版本行为完全一致
- ✅ 最佳开发体验

**构建产物结构**：

```
lib/
├── es/
│   └── components/
│       └── button/
│           ├── Button.vue.js      # 包含: import './button.css'
│           └── button.css         # ✅ 已编译的 CSS
└── cjs/
    └── components/
        └── button/
            ├── Button.vue.cjs     # 包含: require('./button.css')
            └── button.css         # ✅ 已编译的 CSS
```

---

### 方式二：全量引入 ⭐⭐⭐

**适用场景**：快速原型、使用大量组件

```typescript
// main.ts
import { createApp } from 'vue';
import SemiUIVue from '@transsionfe/semi-ui-vue';
import '@transsionfe/semi-ui-vue/css'; // 导入全量样式

const app = createApp(App);
app.use(SemiUIVue);
app.mount('#app');
```

**优点**：一次性加载所有样式，适合使用多个组件的场景  
**缺点**：包含所有组件样式（约 100KB gzipped）

---

### 方式三：自动导入组件（可选增强）⭐⭐⭐

如果不想手动 `import` 组件，可以使用 `unplugin-vue-components`：

```bash
npm install -D unplugin-vue-components
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { SemiUIVueResolver } from '@transsionfe/semi-ui-vue/resolvers';

export default defineConfig({
    plugins: [
        vue(),
        Components({
            resolvers: [SemiUIVueResolver()],
        }),
    ],
});
```

然后直接在模板中使用，无需 import：

```vue
<template>
    <!-- ✅ 无需 import，组件和样式都自动加载 -->
    <Button type="primary">按钮</Button>
    <Input v-model="value" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
const value = ref('');
</script>
```

---

### 样式导入对比

| 方式         | 样式加载    | 代码量 | 包体积 | 适用场景           |
| ------------ | ----------- | ------ | ------ | ------------------ |
| **按需引入** | ✅ 自动跟随 | 最少   | 最小   | **推荐，所有场景** |
| 全量引入     | 手动一次性  | 少     | ~100KB | 快速原型           |
| 自动导入     | ✅ 自动跟随 | 零     | 最小   | 极致便利           |

> 💡 **最佳实践**：直接使用**按需引入**（方式一），样式自动跟随，无需任何额外配置！

> 🔄 **迁移说明**：如果你之前手动导入了样式，可以删除这些导入语句，样式会自动加载。

## 组件示例

### Button 按钮

```vue
<template>
    <div>
        <!-- 不同类型 -->
        <Button type="primary">主要按钮</Button>
        <Button type="secondary">次要按钮</Button>
        <Button type="tertiary">第三按钮</Button>
        <Button type="warning">警告按钮</Button>
        <Button type="danger">危险按钮</Button>

        <!-- 不同尺寸 -->
        <Button size="small">小按钮</Button>
        <Button size="default">默认按钮</Button>
        <Button size="large">大按钮</Button>

        <!-- 不同主题 -->
        <Button theme="solid">Solid</Button>
        <Button theme="light">Light</Button>
        <Button theme="borderless">Borderless</Button>
        <Button theme="outline">Outline</Button>

        <!-- 禁用和加载 -->
        <Button disabled>禁用按钮</Button>
        <Button loading>加载中</Button>

        <!-- 块级按钮 -->
        <Button block>块级按钮</Button>

        <!-- 事件处理 -->
        <Button @click="handleClick">点击事件</Button>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@transsionfe/semi-ui-vue';

const handleClick = (e: MouseEvent) => {
    console.log('clicked', e);
};
</script>
```

## TypeScript 支持

完整的 TypeScript 类型定义：

```typescript
import type { ButtonProps, ButtonType, ButtonSize, ButtonTheme, ButtonHtmlType } from '@transsionfe/semi-ui-vue';

const props: ButtonProps = {
    type: 'primary',
    size: 'large',
    disabled: false,
};
```

## 开发指南

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/DouyinFE/semi-design.git
cd semi-design/packages/semi-ui-vue

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

### 项目结构

```
packages/semi-ui-vue/
├── src/                  # 源代码
│   ├── components/      # 所有组件（按功能分类）
│   │   ├── basic/      # 基础组件（Button, Icon, Typography）
│   │   ├── plus/       # Plus 组件
│   │   ├── input/      # 输入类组件
│   │   ├── navigation/ # 导航类组件
│   │   ├── show/       # 展示类组件（Space, Divider, Avatar）
│   │   ├── feedback/   # 反馈类组件
│   │   └── other/      # 其他组件
│   ├── _base/          # 基础类
│   ├── _utils/         # 工具函数
│   ├── locale/         # 国际化
│   ├── styles/         # 全局样式
│   └── index.ts        # 入口文件
├── __test__/           # 测试文件
├── example/            # 示例应用
└── scripts/            # 构建脚本
```

> 📘 详细的目录结构说明请查看 [DIRECTORY_STRUCTURE.md](./DIRECTORY_STRUCTURE.md)

## 架构设计

Semi UI Vue 采用 Foundation/Adapter 架构：

- **Foundation 层**：纯 JavaScript/TypeScript 的业务逻辑，框架无关
- **Adapter 层**：Vue 特定的 UI 实现

这种架构使得：

- ✅ 业务逻辑可复用
- ✅ 易于测试
- ✅ 易于维护
- ✅ 与 React 版本保持一致

## 浏览器支持

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Chrome ≥ 90                                                                                         | Firefox ≥ 88                                                                                           | Safari ≥ 14                                                                                         | Edge ≥ 90                                                                                     |

## 相关链接

- [React 版本](https://github.com/DouyinFE/semi-design)
- [官方文档](https://semi.design/)
- [设计规范](https://semi.design/zh-CN/start/introduction)
- [更新日志](./CHANGELOG.md)
- [迁移指南](./MIGRATION.md)
- [贡献指南](../../CONTRIBUTING.md)

## 贡献

欢迎贡献！请查看 [贡献指南](../../CONTRIBUTING.md)。

### 开发规范

- 遵循 [Vue 组件开发规范](mdc:.cursor/rules/vue-component-development.mdc)
- 遵循 [代码风格规范](mdc:.cursor/rules/code-style.mdc)
- 确保与 React 版本功能一致
- 编写完整的测试用例

## License

MIT

Copyright (c) 2025-present Transsion

本项目基于 [Semi Design](https://github.com/DouyinFE/semi-design) 设计系统开发，感谢 DouyinFE 团队提供优秀的设计系统。

详细许可信息请查看 [LICENSE](./LICENSE) 和 [NOTICE](./NOTICE) 文件。

## 致谢

感谢 Semi Design 团队提供优秀的设计系统。

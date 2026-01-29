import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgsDir = path.resolve(__dirname, '../src/components/icons/svgs');
const iconsDir = path.resolve(__dirname, '../src/components/icons/icons');
const indexFile = path.resolve(__dirname, '../src/components/icons/index.ts');

// 确保 icons 目录存在
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// 读取所有 SVG 文件
const svgFiles = fs.readdirSync(svgsDir).filter(file => file.endsWith('.svg'));

console.log(`Found ${svgFiles.length} SVG files`);

// 转换文件名为组件名：home.svg -> IconHome
function toComponentName(filename) {
    const name = filename.replace('.svg', '');
    const parts = name.split(/[-_]/);
    const pascalCase = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    return `Icon${pascalCase}`;
}

// 转换为 kebab-case：IconHome -> home
function toIconType(filename) {
    return filename.replace('.svg', '').replace(/_/g, '-');
}

// 读取 SVG 内容并提取路径
function extractSvgContent(svgPath) {
    const content = fs.readFileSync(svgPath, 'utf-8');
    // 提取 viewBox
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

    // 提取所有 path、circle、rect 等元素
    const innerMatch = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    let innerContent = innerMatch ? innerMatch[1].trim() : '';

    // 将 fill="black" 替换为 fill="currentColor"，确保图标继承父元素颜色
    innerContent = innerContent.replace(/fill="black"/g, 'fill="currentColor"');
    // 也替换 stroke="black"，如果存在的话
    innerContent = innerContent.replace(/stroke="black"/g, 'stroke="currentColor"');

    return { viewBox, innerContent };
}

// 生成 Vue 组件代码
function generateVueComponent(componentName, iconType, svgContent) {
    const { viewBox, innerContent } = svgContent;

    return `<template>
    <Icon :type="type" v-bind="$attrs">
        <svg
            :viewBox="viewBox"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable="false"
            aria-hidden="true"
            v-html="svgContent"
        />
    </Icon>
</template>

<script setup lang="ts">
import Icon from '../Icon.vue';

defineOptions({
    name: '${componentName}'
});

const type = '${iconType}';
const viewBox = '${viewBox}';
const svgContent = \`${(innerContent || '').replace(/`/g, '\\`')}\`;
</script>
`;
}

// 生成所有图标组件
const exports = [];

svgFiles.forEach((filename, index) => {
    const componentName = toComponentName(filename);
    const iconType = toIconType(filename);
    const svgPath = path.join(svgsDir, filename);

    try {
        const svgContent = extractSvgContent(svgPath);
        const componentCode = generateVueComponent(componentName, iconType, svgContent);

        const componentFile = path.join(iconsDir, `${componentName}.vue`);
        fs.writeFileSync(componentFile, componentCode, 'utf-8');

        exports.push(`export { default as ${componentName} } from './icons/${componentName}.vue';`);

        if ((index + 1) % 50 === 0) {
            console.log(`Generated ${index + 1}/${svgFiles.length} icons...`);
        }
    } catch (error) {
        console.error(`Error processing ${filename}:`, error.message);
    }
});

// 生成 index.ts
const indexContent = `// Auto-generated file. Do not edit manually.
import Icon from './Icon.vue';

export { Icon };
export type { IconProps } from './Icon.vue';
export type IconSize = 'inherit' | 'extra-small' | 'small' | 'default' | 'large' | 'extra-large';

// Export all icons
${exports.join('\n')}

export default Icon;
`;

fs.writeFileSync(indexFile, indexContent, 'utf-8');

console.log(`✅ Successfully generated ${svgFiles.length} icon components!`);
console.log(`📁 Output: ${iconsDir}`);
console.log(`📝 Index: ${indexFile}`);


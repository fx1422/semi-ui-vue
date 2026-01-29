/**
 * 文本截断的 JS 逻辑参考自 antd typography
 * https://github.com/ant-design/ant-design/blob/master/components/typography/util.tsx
 *
 */

import { omit } from 'lodash-es';

let ellipsisContainer: HTMLElement;

function pxToNumber(value: string): number {
    if (!value) {
        return 0;
    }
    const match = value.match(/^\d*(\.\d*)?/);
    return match ? Number(match[0]) : 0;
}

function styleToString(style: CSSStyleDeclaration): string {
    // Firefox 和 Chrome 之间存在一些不同的行为
    // 我们需要自己处理这些差异
    const styleNames = Array.prototype.slice.apply(style);
    return styleNames.map((name: string) => `${name}: ${style.getPropertyValue(name)};`).join('');
}

const getRenderText = (
    originEle: HTMLElement,
    rows: number,
    content = '',
    fixedContent: {
        expand: Node | null;
        copy: Node | null;
    },
    ellipsisStr: string,
    suffix: string,
    ellipsisPos: string,
    isStrong: boolean
): string => {
    if (content.length === 0) {
        return '';
    }
    if (!ellipsisContainer) {
        ellipsisContainer = document.createElement('div');
        ellipsisContainer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(ellipsisContainer);
    }

    // 获取原始样式
    const originStyle = window.getComputedStyle(originEle);
    const originCSS = styleToString(originStyle);
    const lineHeight = pxToNumber(originStyle.lineHeight);
    const maxHeight = Math.round(
        lineHeight * (rows + 1) + pxToNumber(originStyle.paddingTop) + pxToNumber(originStyle.paddingBottom)
    );

    // 设置阴影容器
    ellipsisContainer.setAttribute('style', originCSS);
    ellipsisContainer.style.position = 'fixed';
    ellipsisContainer.style.left = '0';
    // 当 window.getComputedStyle 得到的 width 值为 auto 时，通过 getBoundingClientRect 得到准确宽度
    if (originStyle.getPropertyValue('width') === 'auto' && originEle.offsetWidth) {
        ellipsisContainer.style.width = `${originEle.offsetWidth}px`;
    }
    ellipsisContainer.style.height = 'auto';
    ellipsisContainer.style.top = '-999999px';
    ellipsisContainer.style.zIndex = '-1000';
    if (isStrong) {
        ellipsisContainer.style.fontWeight = '600';
    }

    // 清理 CSS overflow 相关样式
    ellipsisContainer.style.textOverflow = 'clip';
    ellipsisContainer.style.webkitLineClamp = 'none';

    // 清空容器内容
    ellipsisContainer.innerHTML = '';

    // 检查测量容器中的省略内容是否足够显示完整内容
    function inRange(): boolean {
        // 如果内容由于换行策略而不换行，应通过宽度判断是否在范围内
        const widthInRange = ellipsisContainer.scrollWidth <= ellipsisContainer.offsetWidth;
        const heightInRange = ellipsisContainer.scrollHeight < maxHeight;

        return rows === 1 ? widthInRange && heightInRange : heightInRange;
    }

    // ========================= 查找匹配的省略内容 =========================
    const ellipsisContentHolder = document.createElement('span');
    const textNode = document.createTextNode(content);
    ellipsisContentHolder.appendChild(textNode);
    if (suffix.length > 0) {
        const ellipsisTextNode = document.createTextNode(suffix);
        ellipsisContentHolder.appendChild(ellipsisTextNode);
    }
    ellipsisContainer.appendChild(ellipsisContentHolder);

    Object.values(omit(fixedContent, 'expand')).forEach((node) => {
        if (node) {
            ellipsisContainer.appendChild((node as Node).cloneNode(true));
        }
    });

    function appendExpandNode() {
        ellipsisContainer.innerHTML = '';
        ellipsisContainer.appendChild(ellipsisContentHolder);
        Object.values(fixedContent).forEach((node) => {
            if (node) {
                ellipsisContainer.appendChild((node as Node).cloneNode(true));
            }
        });
    }

    function getCurrentText(text: string, pos: number): string {
        const end = text.length;
        if (!pos) {
            return ellipsisStr;
        }
        if (ellipsisPos === 'end') {
            return text.slice(0, pos) + ellipsisStr;
        }
        return text.slice(0, pos) + ellipsisStr + text.slice(end - pos, end);
    }

    function measureText(
        textNode: Text,
        fullText: string,
        startLoc = 0,
        endLoc = fullText.length,
        lastSuccessLoc = 0
    ): string {
        const midLoc = Math.floor((startLoc + endLoc) / 2);
        const currentText = getCurrentText(fullText, midLoc);
        textNode.textContent = currentText;
        if (startLoc >= endLoc - 1 && endLoc > 0) {
            for (let step = endLoc; step >= startLoc; step -= 1) {
                const currentStepText = getCurrentText(fullText, step);
                textNode.textContent = currentStepText;
                if (inRange()) {
                    return currentStepText;
                }
            }
        } else if (endLoc === 0) {
            return ellipsisStr;
        }

        if (inRange()) {
            return measureText(textNode, fullText, midLoc, endLoc, midLoc);
        }
        return measureText(textNode, fullText, startLoc, midLoc, lastSuccessLoc);
    }

    let resText = content;
    // 首先判断总文本长度，加上可能存在的 suffix、复制按钮长度，看结果是否符合预期
    // 如果不符合预期，则再加上展开按钮，找到最大符合尺寸的内容
    if (!inRange()) {
        appendExpandNode();
        resText = measureText(
            textNode,
            content,
            0,
            ellipsisPos === 'middle' ? Math.floor(content.length / 2) : content.length
        );
    }
    ellipsisContainer.innerHTML = '';
    return resText;
};

export default getRenderText;

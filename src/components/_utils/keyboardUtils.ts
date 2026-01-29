/**
 * 键盘按键码映射表
 * 用于兼容现代浏览器中已废弃的 keyCode 属性
 */
export const KEY_CODE = {
    ENTER: 13,
    BACKSPACE: 8,
    TAB: 9,
    ESCAPE: 27,
    SPACE: 32,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
} as const;

/**
 * 键名到键码的映射表
 */
const KEY_TO_CODE_MAP: Record<string, number> = {
    Enter: KEY_CODE.ENTER,
    Backspace: KEY_CODE.BACKSPACE,
    Tab: KEY_CODE.TAB,
    Escape: KEY_CODE.ESCAPE,
    Space: KEY_CODE.SPACE,
    ' ': KEY_CODE.SPACE,
    ArrowLeft: KEY_CODE.ARROW_LEFT,
    ArrowUp: KEY_CODE.ARROW_UP,
    ArrowRight: KEY_CODE.ARROW_RIGHT,
    ArrowDown: KEY_CODE.ARROW_DOWN,
};

/**
 * 规范化键盘事件,确保事件对象包含 keyCode 属性
 *
 * 现代浏览器中 keyCode 已废弃,但 Foundation 层依赖 keyCode
 * 此函数会从 event.key 或 event.code 转换为 keyCode
 *
 * @param event - 原始键盘事件
 * @returns 包含 keyCode 的事件对象
 *
 * @example
 * ```typescript
 * const handleKeyDown = (e: KeyboardEvent) => {
 *     const normalizedEvent = normalizeKeyboardEvent(e);
 *     if (normalizedEvent.keyCode === KEY_CODE.ENTER) {
 *         // 处理回车键
 *     }
 * };
 * ```
 */
export function normalizeKeyboardEvent(event: KeyboardEvent): KeyboardEvent & { keyCode: number } {
    const evt = event as any;

    // 如果已经有有效的 keyCode,直接返回
    if ('keyCode' in evt && evt.keyCode !== undefined && evt.keyCode !== null) {
        return evt;
    }

    // 从 event.key 转换
    if (evt.key) {
        evt.keyCode = KEY_TO_CODE_MAP[evt.key] || 0;
    }
    // 从 event.code 转换
    else if (evt.code) {
        evt.keyCode = KEY_TO_CODE_MAP[evt.code] || 0;
    }
    // 都没有,设为 0
    else {
        evt.keyCode = 0;
    }

    return evt;
}

/**
 * 检查是否按下了指定的键
 *
 * @param event - 键盘事件
 * @param keyCode - 要检查的键码
 * @returns 是否按下了指定的键
 *
 * @example
 * ```typescript
 * const handleKeyDown = (e: KeyboardEvent) => {
 *     if (isKeyPressed(e, KEY_CODE.ENTER)) {
 *         // 处理回车键
 *     }
 * };
 * ```
 */
export function isKeyPressed(event: KeyboardEvent, keyCode: number): boolean {
    const normalizedEvent = normalizeKeyboardEvent(event);
    return normalizedEvent.keyCode === keyCode;
}

/**
 * 检查是否按下了回车键
 *
 * @param event - 键盘事件
 * @returns 是否按下了回车键
 */
export function isEnterPressed(event: KeyboardEvent): boolean {
    return isKeyPressed(event, KEY_CODE.ENTER) || event.key === 'Enter';
}

/**
 * 检查是否按下了退格键
 *
 * @param event - 键盘事件
 * @returns 是否按下了退格键
 */
export function isBackspacePressed(event: KeyboardEvent): boolean {
    return isKeyPressed(event, KEY_CODE.BACKSPACE) || event.key === 'Backspace';
}

/**
 * 检查是否按下了 Escape 键
 *
 * @param event - 键盘事件
 * @returns 是否按下了 Escape 键
 */
export function isEscapePressed(event: KeyboardEvent): boolean {
    return isKeyPressed(event, KEY_CODE.ESCAPE) || event.key === 'Escape';
}

/**
 * 检查是否按下了 Tab 键
 *
 * @param event - 键盘事件
 * @returns 是否按下了 Tab 键
 */
export function isTabPressed(event: KeyboardEvent): boolean {
    return isKeyPressed(event, KEY_CODE.TAB) || event.key === 'Tab';
}

/**
 * 检查是否按下了空格键
 *
 * @param event - 键盘事件
 * @returns 是否按下了空格键
 */
export function isSpacePressed(event: KeyboardEvent): boolean {
    return isKeyPressed(event, KEY_CODE.SPACE) || event.key === ' ' || event.key === 'Space';
}

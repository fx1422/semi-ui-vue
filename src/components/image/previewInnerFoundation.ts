/**
 * Vue 版本的 PreviewInnerFoundation 扩展
 * 覆盖 handleMouseUp 方法以支持 Vue 组件中的 isValidTarget 检查
 */
import PreviewInnerFoundation from '@douyinfe/semi-foundation/image/previewInnerFoundation';
import type { PreviewInnerAdapter, RatioType } from '@douyinfe/semi-foundation/image/previewInnerFoundation';
import { isTargetEmit } from '@douyinfe/semi-foundation/image/utils';

const NOT_CLOSE_TARGETS = ['icon', 'footer'];

export default class VuePreviewInnerFoundation<
    P = Record<string, any>,
    S = Record<string, any>,
> extends PreviewInnerFoundation<P, S> {
    handleMouseUp = (e: any) => {
        const { maskClosable } = this.getProps();
        if (!maskClosable) {
            return;
        }

        // 使用 isValidTarget 检查是否点击在操作区域（header、footer、leftIcon、rightIcon）
        // isValidTarget 返回 true 表示点击在预览区域（可以关闭），返回 false 表示点击在操作区域（不能关闭）
        // Use isValidTarget to check if clicking in the operation area (header, footer, leftIcon, rightIcon)
        // isValidTarget returns true if clicking in preview area (can close), false if clicking in operation area (cannot close)
        const isValidTarget = this._adapter.isValidTarget(e);
        if (!isValidTarget) {
            // 点击在操作区域，不关闭
            return;
        }

        // 同时使用 isTargetEmit 作为备用检查（检查 className 中是否包含 "icon" 或 "footer"）
        // Also use isTargetEmit as a fallback check (check if className contains "icon" or "footer")
        const isTargetEmitResult = isTargetEmit(e, NOT_CLOSE_TARGETS);
        if (isTargetEmitResult) {
            // 点击在操作区域，不关闭
            return;
        }

        const { clientX, clientY } = e;
        const { x, y } = this._startMouseDown;
        // 对鼠标移动做容错处理，当 x 和 y 方向在 mouseUp 的时候移动距离都小于等于 5px 时候就可以关闭预览
        // Error-tolerant processing of mouse movement, when the movement distance in the x and y directions is less than or equal to 5px in mouseUp, the preview can be closed
        // 不做容错处理的话，直接用 clientX !== x || y !== clientY 做判断，鼠标在用户点击时候无意识的轻微移动无法关闭预览，不符合用户预期
        // If you do not do fault-tolerant processing, but directly use clientX !== x || y !== clientY to make judgments, the slight movement of the mouse when the user clicks will not be able to close the preview, which does not meet the user's expectations.
        if (Math.abs(clientX - x) > 5 || Math.abs(y - clientY) > 5) {
            return;
        }

        // 所有检查都通过，可以关闭
        this._adapter.notifyVisibleChange(false);
    };
}

// 重新导出类型（使用 export type 因为它们是类型，不是值）
export type { PreviewInnerAdapter, RatioType };

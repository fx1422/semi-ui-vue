import {
    hexToHsva,
    hexToRgba,
    hsvaStringToHsva,
    hsvaToHex,
    hsvaToRgba,
    rgbaStringToHsva,
    rgbaStringToRgba,
    rgbaToHex,
    rgbStringToHsva,
    rgbStringToRgba,
} from '@douyinfe/semi-foundation/colorPicker/utils/convert';
import type { ColorValue } from './interface';

export const colorStringToValue = (raw: string): ColorValue => {
    if (raw.startsWith('#')) {
        return {
            hsva: hexToHsva(raw),
            rgba: hexToRgba(raw),
            hex: raw,
        };
    } else if (raw.startsWith('rgba')) {
        const rgba = rgbaStringToRgba(raw);
        return {
            hsva: rgbaStringToHsva(raw),
            rgba: rgba,
            hex: rgbaToHex(rgba),
        };
    } else if (raw.startsWith('rgb')) {
        const rgba = rgbStringToRgba(raw);
        return {
            hsva: rgbStringToHsva(raw),
            rgba: rgba,
            hex: rgbaToHex(rgba),
        };
    } else if (raw.startsWith('hsv')) {
        const hsva = hsvaStringToHsva(raw);
        const rgba = hsvaToRgba(hsva);
        const hex = hsvaToHex(hsva);
        return {
            hsva,
            rgba,
            hex,
        };
    } else {
        throw new Error('Semi ColorPicker: error on static colorStringToValue method, input value is invalid: ' + raw);
    }
};

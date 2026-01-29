import type { CSSProperties, VNode } from 'vue';
import type {
    BaseFileItem,
    FileItemStatus,
    BeforeUploadObjectResult,
    AfterUploadResult,
} from '@douyinfe/semi-foundation/upload/foundation';
import { strings } from '@douyinfe/semi-foundation/upload/constants';
import type { Locale } from '../locale/interface';

export type PromptPositionType = (typeof strings.PROMPT_POSITION)[number];
export type UploadListType = (typeof strings.LIST_TYPE)[number];

export interface BeforeUploadProps {
    file: FileItem;
    fileList: Array<FileItem>;
}

export interface AfterUploadProps {
    file: FileItem;
    fileList: Array<FileItem>;
    response: any;
}

export interface OnChangeProps {
    fileList: Array<FileItem>;
    currentFile: FileItem;
}

export interface CustomRequestArgs {
    fileName: string;
    data: Record<string, any>;
    file: FileItem;
    fileInstance: File;
    onProgress: (e?: { total: number; loaded: number }) => any;
    onError: (userXhr: { status?: number }, e?: Event) => any;
    onSuccess: (response: any, e?: Event) => any;
    withCredentials: boolean;
    action: string;
}

export interface CustomError extends Error {
    status: number;
    method: string;
    url: string;
}

export interface FileItem extends BaseFileItem {
    validateMessage?: VNode | string;
}

export interface RenderFileItemProps extends FileItem {
    index?: number;
    previewFile?: (fileItem: RenderFileItemProps) => VNode;
    listType: UploadListType;
    onRemove: () => void;
    onRetry: () => void;
    onReplace: () => void;
    key: string;
    showPicInfo?: boolean;
    renderPicInfo?: (renderFileItemProps: RenderFileItemProps) => VNode;
    renderPicPreviewIcon?: (renderFileItemProps: RenderFileItemProps) => VNode;
    renderFileOperation?: (fileItem: RenderFileItemProps) => VNode;
    showRetry?: boolean;
    showReplace?: boolean;
    style?: CSSProperties;
    disabled: boolean;
    onPreviewClick: () => void;
}

export interface RenderPictureCloseProps {
    className: string;
    remove: (e: MouseEvent) => void;
}

export type { FileItemStatus, BeforeUploadObjectResult, AfterUploadResult };

export interface UploadProps {
    accept?: string;
    action: string;
    afterUpload?: (object: AfterUploadProps) => any;
    beforeUpload?: (object: BeforeUploadProps) => any | Promise<any> | boolean;
    beforeClear?: (fileList: Array<FileItem>) => boolean | Promise<boolean>;
    beforeRemove?: (file: FileItem, fileList: Array<FileItem>) => boolean | Promise<boolean>;
    capture?: boolean | 'user' | 'environment' | undefined;
    children?: VNode;
    className?: string;
    customRequest?: (object: CustomRequestArgs) => void;
    data?: Record<string, any> | ((file: File) => Record<string, unknown>);
    defaultFileList?: Array<FileItem>;
    directory?: boolean;
    disabled?: boolean;
    dragIcon?: VNode;
    dragMainText?: VNode | string;
    dragSubText?: VNode | string;
    draggable?: boolean;
    addOnPasting?: boolean;
    fileList?: Array<FileItem>;
    fileName?: string;
    headers?: Record<string, any> | ((file: File) => Record<string, string>);
    hotSpotLocation?: 'start' | 'end';
    itemStyle?: CSSProperties;
    limit?: number;
    listType?: UploadListType;
    maxSize?: number;
    minSize?: number;
    multiple?: boolean;
    name?: string;
    onAcceptInvalid?: (files: File[]) => void;
    onChange?: (object: OnChangeProps) => void;
    onClear?: () => void;
    onDrop?: (e: Event, files: Array<File>, fileList: Array<FileItem>) => void;
    onError?: (e: CustomError, file: File, fileList: Array<FileItem>, xhr: XMLHttpRequest) => void;
    onPastingError?: (error: Error | PermissionStatus) => void;
    onExceed?: (fileList: Array<File>) => void;
    onFileChange?: (files: Array<File>) => void;
    onOpenFileDialog?: () => void;
    onPreviewClick?: (fileItem: FileItem) => void;
    onProgress?: (percent: number, file: File, fileList: Array<FileItem>) => void;
    onRemove?: (currentFile: File, fileList: Array<FileItem>, currentFileItem: FileItem) => void;
    onRetry?: (fileItem: FileItem) => void;
    onSizeError?: (file: File, fileList: Array<FileItem>) => void;
    onSuccess?: (responseBody: any, file: File, fileList: Array<FileItem>) => void;
    previewFile?: (renderFileItemProps: RenderFileItemProps) => VNode;
    prompt?: VNode | string;
    promptPosition?: PromptPositionType;
    picHeight?: string | number;
    picWidth?: string | number;
    renderFileItem?: (renderFileItemProps: RenderFileItemProps) => VNode;
    renderPicInfo?: (renderFileItemProps: RenderFileItemProps) => VNode;
    renderThumbnail?: (renderFileItemProps: RenderFileItemProps) => VNode;
    renderPicPreviewIcon?: (renderFileItemProps: RenderFileItemProps) => VNode;
    renderPicClose?: (renderPicCloseProps: RenderPictureCloseProps) => VNode;
    renderFileOperation?: (fileItem: RenderFileItemProps) => VNode;
    showClear?: boolean;
    showPicInfo?: boolean;
    showReplace?: boolean;
    showRetry?: boolean;
    showUploadList?: boolean;
    style?: CSSProperties;
    timeout?: number;
    transformFile?: (file: File) => FileItem;
    uploadTrigger?: 'auto' | 'custom';
    validateMessage?: VNode | string;
    validateStatus?: 'default' | 'error' | 'warning' | 'success';
    withCredentials?: boolean;
    showTooltip?: boolean | any;
    locale?: Locale['Upload'];
}

export interface UploadState {
    dragAreaStatus: 'default' | 'legal' | 'illegal';
    fileList: Array<FileItem>;
    inputKey: number;
    localUrls: Array<string>;
    replaceIdx: number;
    replaceInputKey: number;
}

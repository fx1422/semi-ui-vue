import BaseUpload from './Upload.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';
import type {
    UploadProps,
    UploadState,
    FileItem,
    FileItemStatus,
    RenderFileItemProps,
    UploadListType,
    PromptPositionType,
    BeforeUploadProps,
    AfterUploadProps,
    OnChangeProps,
    CustomRequestArgs,
    CustomError,
    BeforeUploadObjectResult,
    AfterUploadResult,
} from './interface';

// 导入样式（自动引入）
import './upload.scss';

const Upload = createFieldEnhancer(BaseUpload, 'SemiUpload');

export type {
    UploadProps,
    UploadState,
    FileItem,
    FileItemStatus,
    RenderFileItemProps,
    UploadListType,
    PromptPositionType,
    BeforeUploadProps,
    AfterUploadProps,
    OnChangeProps,
    CustomRequestArgs,
    CustomError,
    BeforeUploadObjectResult,
    AfterUploadResult,
};

export default Upload;

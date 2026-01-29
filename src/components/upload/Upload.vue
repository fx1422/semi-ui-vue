<template>
    <div :class="uploadCls" :style="style as any" :x-prompt-pos="promptPosition" v-bind="getDataAttr()">
        <input
            :key="state.inputKey"
            ref="inputRef"
            :capture="capture"
            :multiple="multiple"
            :accept="accept"
            type="file"
            autocomplete="off"
            tabindex="-1"
            :class="inputCls"
            v-bind="dirProps"
            @change="onChange"
        />
        <input
            :key="state.replaceInputKey"
            ref="replaceInputRef"
            :multiple="false"
            :accept="accept"
            type="file"
            autocomplete="off"
            tabindex="-1"
            :class="inputReplaceCls"
            @change="onReplaceChange"
        />

        <div
            v-if="listType !== 'picture' && !draggable"
            role="button"
            tabindex="0"
            :aria-disabled="disabled"
            :class="`${prefixCls}-add`"
            @click="onClick"
        >
            <slot />
        </div>

        <div
            v-if="draggable"
            role="button"
            tabindex="0"
            :aria-disabled="disabled"
            :class="dragAreaCls"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @dragenter="onDragEnter"
            @click="onClick"
        >
            <slot v-if="slots.default" />
            <template v-else>
                <div :class="`${prefixCls}-drag-area-icon`">
                    <IconUpload size="extra-large" />
                </div>
                <div :class="`${prefixCls}-drag-area-text`">
                    <div :class="`${prefixCls}-drag-area-main-text`" x-semi-prop="dragMainText">
                        {{ dragMainText || getLocaleValue(undefined, 'mainText') }}
                    </div>
                    <div :class="`${prefixCls}-drag-area-sub-text`" x-semi-prop="dragSubText">
                        {{ dragSubText }}
                    </div>
                    <div :class="`${prefixCls}-drag-area-tips`">
                        <span v-if="state.dragAreaStatus === 'legal'" :class="`${prefixCls}-drag-area-tips-legal`">
                            {{ getLocaleValue(undefined, 'legalTips') }}
                        </span>
                        <span v-if="state.dragAreaStatus === 'illegal'" :class="`${prefixCls}-drag-area-tips-illegal`">
                            {{ getLocaleValue(undefined, 'illegalTips') }}
                        </span>
                    </div>
                </div>
            </template>
        </div>

        <div v-if="$slots.prompt || prompt" :class="promptCls" x-semi-prop="prompt">
            <slot v-if="$slots.prompt" name="prompt" />
            <template v-else>{{ prompt }}</template>
        </div>

        <div v-if="validateMessage" :class="validateMsgCls" x-semi-prop="validateMessage">
            {{ validateMessage }}
        </div>

        <template v-if="listType === 'picture'">
            <div
                v-if="!showUploadList || !fileList.length"
                v-show="showAddTriggerInList"
                :class="addContentCls"
                role="button"
                tabindex="0"
                :aria-disabled="disabled"
                @click="onClick"
                @drop="onDrop"
                @dragover="onDragOver"
                @dragleave="onDragLeave"
                @dragenter="onDragEnter"
            >
                <slot />
            </div>
            <div v-else :class="fileListCls">
                <div :class="`${prefixCls}-file-list-main`" role="list" aria-label="picture list">
                    <div
                        v-if="showAddTriggerInList && hotSpotLocation === 'start'"
                        :class="addContentCls"
                        role="button"
                        tabindex="0"
                        :aria-disabled="disabled"
                        @click="onClick"
                        @drop="onDrop"
                        @dragover="onDragOver"
                        @dragleave="onDragLeave"
                        @dragenter="onDragEnter"
                    >
                        <slot />
                    </div>
                    <template v-if="renderFileItem">
                        <component
                            :is="() => renderFileItem(getFileItemProps(file, index))"
                            v-for="(file, index) in fileList"
                            :key="file.uid || `${file.name}${index}`"
                        />
                    </template>
                    <template v-else>
                        <div
                            v-for="(file, index) in fileList"
                            :key="file.uid || `${file.name}${index}`"
                            :class="getFileCardClass(file, 'picture')"
                            :style="getFileCardStyle(file)"
                            role="listitem"
                            @click="handlePreviewClickWrapper(file)"
                        >
                            <template v-if="slots.thumbnail">
                                <slot name="thumbnail" v-bind="getFileItemProps(file, index)" />
                            </template>
                            <template v-else-if="props.renderThumbnail">
                                <component :is="() => props.renderThumbnail!(getFileItemProps(file, index))" />
                            </template>
                            <img
                                v-else-if="file.url && file.preview && !fallbackPreview[file.uid]"
                                :src="file.url"
                                :alt="file.name"
                                :style="getImageStyle(file)"
                                @error="() => handleImageError(file)"
                            />
                            <IconFile v-else size="large" />

                            <Progress
                                v-if="showProgress(file)"
                                :percent="file.percent || 0"
                                type="circle"
                                size="small"
                                :orbitStroke="'#FFF'"
                                aria-label="uploading file progress"
                            />

                            <div
                                v-if="showRetryButton(file)"
                                role="button"
                                tabindex="0"
                                :class="`${prefixCls}-picture-file-card-retry`"
                                @click.stop="handleRetry(file)"
                            >
                                <IconRefresh :class="`${prefixCls}-picture-file-card-icon-retry`" />
                            </div>

                            <Tooltip
                                v-if="showReplaceButton(file)"
                                trigger="hover"
                                position="top"
                                :content="getLocaleValue(undefined, 'replace')"
                                :showArrow="false"
                                :spacing="4"
                            >
                                <div
                                    role="button"
                                    tabindex="0"
                                    :class="`${prefixCls}-picture-file-card-replace`"
                                    @click.stop="handleReplace(index)"
                                >
                                    <ReplaceSvg :class="`${prefixCls}-picture-file-card-icon-replace`" />
                                </div>
                            </Tooltip>

                            <div
                                v-if="file.status === strings.FILE_STATUS_SUCCESS && !props.showReplace"
                                :class="`${prefixCls}-picture-file-card-preview`"
                            >
                                <component
                                    :is="() => renderPicPreviewIcon(getFileItemProps(file, index))"
                                    v-if="renderPicPreviewIcon"
                                />
                            </div>

                            <template v-if="renderPicClose">
                                <component
                                    :is="
                                        () =>
                                            renderPicClose({
                                                className: `${prefixCls}-picture-file-card-close`,
                                                remove: (e: MouseEvent) => remove(file),
                                            })
                                    "
                                />
                            </template>
                            <div
                                v-else-if="!disabled"
                                role="button"
                                tabindex="0"
                                :class="`${prefixCls}-picture-file-card-close`"
                                @click.stop="remove(file)"
                            >
                                <IconClear :class="`${prefixCls}-picture-file-card-icon-close`" />
                            </div>

                            <template v-if="renderPicInfo">
                                <component :is="() => renderPicInfo(getFileItemProps(file, index))" />
                            </template>
                            <div v-else-if="showPicInfo" :class="`${prefixCls}-picture-file-card-pic-info`">
                                {{ index + 1 }}
                            </div>

                            <div v-if="getValidateMessage(file)" :class="`${prefixCls}-file-card-validate-message`">
                                {{ getValidateMessage(file) }}
                            </div>
                        </div>
                    </template>
                    <div
                        v-if="showAddTriggerInList && hotSpotLocation === 'end'"
                        :class="addContentCls"
                        role="button"
                        tabindex="0"
                        :aria-disabled="disabled"
                        @click="onClick"
                        @drop="onDrop"
                        @dragover="onDragOver"
                        @dragleave="onDragLeave"
                        @dragenter="onDragEnter"
                    >
                        <slot />
                    </div>
                </div>
            </div>
        </template>

        <div v-if="listType !== 'picture' && showUploadList && fileList.length" :class="fileListCls">
            <div v-if="limit !== 1 && fileList.length" :class="`${prefixCls}-file-list-title`">
                <span :class="`${prefixCls}-file-list-title-choosen`">
                    {{ getLocaleValue(undefined, 'selectedFiles') }}
                </span>
                <span
                    v-if="showClear && !disabled"
                    role="button"
                    tabindex="0"
                    :class="`${prefixCls}-file-list-title-clear`"
                    @click="clear"
                >
                    {{ getLocaleValue(undefined, 'clear') }}
                </span>
            </div>

            <div :class="`${prefixCls}-file-list-main`" role="list" aria-label="file list">
                <template v-if="renderFileItem">
                    <component
                        :is="() => renderFileItem(getFileItemProps(file, index))"
                        v-for="(file, index) in fileList"
                        :key="file.uid || `${file.name}${index}`"
                    />
                </template>
                <template v-else>
                    <div
                        v-for="(file, index) in fileList"
                        :key="file.uid || `${file.name}${index}`"
                        :class="getFileCardClass(file, 'list')"
                        :style="props.itemStyle as any"
                        role="listitem"
                        @click="handlePreviewClickWrapper(file)"
                    >
                        <div
                            :class="[
                                `${prefixCls}-file-card-preview`,
                                {
                                    [`${prefixCls}-file-card-preview-placeholder`]:
                                        !file.preview ||
                                        slots.preview ||
                                        props.previewFile ||
                                        fallbackPreview[file.uid],
                                },
                            ]"
                        >
                            <template v-if="slots.preview">
                                <slot name="preview" v-bind="getFileItemProps(file, index)" />
                            </template>
                            <template v-else-if="props.previewFile">
                                <component :is="() => props.previewFile!(getFileItemProps(file, index))" />
                            </template>
                            <img
                                v-else-if="file.url && file.preview && !fallbackPreview[file.uid]"
                                :src="file.url"
                                :alt="file.name"
                                @error="() => handleImageError(file)"
                            />
                            <IconFile v-else size="large" />
                        </div>
                        <div :class="`${prefixCls}-file-card-info-main`">
                            <div :class="`${prefixCls}-file-card-info-main-text`">
                                <TypographyText
                                    :class="`${prefixCls}-file-card-info-name`"
                                    :ellipsis="{
                                        showTooltip: props.showTooltip !== undefined ? props.showTooltip : true,
                                    }"
                                    :style="{
                                        minWidth: 0,
                                        width: 0,
                                        flex: '1 1 0%',
                                        maxWidth: '100%',
                                    }"
                                    type="primary"
                                >
                                    {{ file.name }}
                                </TypographyText>
                                <span>
                                    <span :class="`${prefixCls}-file-card-info-size`">
                                        {{ formatFileSize(file.size) }}
                                    </span>
                                    <Tooltip
                                        v-if="showReplaceButton(file)"
                                        trigger="hover"
                                        position="top"
                                        :showArrow="false"
                                        :content="getLocaleValue(undefined, 'replace')"
                                    >
                                        <Button
                                            type="tertiary"
                                            theme="borderless"
                                            size="small"
                                            :icon="DirectorySvg"
                                            :class="`${prefixCls}-file-card-replace`"
                                            @click.stop="handleReplace(index)"
                                        />
                                    </Tooltip>
                                </span>
                            </div>
                            <Progress
                                v-if="showProgress(file)"
                                :percent="file.percent || 0"
                                style="width: 100%"
                                aria-label="uploading file progress"
                            />
                            <div :class="`${prefixCls}-file-card-info-main-control`">
                                <span
                                    v-if="getValidateMessage(file)"
                                    :class="`${prefixCls}-file-card-info-validate-message`"
                                >
                                    {{ getValidateMessage(file) }}
                                </span>
                                <span
                                    v-if="showRetryButton(file)"
                                    role="button"
                                    tabindex="0"
                                    :class="`${prefixCls}-file-card-info-retry`"
                                    @click.stop="handleRetry(file)"
                                >
                                    {{ getLocaleValue(undefined, 'retry') }}
                                </span>
                            </div>
                        </div>
                        <template v-if="slots['file-operation']">
                            <slot name="file-operation" v-bind="getFileItemProps(file, index)" />
                        </template>
                        <template v-else-if="props.renderFileOperation">
                            <component :is="() => props.renderFileOperation!(getFileItemProps(file, index))" />
                        </template>
                        <Button
                            v-else
                            type="tertiary"
                            theme="borderless"
                            size="small"
                            :icon="IconClose"
                            :class="`${prefixCls}-file-card-close`"
                            @click.stop="remove(file)"
                        />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useBaseComponent, useFoundation } from '../_utils';
import UploadFoundation from '@douyinfe/semi-foundation/upload/foundation';
import { cssClasses, strings } from '@douyinfe/semi-foundation/upload/constants';
import type { UploadProps, UploadState, FileItem, RenderFileItemProps } from './interface';
import type { Locale } from '../locale/interface';
import { IconUpload, IconFile, IconClose, IconRefresh, IconClear } from '../icons';
import Progress from '../progress';
import Button from '../button';
import Tooltip from '../tooltip';
import TypographyText from '../typography/Text.vue';
import { h, ref, computed, reactive, watch, nextTick, useSlots } from 'vue';
import { useLocale } from '../_utils/useLocale';

const prefixCls = cssClasses.PREFIX;

type UploadLocale = Locale['Upload'];

const props = withDefaults(defineProps<UploadProps>(), {
    defaultFileList: () => [],
    disabled: false,
    listType: 'list' as const,
    hotSpotLocation: 'end',
    multiple: false,
    onAcceptInvalid: () => {},
    onChange: () => {},
    beforeRemove: () => true,
    beforeClear: () => true,
    onClear: () => {},
    onDrop: () => {},
    onError: () => {},
    onExceed: () => {},
    onFileChange: () => {},
    onOpenFileDialog: () => {},
    onProgress: () => {},
    onRemove: () => {},
    onRetry: () => {},
    onSizeError: () => {},
    onSuccess: () => {},
    onPastingError: () => {},
    promptPosition: 'right' as const,
    showClear: true,
    showPicInfo: false,
    showReplace: false,
    showRetry: true,
    showUploadList: true,
    uploadTrigger: 'auto' as const,
    withCredentials: false,
    showTooltip: true,
});

const localeConfig = useLocale({
    componentName: 'Upload',
    locale: props.locale,
});
const currentLocale = computed(() => localeConfig.value.locale);

const getLocaleValue = (locale: UploadLocale | undefined, key: keyof UploadLocale): string => {
    return locale?.[key] || currentLocale.value[key];
};

const emit = defineEmits<{
    change: [object: { fileList: FileItem[]; currentFile: FileItem }];
    fileChange: [files: File[]];
    error: [error: any, file: File, fileList: FileItem[], xhr: XMLHttpRequest];
    success: [responseBody: any, file: File, fileList: FileItem[]];
    progress: [percent: number, file: File, fileList: FileItem[]];
    remove: [currentFile: File, fileList: FileItem[], currentFileItem: FileItem];
    sizeError: [file: File, fileList: FileItem[]];
    exceed: [fileList: File[]];
    clear: [];
    previewClick: [fileItem: FileItem];
    drop: [e: Event, files: File[], fileList: FileItem[]];
    acceptInvalid: [files: File[]];
    retry: [fileItem: FileItem];
    pastingError: [error: Error | PermissionStatus];
}>();

const state = reactive<UploadState>({
    fileList: props.defaultFileList || [],
    replaceIdx: -1,
    inputKey: Math.random(),
    replaceInputKey: Math.random(),
    dragAreaStatus: 'default',
    localUrls: [],
});

const inputRef = ref<HTMLInputElement>();
const replaceInputRef = ref<HTMLInputElement>();
const slots = useSlots();
const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const uploadCls = computed(() => {
    return [
        prefixCls,
        {
            [`${prefixCls}-picture`]: props.listType === 'picture',
            [`${prefixCls}-disabled`]: props.disabled,
            [`${prefixCls}-default`]: props.validateStatus === 'default',
            [`${prefixCls}-error`]: props.validateStatus === 'error',
            [`${prefixCls}-warning`]: props.validateStatus === 'warning',
            [`${prefixCls}-success`]: props.validateStatus === 'success',
        },
        props.className,
    ].filter(Boolean);
});

const inputCls = computed(() => `${prefixCls}-hidden-input`);
const inputReplaceCls = computed(() => `${prefixCls}-hidden-input-replace`);
const promptCls = computed(() => `${prefixCls}-prompt`);
const validateMsgCls = computed(() => `${prefixCls}-validate-message`);

const dirProps = computed(() => {
    return props.directory ? { directory: 'directory', webkitdirectory: 'webkitdirectory' } : {};
});

// File list from props or state
const fileList = computed<FileItem[]>(() => {
    const list = props.fileList || state.fileList;
    // Ensure fileList is always an array
    return Array.isArray(list) ? list : [];
});

const showAddTriggerInList = computed(() => {
    return props.limit ? props.limit > fileList.value.length : true;
});

const addContentCls = computed(() => {
    const baseCls = `${prefixCls}-add`;
    return [
        baseCls,
        `${baseCls}-picture-add`,
        {
            [`${baseCls}-picture-add-disabled`]: props.disabled,
            [`${prefixCls}-drag-area-legal`]: props.draggable && state.dragAreaStatus === 'legal',
            [`${prefixCls}-drag-area-illegal`]: props.draggable && state.dragAreaStatus === 'illegal',
        },
    ].filter(Boolean);
});

// Computed drag area classes
const dragAreaCls = computed(() => {
    const dragAreaBaseCls = `${prefixCls}-drag-area`;
    return [
        dragAreaBaseCls,
        {
            [`${dragAreaBaseCls}-legal`]: state.dragAreaStatus === 'legal',
            [`${dragAreaBaseCls}-illegal`]: state.dragAreaStatus === 'illegal',
            [`${dragAreaBaseCls}-custom`]: !!slots.default,
        },
    ].filter(Boolean);
});

const fileListCls = computed(() => {
    return [
        `${prefixCls}-file-list`,
        {
            [`${prefixCls}-picture-file-list`]: props.listType === 'picture',
        },
    ].filter(Boolean);
});

const adapter = {
    ...baseAdapter,
    notifyFileSelect: (files: File[]) => {
        emit('fileChange', files);
    },
    notifyError: (error: any, fileInstance: File, fileList: FileItem[], xhr: XMLHttpRequest) => {
        emit('error', error, fileInstance, fileList, xhr);
    },
    notifySuccess: (responseBody: any, file: File, fileList: FileItem[]) => {
        emit('success', responseBody, file, fileList);
    },
    notifyProgress: (percent: number, file: File, fileList: FileItem[]) => {
        emit('progress', percent, file, fileList);
    },
    notifyRemove: (file: File, fileList: FileItem[], fileItem: FileItem) => {
        emit('remove', file, fileList, fileItem);
    },
    notifySizeError: (file: File, fileList: FileItem[]) => {
        emit('sizeError', file, fileList);
    },
    notifyExceed: (files: File[]) => {
        emit('exceed', files);
    },
    updateFileList: (fileList: FileItem[], cb?: () => void) => {
        const list = Array.isArray(fileList) ? fileList : [];
        if (typeof cb === 'function') {
            state.fileList = list;
            nextTick(cb);
        } else {
            state.fileList = list;
        }
    },
    notifyBeforeUpload: ({ file, fileList }: { file: FileItem; fileList: FileItem[] }) => {
        return props.beforeUpload?.({ file, fileList });
    },
    notifyAfterUpload: ({ response, file, fileList }: { response: any; file: FileItem; fileList: FileItem[] }) => {
        return props.afterUpload?.({ response, file, fileList });
    },
    resetInput: () => {
        state.inputKey = Math.random();
    },
    resetReplaceInput: () => {
        state.replaceInputKey = Math.random();
    },
    updateDragAreaStatus: (dragAreaStatus: string) => {
        state.dragAreaStatus = dragAreaStatus as 'default' | 'legal' | 'illegal';
    },
    notifyBeforeRemove: (file: FileItem, fileList: FileItem[]) => {
        return props.beforeRemove?.(file, fileList);
    },
    notifyBeforeClear: (fileList: FileItem[]) => {
        return props.beforeClear?.(fileList);
    },
    notifyChange: ({ currentFile, fileList }: { currentFile: FileItem | null; fileList: FileItem[] }) => {
        emit('change', { currentFile, fileList });
    },
    updateLocalUrls: (urls: string[]) => {
        state.localUrls = urls;
    },
    notifyClear: () => {
        emit('clear');
    },
    notifyPreviewClick: (file: any) => {
        if (props.onPreviewClick) {
            props.onPreviewClick(file);
        }
        emit('previewClick', file);
    },
    notifyDrop: (e: any, files: File[], fileList: FileItem[]) => {
        emit('drop', e, files, fileList);
    },
    notifyAcceptInvalid: (invalidFiles: File[]) => {
        emit('acceptInvalid', invalidFiles);
    },
    registerPastingHandler: (cb?: (e: KeyboardEvent) => void) => {
        if (cb) {
            document.body.addEventListener('keydown', cb);
            (window as any)._semiUploadPastingCb = cb;
        }
    },
    unRegisterPastingHandler: () => {
        const cb = (window as any)._semiUploadPastingCb;
        if (cb) {
            document.body.removeEventListener('keydown', cb);
            delete (window as any)._semiUploadPastingCb;
        }
    },
    isMac: () => {
        return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    },
    notifyPastingError: (error: Error | PermissionStatus) => {
        emit('pastingError', error);
    },
};

const { foundation } = useFoundation(UploadFoundation, adapter);

const onClick = () => {
    const { onOpenFileDialog } = props;
    if (props.disabled || !inputRef.value) {
        return;
    }
    inputRef.value.click();
    if (onOpenFileDialog && typeof onOpenFileDialog === 'function') {
        onOpenFileDialog();
    }
};

const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const { files } = target;
    if (files) {
        foundation.handleChange(files);
    }
};

const onReplaceChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const { files } = target;
    if (files) {
        foundation.handleReplaceChange(files);
    }
};

const clear = () => {
    foundation.handleClear();
};

const remove = (fileItem: FileItem) => {
    foundation.handleRemove(fileItem);
};

const onDrop = (e: DragEvent) => {
    foundation.handleDrop(e);
};

const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    foundation.handleDragOver(e);
};

const onDragLeave = (e: DragEvent) => {
    foundation.handleDragLeave(e);
};

const onDragEnter = (e: DragEvent) => {
    foundation.handleDragEnter(e);
};

const fallbackPreview = reactive<Record<string, boolean>>({});

const ReplaceSvg = (props: any = {}) => {
    return h(
        'svg',
        {
            focusable: false,
            'aria-hidden': true,
            width: '28',
            height: '28',
            viewBox: '0 0 28 28',
            fill: 'none',
            xmlns: 'http://www.w3.org/2000/svg',
            ...props,
        },
        [
            h('circle', { cx: '14', cy: '14', r: '14', fill: '#16161A', fillOpacity: '0.6' }),
            h('path', {
                d: 'M9 10.25V18.25L10.25 13.25H17.875V11.75C17.875 11.4739 17.6511 11.25 17.375 11.25H14L12.75 9.75H9.5C9.22386 9.75 9 9.97386 9 10.25Z',
                stroke: 'currentColor',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            }),
            h('path', {
                d: 'M18 18.25L19 13.25H10.2031L9 18.25H18Z',
                stroke: 'currentColor',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            }),
        ]
    );
};

const DirectorySvg = (props: any = {}) => {
    return h(
        'svg',
        {
            focusable: false,
            'aria-hidden': true,
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            xmlns: 'http://www.w3.org/2000/svg',
            ...props,
        },
        [
            h('path', {
                d: 'M6 17V7.58824C6 7.26336 6.26863 7 6.6 7H10.5L12 8.76471H16.05C16.3814 8.76471 16.65 9.02806 16.65 9.35294V11.1176H7.5L6 17ZM6 17L7.44375 11.1176H18L16.8 17L6 17Z',
                stroke: 'currentColor',
                strokeWidth: '1.5',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            }),
        ]
    );
};

const getFileCardClass = (file: FileItem, listType: string) => {
    const baseClass = listType === 'picture' ? `${prefixCls}-picture-file-card` : `${prefixCls}-file-card`;
    const classes: any = {
        [baseClass]: true,
    };

    if (listType === 'picture') {
        classes[`${prefixCls}-picture-file-card-preview-fallback`] = fallbackPreview[file.uid];
        classes[`${prefixCls}-picture-file-card-disabled`] = props.disabled;
        classes[`${prefixCls}-picture-file-card-show-pointer`] = typeof props.onPreviewClick !== 'undefined';
        classes[`${prefixCls}-picture-file-card-error`] = file.status === strings.FILE_STATUS_UPLOAD_FAIL;
        classes[`${prefixCls}-picture-file-card-uploading`] = showProgress(file);
        if ((slots.thumbnail || props.renderThumbnail) && props.picHeight && props.picWidth) {
            classes[`${prefixCls}-picture-file-card-custom-thumbnail`] = true;
        }
    } else {
        classes[`${prefixCls}-file-card-fail`] =
            file.status === strings.FILE_STATUS_VALID_FAIL || file.status === strings.FILE_STATUS_UPLOAD_FAIL;
        classes[`${prefixCls}-file-card-show-pointer`] = typeof props.onPreviewClick !== 'undefined';
    }

    return classes;
};

const getFileCardStyle = (file: FileItem) => {
    const style: any = {};
    if (props.picHeight) {
        style.height = props.picHeight;
    }
    if (props.picWidth) {
        style.width = props.picWidth;
    }
    return style;
};

const getImageStyle = (file: FileItem) => {
    const style: any = {};
    if (props.picHeight) {
        style.height = props.picHeight;
    }
    if (props.picWidth) {
        style.width = props.picWidth;
    }
    return style;
};

const showProgress = (file: FileItem) => {
    return (
        !(file.percent === 100 || typeof file.percent === 'undefined') && file.status === strings.FILE_STATUS_UPLOADING
    );
};

const showRetryButton = (file: FileItem) => {
    return file.status === strings.FILE_STATUS_UPLOAD_FAIL && props.showRetry;
};

const showReplaceButton = (file: FileItem) => {
    return file.status === strings.FILE_STATUS_SUCCESS && props.showReplace;
};

const formatFileSize = (size: string | number | undefined) => {
    if (!size) return '';
    if (typeof size === 'number') {
        if (size < 1024) {
            return `${size}B`;
        } else if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)}KB`;
        } else {
            return `${(size / (1024 * 1024)).toFixed(2)}MB`;
        }
    }
    return size;
};

const handleImageError = (file?: FileItem) => {
    if (file && file.uid) {
        fallbackPreview[file.uid] = true;
    }
};

const handleRetry = (file: FileItem) => {
    foundation.retry(file);
    props.onRetry?.(file);
};

const handleReplace = (index: number) => {
    state.replaceIdx = index;
    nextTick(() => {
        if (replaceInputRef.value) {
            replaceInputRef.value.click();
        }
    });
};

const handlePreviewClick = (file: FileItem) => {
    foundation.handlePreviewClick(file);
};

const handlePreviewClickWrapper = (file: FileItem) => {
    if (props.onPreviewClick) {
        handlePreviewClick(file);
    }
};

const getValidateMessage = (file: FileItem): string | undefined => {
    if (file.validateMessage) {
        return typeof file.validateMessage === 'string' ? file.validateMessage : undefined;
    }
    if (file.status === strings.FILE_STATUS_UPLOAD_FAIL) {
        return getLocaleValue(undefined, 'fail');
    }
    if ((file as any)._sizeInvalid) {
        return getLocaleValue(undefined, 'illegalSize');
    }
    return undefined;
};

const getFileItemProps = (file: FileItem, index: number): RenderFileItemProps => {
    const fileProps: any = {
        ...file,
        index,
        key: file.uid || `${file.name}${index}`,
        onRemove: () => remove(file),
        onRetry: () => handleRetry(file),
        onReplace: () => handleReplace(index),
        onPreviewClick: props.onPreviewClick ? () => handlePreviewClick(file) : () => {},
        previewFile: props.previewFile,
        listType: props.listType || 'list',
        itemStyle: props.itemStyle,
        showPicInfo: props.showPicInfo,
        renderPicInfo: props.renderPicInfo,
        renderPicPreviewIcon: props.renderPicPreviewIcon,
        renderPicClose: props.renderPicClose,
        renderFileOperation: props.renderFileOperation,
        renderThumbnail: props.renderThumbnail,
        disabled: props.disabled,
        picWidth: props.picWidth,
        picHeight: props.picHeight,
        showTooltip: props.showTooltip,
        showRetry: props.showRetry,
        showReplace: props.showReplace,
    };

    const validateMsg = getValidateMessage(file);
    if (validateMsg) {
        fileProps.validateMessage = validateMsg;
    }

    return fileProps as RenderFileItemProps;
};

defineExpose({
    upload: () => foundation.manualUpload(),
    openFileDialog: onClick,
    insert: (files: any[], index?: number) => foundation.insertFileToList(files, index),
});

watch(
    () => props.fileList,
    (newFileList) => {
        if (newFileList) {
            state.fileList = newFileList;
        }
    },
    { immediate: true }
);
</script>

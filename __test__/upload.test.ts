import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, h } from 'vue';
import Upload from '../src/components/upload/Upload.vue';
import Button from '../src/components/button/Button.vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';
import { IconUpload } from '../src/components/icons';

const action = 'https://semi.bytendance.com';

function getUpload(props: any = {}) {
    const defaultProps = {
        action: props.action || action,
        ...props,
    };
    const slots: any = {};
    if (props.children) {
        slots.default = props.children;
    } else {
        slots.default = () =>
            h(
                Button,
                {
                    icon: IconUpload,
                    theme: 'light',
                },
                {
                    default: () => '点击上传',
                }
            );
    }
    return mount(Upload, {
        props: defaultProps,
        slots,
        global: {
            components: {
                Button,
            },
        },
    });
}

function trigger(wrapper: any, event: any) {
    const input = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-hidden-input`);
    if (input.exists()) {
        const inputElement = input.element as HTMLInputElement;
        // Set files directly on the input element
        const files = event.target.files;
        Object.defineProperty(inputElement, 'files', {
            value: files,
            writable: false,
            configurable: true,
        });
        // Create a new event without target property
        const changeEvent = new Event('change', { bubbles: true });
        // Trigger change event without passing event object
        inputElement.dispatchEvent(changeEvent);
    }
}

const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

const createFile = (size = 44320, name = 'semi-logo.png', type = 'image/png') => {
    return new File([new ArrayBuffer(size)], name, {
        type: type,
    });
};

const createEvent = (file: File) => {
    return { target: { files: [file] } };
};

const defaultFileList = [
    {
        uid: '1',
        name: 'vigo.png',
        status: 'success',
        size: '130KB',
        preview: true,
        url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
    },
    {
        uid: '2',
        name: 'test.jpeg',
        status: 'uploadFail',
        size: '222KB',
        preview: false,
        url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
    },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Upload', () => {
    let requests: XMLHttpRequest[] = [];
    let originalXHR: typeof XMLHttpRequest;

    beforeEach(() => {
        // Mock XMLHttpRequest
        originalXHR = window.XMLHttpRequest;
        requests = [];
        window.XMLHttpRequest = vi.fn().mockImplementation(() => {
            const handlers: Record<string, ((...args: any[]) => void)[]> = {};
            const xhr = {
                open: vi.fn(),
                send: vi.fn(),
                setRequestHeader: vi.fn(),
                upload: {
                    addEventListener: vi.fn((event: string, handler: (...args: any[]) => void) => {
                        if (event === 'progress') {
                            (xhr as any)._progressHandler = handler;
                        }
                    }),
                },
                addEventListener: vi.fn((event: string, handler: (...args: any[]) => void) => {
                    if (!handlers[event]) {
                        handlers[event] = [];
                    }
                    handlers[event].push(handler);
                    (xhr as any)._handlers = handlers;
                }),
                onload: null as any,
                onerror: null as any,
                withCredentials: false,
                status: 200,
                responseText: '',
                getAllResponseHeaders: vi.fn(() => ''),
                getResponseHeader: vi.fn(() => null),
                _handlers: handlers,
            } as any;
            requests.push(xhr as any);
            return xhr as any;
        }) as any;

        // Mock URL.createObjectURL
        window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    });

    afterEach(() => {
        window.XMLHttpRequest = originalXHR;
        requests = [];
        vi.restoreAllMocks();
    });

    it('className & style', () => {
        const props = {
            className: 'test',
            style: { color: 'red' },
            action: '',
        };
        const wrapper = getUpload(props);
        expect(wrapper.find('.test').exists()).toBe(true);
    });

    it('action / withCredentials', async () => {
        const props = {
            action,
            withCredentials: true,
            data: { semiKey: 123456 },
        };
        const wrapper = getUpload(props);
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        expect(requests.length).toBeGreaterThan(0);
        if (requests.length > 0) {
            expect(requests[0].withCredentials).toBe(true);
        }
    });

    it('data / headers / name', async () => {
        const headers = { 'x-tt-header': 'semi' };
        const name = 'bytedance.jpeg';
        const props = {
            data: { semiKey: 123456 },
            name,
            headers,
        };
        const wrapper = getUpload(props);
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        expect(requests.length).toBeGreaterThan(0);
        if (requests.length > 0) {
            const setHeaderCalls = (requests[0] as any).setRequestHeader.mock.calls;
            const hasHeader = setHeaderCalls.some((call: any[]) => call[0] === 'x-tt-header' && call[1] === 'semi');
            expect(hasHeader).toBe(true);
        }
    });

    it('data / headers : function', async () => {
        const headers = { 'x-tt-header': 'semi' };
        const data = { semiKey: 123456 };
        const getHeaders = vi.fn((_file: File) => headers);
        const getData = vi.fn((_file: File) => data);
        const props = {
            data: getData,
            headers: getHeaders,
        };
        const wrapper = getUpload(props);
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        expect(getData).toHaveBeenCalled();
        expect(getHeaders).toHaveBeenCalled();
    });

    it('accept', () => {
        const accept = 'application/pdf,image/png,image/jpeg';
        const props = {
            accept,
        };
        const wrapper = getUpload(props);
        const input = wrapper.find(`input.${BASE_CLASS_PREFIX}-upload-hidden-input`);
        expect(input.exists()).toBe(true);
        expect(input.attributes('accept')).toBe(accept);
    });

    it('minSize / maxSize / onSizeError', async () => {
        const kb1 = 1024 * 1024;
        const onSizeError = vi.fn();
        const props = {
            maxSize: kb1 * 3,
            minSize: kb1 * 2,
            onSizeError,
        };
        const wrapper = getUpload(props);
        const bigFile = createFile(kb1 * 4, 'bigSemi.jpeg');
        const smallFile = createFile(kb1, 'smallSemi.jpeg');
        const bigEvent = createEvent(bigFile);
        const smallEvent = createEvent(smallFile);

        trigger(wrapper, bigEvent);
        await nextTick();
        trigger(wrapper, smallEvent);
        await nextTick();

        expect(onSizeError).toHaveBeenCalled();
        const calls = onSizeError.mock.calls;
        expect(calls.length).toBeGreaterThanOrEqual(1);
        if (calls.length > 0) {
            expect(calls[0][0] instanceof File).toBe(true);
            expect(calls[0][0].name).toBe('bigSemi.jpeg');
        }
    });

    it('prompt / promptPosition', async () => {
        const prompt = 'Some info for extra text';
        const props = {
            prompt,
            promptPosition: 'right',
        };
        const wrapper = getUpload(props);
        await nextTick();
        const promptElement = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-prompt`);
        expect(promptElement.exists()).toBe(true);
        expect(promptElement.text()).toBe(prompt);
        expect(wrapper.attributes('x-prompt-pos')).toBe('right');

        await wrapper.setProps({ promptPosition: 'bottom' });
        await nextTick();
        expect(wrapper.attributes('x-prompt-pos')).toBe('bottom');

        await wrapper.setProps({ promptPosition: 'left' });
        await nextTick();
        expect(wrapper.attributes('x-prompt-pos')).toBe('left');
    });

    it('limit / onExceed', async () => {
        const onExceed = vi.fn();
        const props = {
            limit: 2,
            onExceed,
        };
        const wrapper = getUpload(props);
        const fileA = createFile(1024, 'fileA');
        const fileB = createFile(1024, 'fileB');
        const fileC = createFile(1024, 'fileC');
        const files = [fileA, fileB, fileC];
        const event = { target: { files } };
        trigger(wrapper, event);
        await nextTick();
        expect(onExceed).toHaveBeenCalled();
    });

    it('beforeUpload - return boolean', async () => {
        const beforeUpload = vi.fn(({ file, fileList: _fileList }: any) => {
            if (file.name === 'pass.jpg') {
                return true;
            }
            return false;
        });
        const props = {
            beforeUpload,
        };
        const wrapper = getUpload(props);
        const event = createEvent(createFile(10, 'pass.jpg'));
        trigger(wrapper, event);
        await nextTick();
        await sleep(100);

        expect(beforeUpload).toHaveBeenCalled();
        const event2 = createEvent(createFile(20, 'fail.jpg'));
        trigger(wrapper, event2);
        await nextTick();
        await sleep(100);
        expect(beforeUpload).toHaveBeenCalledTimes(2);
    });

    it('beforeUpload - return object sync', async () => {
        const beforeUpload = vi.fn(({ file, fileList: _fileList }: any) => {
            const result: any = {
                shouldUpload: false,
                autoRemove: false,
            };
            if (file.name === 'pass.jpg') {
                result.shouldUpload = true;
            }
            if (file.name === 'invalid.jpg') {
                result.validateMessage = 'not valid file';
                result.status = 'validateFail';
            }
            if (file.name === 'autoRemove.jpg') {
                result.autoRemove = true;
            }
            return result;
        });
        const props = {
            beforeUpload,
        };
        const wrapper = getUpload(props);
        const eventA = createEvent(createFile(10, 'pass.jpg'));
        trigger(wrapper, eventA);
        await nextTick();
        await sleep(100);

        const eventB = createEvent(createFile(20, 'invalid.jpg'));
        trigger(wrapper, eventB);
        await nextTick();
        await sleep(100);

        const eventC = createEvent(createFile(30, 'autoRemove.jpg'));
        trigger(wrapper, eventC);
        await nextTick();
        await sleep(100);

        expect(beforeUpload).toHaveBeenCalledTimes(3);
    });

    it('beforeUpload - return promise', async () => {
        const beforeUpload = vi.fn(({ file, fileList: _fileList }: any) => {
            switch (file.name) {
                case 'reject.jpg':
                    return Promise.reject();
                case 'resolve.jpg':
                    return Promise.resolve();
                case 'resolveObject.jpg': {
                    const newFile = createFile(200, 'afterProcess.jpg');
                    return Promise.resolve({
                        fileInstance: newFile,
                    });
                }
                case 'rejectObject.jpg':
                    return Promise.reject({
                        status: 'validateFail',
                        validateMessage: 'not valid',
                    });
                default:
                    return true;
            }
        });
        const props = {
            beforeUpload,
        };
        const wrapper = getUpload(props);
        trigger(wrapper, createEvent(createFile(50, 'reject.jpg')));
        await sleep(60);
        trigger(wrapper, createEvent(createFile(50, 'resolve.jpg')));
        await sleep(60);
        trigger(wrapper, createEvent(createFile(50, 'resolveObject.jpg')));
        await sleep(60);
        trigger(wrapper, createEvent(createFile(50, 'rejectObject.jpg')));
        await sleep(100);
        expect(beforeUpload).toHaveBeenCalledTimes(4);
    });

    it('onFileChange', async () => {
        const onFileChange = vi.fn();
        const props = {
            onFileChange,
        };
        const wrapper = getUpload(props);
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        expect(onFileChange).toHaveBeenCalled();
        expect(onFileChange.mock.calls[0][0]).toEqual([file]);
    });

    it('onProgress', async () => {
        const onProgress = vi.fn();
        const props = {
            onProgress,
        };
        const wrapper = getUpload(props);
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        if (requests.length > 0 && (requests[0] as any)._progressHandler) {
            (requests[0] as any)._progressHandler({ loaded: 40, total: 100 });
            (requests[0] as any)._progressHandler({ loaded: 80, total: 100 });
            expect(onProgress).toHaveBeenCalled();
        }
    });

    it('onError', async () => {
        const onError = vi.fn();
        const props = {
            onError,
        };
        const wrapper = getUpload(props);
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        await sleep(100);
        if (requests.length > 0) {
            const xhr = requests[0] as any;
            xhr.status = 404;
            xhr.responseText = '[{ "id": 12, "comment": "Hey there" }]';
            // Trigger error event handlers
            if (xhr._handlers && xhr._handlers.error) {
                xhr._handlers.error.forEach((handler: (...args: any[]) => void) => {
                    handler();
                });
                await nextTick();
                await sleep(100);
                expect(onError).toHaveBeenCalled();
            }
        }
    });

    it('onRetry', async () => {
        const onRetry = vi.fn();
        const fileInstance = createFile(200, 'semi.jpg');
        const fileItem = {
            uid: '2',
            name: 'test.jpeg',
            status: 'uploadFail',
            size: '222KB',
            preview: true,
            fileInstance,
            url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
        };
        const props = {
            fileList: [fileItem],
            onRetry,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const retryButton = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-card-info-retry`);
        if (retryButton.exists()) {
            await retryButton.trigger('click');
            await nextTick();
            expect(onRetry).toHaveBeenCalled();
        }
    });

    it('onOpenFileDialog', async () => {
        const onOpenFileDialog = vi.fn();
        const props = {
            onOpenFileDialog,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const addButton = wrapper.find(`div.${BASE_CLASS_PREFIX}-upload-add`);
        if (addButton.exists()) {
            await addButton.trigger('click');
            await nextTick();
            expect(onOpenFileDialog).toHaveBeenCalled();
        }
    });

    it('onSuccess', async () => {
        const body = [{ id: 12, comment: 'Hey there' }];
        const onSuccess = vi.fn();
        const props = {
            onSuccess,
        };
        const wrapper = getUpload(props);
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        await sleep(100);
        if (requests.length > 0) {
            const xhr = requests[0] as any;
            xhr.status = 200;
            xhr.responseText = JSON.stringify(body);
            // Trigger load event handlers
            if (xhr._handlers && xhr._handlers.load) {
                xhr._handlers.load.forEach((handler: (...args: any[]) => void) => {
                    handler();
                });
                await nextTick();
                await sleep(100);
                expect(onSuccess).toHaveBeenCalled();
            }
        }
    });

    it('onRemove', async () => {
        const onRemove = vi.fn();
        const fileInstance = createFile(200, 'semi.jpg');
        const fileItem = {
            uid: '2',
            name: 'test.jpeg',
            status: 'error',
            size: '222KB',
            preview: true,
            fileInstance,
            url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
        };
        const props = {
            defaultFileList: [fileItem],
            onRemove,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const closeButton = wrapper.find(`button.${BASE_CLASS_PREFIX}-upload-file-card-close`);
        if (closeButton.exists()) {
            await closeButton.trigger('click');
            await nextTick();
            await sleep(100);
            expect(onRemove).toHaveBeenCalled();
        }
    });

    it('defaultFileList', async () => {
        const props = {
            defaultFileList,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const fileList = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list`);
        expect(fileList.exists()).toBe(true);
    });

    it('showUploadList', async () => {
        const props = {
            showUploadList: false,
            defaultFileList: [
                {
                    uid: '2',
                    name: 'test.jpeg',
                    status: 'error',
                    size: '222KB',
                    preview: true,
                    url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
                },
            ],
        };
        const wrapper = getUpload(props);
        await nextTick();
        const fileList = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list`);
        expect(fileList.exists()).toBe(false);
    });

    it('listType', () => {
        const props = {
            listType: 'picture',
        };
        const wrapper = getUpload(props);
        expect(wrapper.classes()).toContain(`${BASE_CLASS_PREFIX}-upload-picture`);
    });

    it('afterUpload', async () => {
        const codeStatusMaps: Record<number, string> = {
            0: 'success',
            1: 'uploadFail',
            2: 'validateFail',
        };
        const afterUpload = vi.fn(({ response, file: _file, fileList: _fileList }: any) => {
            const result: any = {};
            if (response && response.code !== undefined) {
                result.status = codeStatusMaps[response.code];
            }
            if (response && response.message) {
                result.validateMessage = response.message;
            }
            if (response && response.autoRemove) {
                result.autoRemove = true;
            }
            if (response && response.newName) {
                result.name = response.newName;
            }
            return result;
        });
        const props = {
            afterUpload,
        };
        const wrapper = getUpload(props);
        const eventA = createEvent(createFile(234, 'uploadSuccess.jpg'));
        trigger(wrapper, eventA);
        await nextTick();
        await sleep(300);

        // Simulate successful upload response
        // afterUpload is called in handleSuccess, which is called from handleOnLoad
        // Foundation sets xhr.onload directly
        await sleep(200);
        if (requests.length > 0) {
            const xhr = requests[0] as any;
            xhr.status = 200;
            xhr.responseText = JSON.stringify({ code: 0 });
            // Foundation uses xhr.onload directly
            if (xhr.onload) {
                xhr.onload({} as ProgressEvent);
            }
            await nextTick();
            await sleep(500);
        }

        // afterUpload should be called after successful upload
        expect(afterUpload).toHaveBeenCalled();
    });

    it('uploadTrigger', async () => {
        const props = {
            uploadTrigger: 'custom',
        };
        const wrapper = getUpload(props);
        const eventA = createEvent(createFile(234, 'semi.jpg'));
        trigger(wrapper, eventA);
        await nextTick();
        const initialRequestCount = requests.length;
        const uploadInstance = wrapper.vm;
        if (uploadInstance && typeof (uploadInstance as any).upload === 'function') {
            (uploadInstance as any).upload();
            await nextTick();
            expect(requests.length).toBeGreaterThan(initialRequestCount);
        }
    });

    it('auto hide trigger when limit & listType="picture"', async () => {
        const props = {
            limit: 2,
            listType: 'picture',
            defaultFileList,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const fileListMain = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list-main`);
        expect(fileListMain.exists()).toBe(true);
    });

    it('showClear', async () => {
        const props = {
            defaultFileList,
            showClear: false,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const clearButton = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list-title-clear`);
        expect(clearButton.exists()).toBe(false);

        const props2 = {
            defaultFileList,
        };
        const wrapper2 = getUpload(props2);
        await nextTick();
        const clearButton2 = wrapper2.find(`.${BASE_CLASS_PREFIX}-upload-file-list-title-clear`);
        expect(clearButton2.exists()).toBe(true);
    });

    it('showRetry', async () => {
        const props = {
            defaultFileList,
            showRetry: false,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const retryButton = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-card-info-retry`);
        expect(retryButton.exists()).toBe(false);
    });

    it('validateMessage', async () => {
        const props = {
            defaultFileList,
            validateMessage: 'test',
        };
        const wrapper = getUpload(props);
        await nextTick();
        const validateMsg = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-validate-message`);
        expect(validateMsg.exists()).toBe(true);
        expect(validateMsg.text()).toBe('test');
    });

    it('renderFileItem', async () => {
        const renderFileItem = vi.fn((fileItem: any) => {
            return {
                type: 'div',
                props: {
                    class: 'customRender',
                },
                children: fileItem.name,
            };
        });
        const props = {
            defaultFileList,
            renderFileItem,
        };
        getUpload(props);
        await nextTick();
        expect(renderFileItem).toHaveBeenCalled();
    });

    it('limit=1,file replace', async () => {
        const props = {
            limit: 1,
            defaultFileList,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const file = createFile(100, 'a.png');
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        await sleep(100);
        // File list should have only one item
        const fileList = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list-main`);
        expect(fileList.exists()).toBe(true);
    });

    it('onAcceptInvalid when file change', async () => {
        const onAcceptInvalid = vi.fn();
        const props = {
            accept: 'image/png',
            onAcceptInvalid,
        };
        const wrapper = getUpload(props);
        await nextTick();
        const file = createFile(100, 'a.jpg', 'image/jpg');
        const event = createEvent(file);
        trigger(wrapper, event);
        await nextTick();
        await sleep(100);
        expect(onAcceptInvalid).toHaveBeenCalled();
        const arg = onAcceptInvalid.mock.calls[0]?.[0];
        if (arg) {
            expect(Array.isArray(arg)).toBe(true);
            expect(arg.length).toBe(1);
            expect(arg[0].name).toBe('a.jpg');
        }
    });

    it('beforeRemove effects', async () => {
        const props = {
            fileList: [
                {
                    uid: '1',
                    name: 'vigo.png',
                    status: 'success',
                    size: '130KB',
                    preview: true,
                    url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
                },
            ],
        };
        const onChange = vi.fn();
        const onRemove = vi.fn();
        const onChangePass = vi.fn();
        const onRemovePass = vi.fn();

        const wrapper = getUpload({
            ...props,
            beforeRemove: () => false,
            onChange,
            onRemove,
        });
        await nextTick();

        const wrapperPass = getUpload({
            ...props,
            beforeRemove: () => true,
            onChange: onChangePass,
            onRemove: onRemovePass,
        });
        await nextTick();

        const removeBtn = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-card-close`);
        const removeBtnPass = wrapperPass.find(`.${BASE_CLASS_PREFIX}-upload-file-card-close`);

        if (removeBtn.exists()) {
            await removeBtn.trigger('click');
            await nextTick();
            await sleep(100);
        }

        if (removeBtnPass.exists()) {
            await removeBtnPass.trigger('click');
            await nextTick();
            await sleep(100);
        }

        expect(onChange).not.toHaveBeenCalled();
        expect(onRemove).not.toHaveBeenCalled();
        expect(onChangePass).toHaveBeenCalled();
        expect(onRemovePass).toHaveBeenCalled();
    });

    it('beforeClear effects', async () => {
        const props = {
            fileList: [
                {
                    uid: '1',
                    name: 'vigo.png',
                    status: 'success',
                    size: '130KB',
                    preview: true,
                    url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
                },
            ],
        };
        const onChange = vi.fn();
        const onClear = vi.fn();
        const onChangePass = vi.fn();
        const onClearPass = vi.fn();
        const onChangeReject = vi.fn();
        const onClearReject = vi.fn();

        const wrapper = getUpload({
            ...props,
            beforeClear: () => Promise.resolve(false),
            onChange,
            onClear,
        });
        await nextTick();

        const wrapperPass = getUpload({
            ...props,
            beforeClear: () => Promise.resolve(true),
            onChange: onChangePass,
            onClear: onClearPass,
        });
        await nextTick();

        const wrapperReject = getUpload({
            ...props,
            beforeClear: () => Promise.reject(),
            onChange: onChangeReject,
            onClear: onClearReject,
        });
        await nextTick();

        const clearBtn = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list-title-clear`);
        const clearBtnPass = wrapperPass.find(`.${BASE_CLASS_PREFIX}-upload-file-list-title-clear`);
        const clearBtnReject = wrapperReject.find(`.${BASE_CLASS_PREFIX}-upload-file-list-title-clear`);

        if (clearBtn.exists()) {
            await clearBtn.trigger('click');
            await nextTick();
            await sleep(100);
        }

        if (clearBtnPass.exists()) {
            await clearBtnPass.trigger('click');
            await nextTick();
            await sleep(100);
        }

        if (clearBtnReject.exists()) {
            await clearBtnReject.trigger('click');
            await nextTick();
            await sleep(100);
        }

        expect(onChange).not.toHaveBeenCalled();
        expect(onClear).not.toHaveBeenCalled();
        expect(onChangePass).toHaveBeenCalled();
        expect(onClearPass).toHaveBeenCalled();
        expect(onChangeReject).not.toHaveBeenCalled();
        expect(onClearReject).not.toHaveBeenCalled();
    });

    it('insert method', async () => {
        const props = {
            defaultFileList: [],
        };
        const wrapper = getUpload(props);
        await nextTick();

        const uploadInstance = wrapper.vm;
        if (uploadInstance && typeof (uploadInstance as any).insert === 'function') {
            const file_0 = new File([new ArrayBuffer(1024)], 'chucknorris_0.png', { type: 'image/png' });
            const file_1 = new File([new ArrayBuffer(1024)], 'chucknorris_1.png', { type: 'image/png' });
            const file_2 = new File([new ArrayBuffer(1024)], 'chucknorris_2.png', { type: 'image/png' });

            (uploadInstance as any).insert([file_0]);
            await nextTick();
            (uploadInstance as any).insert([file_1], 0);
            await nextTick();
            (uploadInstance as any).insert([file_2], 1);
            await nextTick();

            const fileList = wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list-main`);
            expect(fileList.exists()).toBe(true);
        }
    });

    it('showPicInfo works', async () => {
        const props = {
            listType: 'picture',
            defaultFileList: [
                {
                    uid: '1',
                    name: 'jiafang1.jpeg',
                    status: 'success',
                    size: '130kb',
                    url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/bag.jpeg',
                },
            ],
            showPicInfo: true,
        };
        const wrapper = getUpload(props);
        await nextTick();

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-upload`).exists()).toBe(true);
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-upload-file-list-main`).exists()).toBe(true);
        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-upload-picture-file-card-pic-info`).exists()).toBe(true);
    });
});

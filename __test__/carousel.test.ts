import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Carousel from '../src/components/carousel';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';

function getCarousel(carouselProps: any = {}) {
    const contentStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        background: 'lightBlue',
    };

    return {
        components: { Carousel },
        template: `
            <Carousel :style="{ width: '600px', height: '240px' }" v-bind="carouselProps">
                <div :style="contentStyle">
                    <h3>index0</h3>
                </div>
                <div :style="contentStyle">
                    <h3>index1</h3>
                </div>
                <div :style="contentStyle">
                    <h3>index2</h3>
                </div>
            </Carousel>
        `,
        data() {
            return {
                carouselProps,
                contentStyle,
            };
        },
    };
}

function getSingleCarousel(carouselProps: any = {}) {
    const contentStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        background: 'lightBlue',
    };

    return {
        components: { Carousel },
        template: `
            <Carousel :style="{ width: '600px', height: '240px' }" v-bind="carouselProps">
                <div :style="contentStyle">
                    <h3>index0</h3>
                </div>
            </Carousel>
        `,
        data() {
            return {
                carouselProps,
                contentStyle,
            };
        },
    };
}

describe('Carousel', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('Carousel render basicly', async () => {
        const props = {};
        const wrapper = mount(getCarousel(props));
        await nextTick();

        const content = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content`);
        expect(content.exists()).toBe(true);
        const items = content.findAll(`.${BASE_CLASS_PREFIX}-carousel-content-item`);
        expect(items.length).toBe(3);
        const activeItem = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItem.exists()).toBe(true);
        expect(activeItem.text()).toContain('index0');
    });

    it('Carousel with custom className & style', async () => {
        const props = {
            className: 'test',
            style: {
                color: 'red',
            },
        };
        const wrapper = mount(getCarousel(props));
        await nextTick();

        const carousel = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel`);
        expect(carousel.classes()).toContain('test');
        expect(carousel.attributes('style')).toContain('color: red');
    });

    it('Carousel with defaultActiveIndex', async () => {
        const props = {
            defaultActiveIndex: 2,
        };
        const wrapper = mount(getCarousel(props));
        await nextTick();
        vi.advanceTimersByTime(100);

        const activeItem = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItem.exists()).toBe(true);
        expect(activeItem.text()).toContain('index2');
    });

    it('different theme', async () => {
        const primary = mount(getCarousel({ theme: 'primary' }));
        const light = mount(getCarousel({ theme: 'light' }));
        const dark = mount(getCarousel({ theme: 'dark' }));
        await nextTick();

        expect(primary.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-primary`).exists()).toBe(true);
        expect(primary.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-item-primary`).exists()).toBe(true);
        expect(light.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-light`).exists()).toBe(true);
        expect(light.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-item-light`).exists()).toBe(true);
        expect(dark.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-dark`).exists()).toBe(true);
        expect(dark.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-item-dark`).exists()).toBe(true);
    });

    it('different indicator type', async () => {
        const dot = mount(getCarousel({ indicatorType: 'dot' }));
        const line = mount(getCarousel({ indicatorType: 'line' }));
        const columnar = mount(getCarousel({ indicatorType: 'columnar' }));
        await nextTick();

        expect(dot.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-dot`).exists()).toBe(true);
        expect(dot.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-line`).exists()).toBe(false);
        expect(line.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-line`).exists()).toBe(true);
        expect(line.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-columnar`).exists()).toBe(false);
        expect(columnar.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-columnar`).exists()).toBe(true);
        expect(columnar.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-dot`).exists()).toBe(false);
    });

    it('different indicator position', async () => {
        const left = mount(getCarousel({ indicatorPosition: 'left' }));
        const center = mount(getCarousel({ indicatorPosition: 'center' }));
        const right = mount(getCarousel({ indicatorPosition: 'right' }));
        await nextTick();

        expect(left.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-left`).exists()).toBe(true);
        expect(left.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-center`).exists()).toBe(false);
        expect(center.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-center`).exists()).toBe(true);
        expect(center.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-right`).exists()).toBe(false);
        expect(right.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-right`).exists()).toBe(true);
        expect(right.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-left`).exists()).toBe(false);
    });

    it('different indicator size', async () => {
        const small = mount(getCarousel({ indicatorSize: 'small' }));
        const medium = mount(getCarousel({ indicatorSize: 'medium' }));
        await nextTick();

        expect(small.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-item-small`).exists()).toBe(true);
        expect(small.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-item-medium`).exists()).toBe(false);
        expect(medium.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-item-medium`).exists()).toBe(true);
        expect(medium.find(`.${BASE_CLASS_PREFIX}-carousel-indicator-item-small`).exists()).toBe(false);
    });

    it('show arrow and arrow change', async () => {
        const spyOnChange = vi.fn();
        const show = mount(getCarousel({ onChange: spyOnChange }));
        const hide = mount(getCarousel({ showArrow: false }));
        const hover = mount(getCarousel({ arrowType: 'hover' }));
        await nextTick();

        expect(show.find(`.${BASE_CLASS_PREFIX}-carousel-arrow`).exists()).toBe(true);
        expect(hide.find(`.${BASE_CLASS_PREFIX}-carousel-arrow`).exists()).toBe(false);
        expect(hover.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-hover`).exists()).toBe(true);

        const prevBtn = show.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-prev`);
        await prevBtn.trigger('click');
        await nextTick();
        vi.advanceTimersByTime(100);
        expect(spyOnChange).toHaveBeenCalled();

        const nextBtn = show.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-next`);
        await nextBtn.trigger('click');
        await nextTick();
        vi.advanceTimersByTime(100);
    });

    it('indicator change with click or trigger', async () => {
        const spyOnChange = vi.fn();
        const carousel = mount(getCarousel({ onChange: spyOnChange }));
        await nextTick();

        const indicators = carousel.findAll(`.${BASE_CLASS_PREFIX}-carousel-indicator-item`);
        await indicators[2].trigger('click');
        await nextTick();
        vi.advanceTimersByTime(100);
        expect(spyOnChange).toHaveBeenCalled();

        const spyOnChangeHover = vi.fn();
        const carouselHover = mount(getCarousel({ onChange: spyOnChangeHover, trigger: 'hover' }));
        await nextTick();

        const indicatorsHover = carouselHover.findAll(`.${BASE_CLASS_PREFIX}-carousel-indicator-item`);
        await indicatorsHover[2].trigger('mouseenter');
        await nextTick();
        vi.advanceTimersByTime(100);
        expect(spyOnChangeHover).toHaveBeenCalled();
    });

    it('single index', async () => {
        const carousel = mount(getSingleCarousel({}));
        await nextTick();

        expect(carousel.find(`.${BASE_CLASS_PREFIX}-carousel-indicator`).exists()).toBe(false);
        expect(carousel.find(`.${BASE_CLASS_PREFIX}-carousel-arrow`).exists()).toBe(false);
    });

    it('controlled component with activeIndex', async () => {
        const spyOnChange = vi.fn();
        const wrapper = mount({
            components: { Carousel },
            data() {
                return {
                    activeIndex: 0,
                    carouselProps: {
                        activeIndex: 0,
                        onChange: spyOnChange,
                    },
                    contentStyle: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#fff',
                        background: 'lightBlue',
                    },
                };
            },
            template: `
                <Carousel :style="{ width: '600px', height: '240px' }" :active-index="activeIndex" @change="handleChange">
                    <div :style="contentStyle"><h3>index0</h3></div>
                    <div :style="contentStyle"><h3>index1</h3></div>
                    <div :style="contentStyle"><h3>index2</h3></div>
                </Carousel>
            `,
            methods: {
                handleChange(index: number) {
                    this.activeIndex = index;
                    spyOnChange(index);
                },
            },
        });
        await nextTick();

        let activeItem = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItem.text()).toContain('index0');

        await wrapper.setData({ activeIndex: 1 });
        await nextTick();
        vi.advanceTimersByTime(100);
        activeItem = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItem.text()).toContain('index1');
    });

    it('different animation types', async () => {
        const slide = mount(getCarousel({ animation: 'slide' }));
        const fade = mount(getCarousel({ animation: 'fade' }));
        await nextTick();

        expect(slide.find(`.${BASE_CLASS_PREFIX}-carousel-content-slide`).exists()).toBe(true);
        expect(fade.find(`.${BASE_CLASS_PREFIX}-carousel-content-fade`).exists()).toBe(true);
    });

    it('autoPlay functionality', async () => {
        const wrapper = mount(getCarousel({ autoPlay: true }));
        await nextTick();

        const initialActive = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(initialActive.text()).toContain('index0');

        vi.advanceTimersByTime(3000);
        await nextTick();

        const afterAutoPlay = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(afterAutoPlay.exists()).toBe(true);
    });

    it('autoPlay with hoverToPause', async () => {
        const spyOnChange = vi.fn();
        const wrapper = mount(getCarousel({ autoPlay: { interval: 2000, hoverToPause: true }, onChange: spyOnChange }));
        await nextTick();

        const carousel = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel`);
        await carousel.trigger('mouseenter');
        await nextTick();

        vi.advanceTimersByTime(3000);
        await nextTick();

        await carousel.trigger('mouseleave');
        await nextTick();
    });

    it('methods: next, prev, goTo, play, stop', async () => {
        const spyOnChange = vi.fn();
        const wrapper = mount(getCarousel({ onChange: spyOnChange }));
        await nextTick();

        const carouselComponent = wrapper.findComponent({ name: 'Carousel' });
        const vm = carouselComponent.vm as any;

        expect(vm.next).toBeDefined();
        expect(vm.prev).toBeDefined();
        expect(vm.goTo).toBeDefined();
        expect(vm.play).toBeDefined();
        expect(vm.stop).toBeDefined();

        vm.next();
        await nextTick();
        vi.advanceTimersByTime(100);
        expect(spyOnChange).toHaveBeenCalled();

        vm.prev();
        await nextTick();
        vi.advanceTimersByTime(100);

        vm.goTo(2);
        await nextTick();
        vi.advanceTimersByTime(100);
        const activeItem = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItem.text()).toContain('index2');
    });

    it('hide indicator', async () => {
        const wrapper = mount(getCarousel({ showIndicator: false }));
        await nextTick();

        expect(wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-indicator`).exists()).toBe(false);
    });

    it('different slideDirection', async () => {
        const left = mount(getCarousel({ slideDirection: 'left' }));
        const right = mount(getCarousel({ slideDirection: 'right' }));
        await nextTick();

        expect(left.find(`.${BASE_CLASS_PREFIX}-carousel-content-slide`).exists()).toBe(true);
        expect(right.find(`.${BASE_CLASS_PREFIX}-carousel-content-slide`).exists()).toBe(true);
    });

    it('custom speed', async () => {
        const wrapper = mount(getCarousel({ speed: 500 }));
        await nextTick();

        const items = wrapper.findAll(`.${BASE_CLASS_PREFIX}-carousel-content-item`);
        if (items.length > 0) {
            const style = items[0].attributes('style');
            expect(style).toContain('transition-duration: 500ms');
        }
    });

    it('arrow navigation changes active index', async () => {
        const spyOnChange = vi.fn();
        const wrapper = mount(getCarousel({ onChange: spyOnChange }));
        await nextTick();

        const nextBtn = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-next`);
        await nextBtn.trigger('click');
        await nextTick();
        vi.advanceTimersByTime(100);

        const activeItem = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItem.text()).toContain('index1');
        expect(spyOnChange).toHaveBeenCalled();

        const prevBtn = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-arrow-prev`);
        await prevBtn.trigger('click');
        await nextTick();
        vi.advanceTimersByTime(100);

        const activeItemAfterPrev = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItemAfterPrev.text()).toContain('index0');
    });

    it('indicator click changes active index', async () => {
        const spyOnChange = vi.fn();
        const wrapper = mount(getCarousel({ onChange: spyOnChange }));
        await nextTick();

        const indicators = wrapper.findAll(`.${BASE_CLASS_PREFIX}-carousel-indicator-item`);
        await indicators[1].trigger('click');
        await nextTick();
        vi.advanceTimersByTime(100);

        const activeItem = wrapper.find(`.${BASE_CLASS_PREFIX}-carousel-content-item-active`);
        expect(activeItem.text()).toContain('index1');
        expect(spyOnChange).toHaveBeenCalled();
    });
});


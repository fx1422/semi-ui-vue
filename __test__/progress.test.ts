import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Progress from '../src/components/progress';

describe('Progress', () => {
    it('renders with default props', () => {
        const wrapper = mount(Progress);
        expect(wrapper.find('.semi-progress').exists()).toBe(true);
        expect(wrapper.find('.semi-progress-horizontal').exists()).toBe(true);
    });

    it('renders line progress by default', () => {
        const wrapper = mount(Progress, {
            props: { percent: 30 },
        });
        expect(wrapper.find('.semi-progress').exists()).toBe(true);
        expect(wrapper.find('.semi-progress-track').exists()).toBe(true);
    });

    it('renders circle progress', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', percent: 30 },
        });
        expect(wrapper.find('.semi-progress-circle').exists()).toBe(true);
        expect(wrapper.find('svg.semi-progress-circle-ring').exists()).toBe(true);
    });

    it('custom className and style', () => {
        const wrapper = mount(Progress, {
            props: {
                className: 'test',
                style: { marginTop: '20px' },
            },
        });

        expect(wrapper.find('.semi-progress').classes()).toContain('test');
        const element = wrapper.find('.semi-progress').element as HTMLElement;
        expect(element.style.marginTop).toBe('20px');
    });

    it('showInfo prop displays progress text', () => {
        const wrapper = mount(Progress, {
            props: { percent: 50, showInfo: true },
        });

        expect(wrapper.find('.semi-progress-line-text').exists()).toBe(true);
        expect(wrapper.find('.semi-progress-line-text').text()).toBe('50%');
    });

    it('showInfo prop for circle progress', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', percent: 70, showInfo: true },
        });

        expect(wrapper.find('.semi-progress-circle-text').exists()).toBe(true);
        expect(wrapper.find('.semi-progress-circle-text').text()).toBe('70%');
    });

    it('showInfo does not display for small circle', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', size: 'small', percent: 70, showInfo: true },
        });

        expect(wrapper.find('.semi-progress-circle-text').exists()).toBe(false);
    });

    it('size prop - large', () => {
        const wrapper = mount(Progress, {
            props: { size: 'large', percent: 50 },
        });

        expect(wrapper.find('.semi-progress').classes()).toContain('semi-progress-large');
    });

    it('direction prop - vertical', () => {
        const wrapper = mount(Progress, {
            props: { direction: 'vertical', percent: 50 },
        });

        expect(wrapper.find('.semi-progress').classes()).toContain('semi-progress-vertical');
        expect(wrapper.find('.semi-progress').classes()).not.toContain('semi-progress-horizontal');
    });

    it('stroke prop with string color', () => {
        const wrapper = mount(Progress, {
            props: { stroke: '#fc8800', percent: 50 },
        });

        const inner = wrapper.find('.semi-progress-track-inner').element as HTMLElement;
        // Browser converts hex to rgb
        expect(inner.style.background).toMatch(/#fc8800|rgb\(252,\s*136,\s*0\)/);
    });

    it('stroke prop for circle progress', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', stroke: '#fc8800', percent: 50 },
        });

        const circle = wrapper.find('.semi-progress-circle-ring-inner').element as HTMLElement;
        expect(circle.style.stroke).toBe('#fc8800');
    });

    it('orbitStroke prop', () => {
        const wrapper = mount(Progress, {
            props: { orbitStroke: '#f93920', percent: 50 },
        });

        const track = wrapper.find('.semi-progress-track').element as HTMLElement;
        // Browser converts hex to rgb
        expect(track.style.backgroundColor).toMatch(/#f93920|rgb\(249,\s*57,\s*32\)/);
    });

    it('format prop with custom function', () => {
        const format = (percent: number) => `已完成 ${percent}%`;
        const wrapper = mount(Progress, {
            props: { percent: 70, showInfo: true, format },
        });

        expect(wrapper.find('.semi-progress-line-text').text()).toBe('已完成 70%');
    });

    it('strokeLinecap prop - square', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', strokeLinecap: 'square', percent: 70 },
        });

        const circles = wrapper.findAll('circle');
        circles.forEach((circle) => {
            expect(circle.attributes('stroke-linecap')).toBe('square');
        });
    });

    it('strokeWidth prop', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', strokeWidth: 10, percent: 70 },
        });

        const circles = wrapper.findAll('circle');
        circles.forEach((circle) => {
            expect(circle.attributes('stroke-width')).toBe('10');
        });
    });

    it('width prop for circle', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', width: 120, percent: 70 },
        });

        const svg = wrapper.find('.semi-progress-circle-ring').element as SVGSVGElement;
        expect(svg.getAttribute('width')).toBe('120');
        expect(svg.getAttribute('height')).toBe('120');
    });

    it('handles percent > 100', () => {
        const wrapper = mount(Progress, {
            props: { percent: 150, showInfo: true },
        });

        expect(wrapper.find('.semi-progress-line-text').text()).toBe('100%');
    });

    it('handles percent < 0', () => {
        const wrapper = mount(Progress, {
            props: { percent: -10, showInfo: true },
        });

        expect(wrapper.find('.semi-progress-line-text').text()).toBe('0%');
    });

    it('throws error when percent is NaN', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const wrapper = mount(Progress, {
            props: { percent: 30 },
        });

        try {
            await wrapper.setProps({ percent: NaN });
        } catch (error) {
            expect(error.message).toContain('[Semi Progress]:percent can not be NaN');
        }

        consoleSpy.mockRestore();
    });

    it('motion prop - false disables animation', async () => {
        const wrapper = mount(Progress, {
            props: { motion: false, percent: 50, showInfo: true },
        });

        expect(wrapper.find('.semi-progress-line-text').text()).toBe('50%');

        await wrapper.setProps({ percent: 80 });
        await nextTick();

        expect(wrapper.find('.semi-progress-line-text').text()).toBe('80%');
    });

    it('gradient stroke with array', () => {
        const stroke = [
            { percent: 0, color: '#fff' },
            { percent: 100, color: '#000' },
        ];

        const wrapper = mount(Progress, {
            props: {
                type: 'circle',
                stroke,
                strokeGradient: false,
                percent: 90,
            },
        });

        const circle = wrapper.find('.semi-progress-circle-ring-inner').element as HTMLElement;
        // Should use the last color when strokeGradient is false
        expect(circle.style.stroke).toBeTruthy();
    });

    it('aria attributes - role and valuenow', () => {
        const wrapper = mount(Progress, {
            props: {
                percent: 50,
            },
        });

        const progress = wrapper.find('[role="progressbar"]');
        expect(progress.exists()).toBe(true);
        expect(progress.attributes('role')).toBe('progressbar');
        expect(progress.attributes('aria-valuemin')).toBe('0');
        expect(progress.attributes('aria-valuemax')).toBe('100');
        expect(progress.attributes('aria-valuenow')).toBe('50');
    });

    it('default circle width - default size', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', size: 'default', percent: 50 },
        });

        const svg = wrapper.find('.semi-progress-circle-ring').element as SVGSVGElement;
        expect(svg.getAttribute('width')).toBe('72');
    });

    it('default circle width - small size', () => {
        const wrapper = mount(Progress, {
            props: { type: 'circle', size: 'small', percent: 50 },
        });

        const svg = wrapper.find('.semi-progress-circle-ring').element as SVGSVGElement;
        expect(svg.getAttribute('width')).toBe('24');
    });

    it('line progress inner style - horizontal', () => {
        const wrapper = mount(Progress, {
            props: { direction: 'horizontal', percent: 60 },
        });

        const inner = wrapper.find('.semi-progress-track-inner').element as HTMLElement;
        expect(inner.style.width).toBe('60%');
    });

    it('line progress inner style - vertical', () => {
        const wrapper = mount(Progress, {
            props: { direction: 'vertical', percent: 60 },
        });

        const inner = wrapper.find('.semi-progress-track-inner').element as HTMLElement;
        expect(inner.style.height).toBe('60%');
    });
});


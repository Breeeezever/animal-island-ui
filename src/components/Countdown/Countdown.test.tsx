import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Countdown } from './Countdown';
import styles from './countdown.module.less';
import { resolveEffect, resolveEnding, resolveShake } from './motion';

describe('Countdown', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-19T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('按指定格式渲染剩余时间', () => {
        render(<Countdown value={Date.now() + 65_000} format="HH:mm:ss" />);
        // 滚动数字条对 DOM 可见性断言不可用，读屏文本承载完整格式化值
        expect(screen.getByText('00:01:05')).toBeInTheDocument();
    });

    it('每秒更新并在归零时触发回调', () => {
        const onChange = vi.fn();
        const onFinish = vi.fn();
        render(<Countdown value={Date.now() + 2_000} onChange={onChange} onFinish={onFinish} />);

        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByText('00:00:01')).toBeInTheDocument();
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByText('00:00:00')).toBeInTheDocument();
        expect(onChange).toHaveBeenLastCalledWith(0);
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('支持 Date、天数格式和前缀', () => {
        render(
            <Countdown
                value={new Date(Date.now() + (24 * 60 * 60 + 2 * 60 * 60 + 3 * 60 + 4) * 1_000)}
                format="DD 天 HH:mm:ss"
                prefix="活动结束还有"
            />
        );
        expect(screen.getByText('活动结束还有')).toBeInTheDocument();
        expect(screen.getByText('01 天 02:03:04')).toBeInTheDocument();
    });

    it('过期时间稳定显示零且只完成一次', () => {
        const onFinish = vi.fn();
        const { rerender } = render(<Countdown value={Date.now() - 1_000} onFinish={onFinish} />);
        expect(screen.getByText('00:00:00')).toBeInTheDocument();
        expect(onFinish).toHaveBeenCalledTimes(1);
        rerender(<Countdown value={Date.now() - 1_000} onFinish={() => onFinish()} />);
        act(() => vi.advanceTimersByTime(2_000));
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('数字条通过 translateY 滚动到当前数字', () => {
        const { container } = render(<Countdown value={Date.now() + 65_000} format="HH:mm:ss" />);
        const strips = container.querySelectorAll(`.${styles.digitStrip}`);
        expect(strips.length).toBe(6);
        // '00:01:05' → 初始 pos = 数字本身（20 面数字条，每面 5%）
        const transforms = Array.from(strips).map((s) => (s as HTMLElement).style.transform);
        expect(transforms).toEqual([
            'translateY(-0%)',
            'translateY(-0%)',
            'translateY(-0%)',
            'translateY(-5%)',
            'translateY(-0%)',
            'translateY(-25%)',
        ]);
        // 每个数字条包含 0-9 两轮共 20 个数字面
        expect(strips[0].children.length).toBe(20);
    });

    it('秒位 0→9 回绕时单向向下滚动', () => {
        // 60s 剩余显示 '00:01:00'，1 秒后 '00:00:59'：秒个位 0→9 回绕
        const { container } = render(<Countdown value={Date.now() + 60_000} format="mm:ss" />);
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByText('00:59')).toBeInTheDocument();
        const strips = container.querySelectorAll(`.${styles.digitStrip}`);
        // 秒个位 9：回绕后落在下一循环（pos ≥ 10），而非反向跳回第一循环
        const secondsOnes = strips[3] as HTMLElement;
        expect(secondsOnes.style.transform).toBe('translateY(-45%)');
    });

    it('应用尺寸、风格和自定义属性', () => {
        render(
            <Countdown
                value={Date.now() + 1_000}
                size="large"
                variant="island"
                className="custom"
                aria-label="出发倒计时"
            />
        );
        expect(screen.getByRole('timer')).toHaveClass(styles.large, styles.island, 'custom');
        expect(screen.getByRole('timer')).toHaveAccessibleName('出发倒计时');
    });

    it('bordered 默认无边框，开启后应用边框类', () => {
        const { rerender } = render(<Countdown value={Date.now() + 1_000} />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.bordered);
        rerender(<Countdown value={Date.now() + 1_000} bordered />);
        expect(screen.getByRole('timer')).toHaveClass(styles.bordered);
    });

    it('默认不抖动，开启后按显示秒数进入最后五秒和三秒提醒', () => {
        const onFinish = vi.fn();
        const deadline = Date.now() + 5_500;
        const { rerender } = render(<Countdown value={deadline} />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking);
        rerender(<Countdown value={deadline} shake onFinish={onFinish} />);
        // 5.25 秒仍显示 6 秒，不能提前触发最后 5 秒提醒。
        act(() => vi.advanceTimersByTime(250));
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking);
        act(() => vi.advanceTimersByTime(250));
        expect(screen.getByRole('timer')).toHaveClass(styles.shaking);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.urgent);
        act(() => vi.advanceTimersByTime(2_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.shaking, styles.urgent);
        act(() => vi.advanceTimersByTime(3_000));
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking, styles.urgent);
        expect(onFinish).toHaveBeenCalledTimes(1);
        act(() => vi.advanceTimersByTime(1_000));
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('抖动阈值可独立配置，关闭抖动仍保留颜色提醒', () => {
        const deadline = Date.now() + 8_000;
        const { rerender } = render(<Countdown value={deadline} shake={8} />);
        expect(screen.getByRole('timer')).toHaveClass(styles.shaking);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.reminding);
        rerender(<Countdown value={deadline} reminder shake={false} />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking);
        expect(screen.getByRole('timer')).toHaveClass(styles.reminding);
    });

    it('重置到阈值外立即停止，重新进入阈值时恢复抖动', () => {
        const { rerender } = render(<Countdown value={Date.now() + 2_000} shake />);
        expect(screen.getByRole('timer')).toHaveClass(styles.shaking, styles.urgent);
        rerender(<Countdown value={Date.now() + 7_000} shake />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking, styles.urgent);
        act(() => vi.advanceTimersByTime(2_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.shaking);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.urgent);
    });

    it.each([0, -5, NaN, Infinity])('无效或非正阈值 %s 不触发抖动', (shake) => {
        render(<Countdown value={Date.now() + 1_000} shake={shake} />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking);
    });

    it('初次渲染已经过期时不抖动', () => {
        render(<Countdown value={Date.now() - 1_000} shake />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking, styles.urgent);
    });

    it('实际归零后由抖动切换到一次性完成动效，结束后清理', () => {
        const onFinish = vi.fn();
        render(<Countdown value={Date.now() + 1_000} shake finishAnimation onFinish={onFinish} />);
        expect(screen.getByRole('timer')).toHaveClass(styles.shaking);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByText('00:00:00')).toBeInTheDocument();
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking);
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
        expect(onFinish).toHaveBeenCalledTimes(1);
        act(() => vi.advanceTimersByTime(900));
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('初始过期与默认关闭时不播放，结束后开启开关不补播', () => {
        const { rerender } = render(<Countdown value={Date.now() - 1_000} finishAnimation />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
        const deadline = Date.now() + 1_000;
        rerender(<Countdown value={deadline} />);
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
        rerender(<Countdown value={deadline} finishAnimation />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
    });

    it('关闭完成动效立即取消，重新开启不重播；新一轮归零可以再次播放', () => {
        const deadline = Date.now() + 1_000;
        const { rerender } = render(<Countdown value={deadline} finishAnimation />);
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
        rerender(<Countdown value={deadline} finishAnimation={false} />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
        rerender(<Countdown value={deadline} finishAnimation />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
        rerender(<Countdown value={Date.now() + 1_000} finishAnimation />);
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
    });

    it('同值 Date 重建不重复完成回调，也不延长已开始的动效', () => {
        const deadline = Date.now() + 1_000;
        const onFinish = vi.fn();
        const { rerender } = render(<Countdown value={new Date(deadline)} finishAnimation onFinish={onFinish} />);
        act(() => vi.advanceTimersByTime(1_000));
        act(() => vi.advanceTimersByTime(300));
        // 父组件重渲染时常会构造新的 Date，但时间戳相同仍是同一轮倒计时。
        rerender(<Countdown value={new Date(deadline)} finishAnimation onFinish={onFinish} />);
        expect(onFinish).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
        act(() => vi.advanceTimersByTime(600));
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
    });

    it('收尾过程中重新计时会取消旧动效并允许下一轮正常归零', () => {
        const onFinish = vi.fn();
        const { rerender } = render(<Countdown value={Date.now() + 1_000} finishAnimation onFinish={onFinish} />);
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
        rerender(<Countdown value={Date.now() + 2_000} finishAnimation onFinish={onFinish} />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.finishing);
        act(() => vi.advanceTimersByTime(2_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
        expect(onFinish).toHaveBeenCalledTimes(2);
    });

    it('最后几秒逐次回弹与波纹，数字条不重挂，归零切换为一次性反馈', () => {
        const onFinish = vi.fn();
        const { container } = render(
            <Countdown value={Date.now() + 6_000} shake endingAnimation finishAnimation onFinish={onFinish} />
        );
        const strip = container.querySelector(`.${styles.digitStrip}`);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.ending);
        act(() => vi.advanceTimersByTime(1_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.ending, styles.shaking);
        expect(container.querySelectorAll(`.${styles.ripple}`)).toHaveLength(2);
        const firstCycle = container.querySelector(`.${styles.motion}`)!.className;
        act(() => vi.advanceTimersByTime(1_000));
        expect(container.querySelector(`.${styles.motion}`)!.className).not.toBe(firstCycle);
        expect(container.querySelector(`.${styles.digitStrip}`)).toBe(strip);
        act(() => vi.advanceTimersByTime(4_000));
        expect(screen.getByRole('timer')).not.toHaveClass(styles.ending, styles.shaking);
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
        expect(onFinish).toHaveBeenCalledTimes(1);
        act(() => vi.advanceTimersByTime(900));
        expect(container.querySelectorAll(`.${styles.ripple}`)).toHaveLength(0);
    });

    it('循环间隔自动覆盖延迟波纹，避免下一轮截断前一轮', () => {
        const { container } = render(
            <Countdown
                value={Date.now() + 3_000}
                endingAnimation={{
                    seconds: 3,
                    interval: 100,
                    duration: 100,
                    bounce: false,
                    ripple: { count: 3, duration: 200, delay: 300 },
                    fadeDuration: 0,
                }}
            />
        );
        // 第三道波纹在 600ms 开始，800ms 才结束，要求的 100ms 间隔不能提前重启。
        const firstCycle = container.querySelector(`.${styles.motion}`)!.className;
        act(() => vi.advanceTimersByTime(799));
        expect(container.querySelector(`.${styles.motion}`)!.className).toBe(firstCycle);
        act(() => vi.advanceTimersByTime(1));
        expect(container.querySelector(`.${styles.motion}`)!.className).not.toBe(firstCycle);
    });

    it('循环与归零配置分别生效，关闭循环不影响正常结束', () => {
        const deadline = Date.now() + 2_000;
        const onFinish = vi.fn();
        const { container, rerender } = render(
            <Countdown
                value={deadline}
                endingAnimation={{ bounce: false, ripple: { count: 3, color: '#b25770', width: 4 } }}
                finishAnimation={{ ripple: false, bounce: { popScale: 1.12 } }}
                onFinish={onFinish}
            />
        );
        expect(container.querySelectorAll(`.${styles.ripple}`)).toHaveLength(3);
        expect(screen.getByRole('timer').style.getPropertyValue('--countdown-ripple-color')).toBe('#b25770');
        rerender(
            <Countdown
                value={deadline}
                endingAnimation={false}
                finishAnimation={{ ripple: false, bounce: { popScale: 1.12 } }}
                onFinish={onFinish}
            />
        );
        expect(container.querySelectorAll(`.${styles.ripple}`)).toHaveLength(0);
        act(() => vi.advanceTimersByTime(2_000));
        expect(screen.getByRole('timer')).toHaveClass(styles.finishing);
        expect(screen.getByRole('timer').style.getPropertyValue('--countdown-pop-scale')).toBe('1.12');
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('自定义抖动阈值与加强开关，重置到阈值外结束所有循环', () => {
        const { rerender } = render(
            <Countdown
                value={Date.now() + 2_000}
                shake={{ seconds: 8, urgentSeconds: 0, distance: 4, rotation: 2, duration: 1200 }}
                endingAnimation={{ seconds: 8 }}
            />
        );
        expect(screen.getByRole('timer')).toHaveClass(styles.shaking, styles.ending);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.urgent);
        expect(screen.getByRole('timer').style.getPropertyValue('--countdown-shake-distance')).toBe('4px');
        rerender(<Countdown value={Date.now() + 20_000} shake={{ seconds: 8 }} endingAnimation={{ seconds: 8 }} />);
        expect(screen.getByRole('timer')).not.toHaveClass(styles.shaking, styles.ending);
    });

    it('无效配置有稳定回退，零幅度和独立关闭不会被默认值覆盖', () => {
        expect(resolveShake({ seconds: -1, distance: 0, rotation: 0, urgentSeconds: 0 })).toMatchObject({
            seconds: 0,
            distance: 0,
            rotation: 0,
            urgentSeconds: 0,
        });
        expect(
            resolveEffect({ duration: NaN, bounce: false, ripple: { count: 99, opacity: 2, width: -3 } })
        ).toMatchObject({ bounce: false, count: 10, opacity: 1, width: 0 });
        expect(resolveEffect({ ripple: false, bounce: { pressOffset: -4, popOffset: 0 } })).toMatchObject({
            count: 0,
            pressOffset: -4,
            popOffset: 0,
        });
        expect(resolveEnding({ seconds: 0, interval: Infinity })).toMatchObject({ seconds: 0, interval: 1000 });
    });
});

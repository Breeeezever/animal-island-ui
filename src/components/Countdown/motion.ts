/** 抖动提醒的阈值、节奏和幅度，时间单位为毫秒，距离单位为 px，角度单位为度。 */
export interface CountdownShakeOptions {
    /** 开始抖动的剩余秒数，默认 5；非正数关闭 */
    seconds?: number;
    /** 加强阶段的剩余秒数，默认 3；0 关闭加强 */
    urgentSeconds?: number;
    /** 普通阶段周期，默认 1000ms，最小 16ms */
    duration?: number;
    /** 加强阶段周期，默认 650ms，最小 16ms */
    urgentDuration?: number;
    /** 普通阶段水平位移，默认 1.5px */
    distance?: number;
    /** 加强阶段水平位移，默认 2.5px */
    urgentDistance?: number;
    /** 普通阶段旋转角度，默认 0.6 度 */
    rotation?: number;
    /** 加强阶段旋转角度，默认 0.9 度 */
    urgentRotation?: number;
    /** CSS 缓动函数，默认沿用组件库令牌 */
    easing?: string;
}

/** 数字轻压回弹参数；偏移为正时向下，为负时向上。 */
export interface CountdownBounceOptions {
    /** 单次回弹时长，默认 350ms */
    duration?: number;
    /** 轻压缩放比例，默认 0.94 */
    pressScale?: number;
    /** 弹起缩放比例，默认 1.05 */
    popScale?: number;
    /** 轻压纵向偏移，默认 1px */
    pressOffset?: number;
    /** 弹起纵向偏移，默认 -2px */
    popOffset?: number;
}

/** 扩散波纹参数；波纹独立于数字，不占布局空间。 */
export interface CountdownRippleOptions {
    /** 波纹数量，默认 2；取整并限制在 0–10，0 关闭 */
    count?: number;
    /** 每道波纹时长，默认 600ms */
    duration?: number;
    /** 相邻波纹延迟，默认 150ms */
    delay?: number;
    /** 波纹颜色，默认继承提醒色，再回退到组件库主色 */
    color?: string;
    /** 初始透明度，默认 0.45，范围 0–1 */
    opacity?: number;
    /** 线宽，默认 2px */
    width?: number;
    /** 波纹与数字组的外间距，默认 5px */
    offset?: number;
    /** 波纹圆角，默认 16px */
    radius?: number;
    /** 起始缩放比例，默认 0.98 */
    startScale?: number;
    /** 结束横向缩放比例，默认 1.08 */
    scaleX?: number;
    /** 结束纵向缩放比例，默认 1.35 */
    scaleY?: number;
}

/** 最后几秒与归零共用的视觉配置；两处可分别配置。 */
export interface CountdownEffectOptions {
    /** 动效保留时间，默认 900ms；自动延长以覆盖全部子动画 */
    duration?: number;
    /** 数字回弹，默认 true；false 关闭，对象自定义 */
    bounce?: boolean | CountdownBounceOptions;
    /** 扩散波纹，默认 true；false 关闭，对象自定义 */
    ripple?: boolean | CountdownRippleOptions;
    /** CSS 缓动函数，默认沿用组件库令牌 */
    easing?: string;
    /** 系统减少动态效果时的替代反馈，默认 fade；none 完全关闭 */
    reducedMotion?: 'fade' | 'none';
    /** 替代淡入时长，默认 250ms */
    fadeDuration?: number;
    /** 替代淡入的起始透明度，默认 0.65，范围 0–1 */
    fadeOpacity?: number;
}

/** 最后几秒循环回弹与波纹，可与颜色提醒及抖动组合。 */
export interface CountdownEndingAnimationOptions extends CountdownEffectOptions {
    /** 开始播放的剩余秒数，默认 5；非正数关闭 */
    seconds?: number;
    /** 循环间隔，默认 1000ms；至少为 16ms，且不短于单次完整动效 */
    interval?: number;
}

/** 缺省使用组件库缓动，调用方可以按场景覆盖。 */
const DEFAULT_EASING = 'var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1))';

/** 归一化数值配置，忽略非有限数，越界值钳制到可绘制范围。 */
function numberOption(value: number | undefined, fallback: number, min = 0, max = 60_000): number {
    // 对外配置进入 CSS 或定时器前先处理 NaN/Infinity，防止生成无效动效。
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

/** 合并抖动配置，兼容原来的布尔值与秒数简写。 */
export function resolveShake(value: boolean | number | CountdownShakeOptions) {
    const options: CountdownShakeOptions = value && typeof value === 'object' ? value : {};
    // 非有限的秒数简写沿用旧行为：关闭提醒，不回退到默认阈值。
    const seconds =
        typeof value === 'number'
            ? Number.isFinite(value)
                ? Math.max(0, value)
                : 0
            : value
              ? numberOption(options.seconds, 5)
              : 0;
    return {
        seconds,
        urgentSeconds: numberOption(options.urgentSeconds, 3),
        duration: numberOption(options.duration, 1000, 16),
        urgentDuration: numberOption(options.urgentDuration, 650, 16),
        distance: numberOption(options.distance, 1.5),
        urgentDistance: numberOption(options.urgentDistance, 2.5),
        rotation: numberOption(options.rotation, 0.6, 0, 360),
        urgentRotation: numberOption(options.urgentRotation, 0.9, 0, 360),
        easing: options.easing?.trim() || DEFAULT_EASING,
    };
}

/** 合并回弹、波纹及减少动态效果配置，并推导不会截断子动画的实际保留时间。 */
export function resolveEffect(value: boolean | CountdownEffectOptions) {
    const options: CountdownEffectOptions = value && typeof value === 'object' ? value : {};
    const bounce: CountdownBounceOptions = options.bounce && typeof options.bounce === 'object' ? options.bounce : {};
    const ripple: CountdownRippleOptions = options.ripple && typeof options.ripple === 'object' ? options.ripple : {};
    const bounceEnabled = options.bounce !== false;
    const count = options.ripple === false ? 0 : Math.floor(numberOption(ripple.count, 2, 0, 10));
    const bounceDuration = numberOption(bounce.duration, 350);
    const rippleDuration = numberOption(ripple.duration, 600);
    const delay = numberOption(ripple.delay, 150);
    const fadeDuration = numberOption(options.fadeDuration, 250);
    const reducedMotion = options.reducedMotion ?? 'fade';
    // 延迟的最后一道波纹也必须完整播放；避免短 duration 让装饰突然消失。
    const duration = Math.max(
        numberOption(options.duration, 900),
        bounceEnabled ? bounceDuration : 0,
        count ? rippleDuration + delay * (count - 1) : 0,
        reducedMotion === 'fade' ? fadeDuration : 0
    );
    return {
        duration,
        bounce: bounceEnabled,
        bounceDuration,
        pressScale: numberOption(bounce.pressScale, 0.94),
        popScale: numberOption(bounce.popScale, 1.05),
        pressOffset: numberOption(bounce.pressOffset, 1, -60_000),
        popOffset: numberOption(bounce.popOffset, -2, -60_000),
        count,
        rippleDuration,
        delay,
        color: ripple.color?.trim() || 'var(--animal-countdown-reminder-color, var(--animal-primary-color, #19c8b9))',
        opacity: numberOption(ripple.opacity, 0.45, 0, 1),
        width: numberOption(ripple.width, 2),
        offset: numberOption(ripple.offset, 5),
        radius: numberOption(ripple.radius, 16),
        startScale: numberOption(ripple.startScale, 0.98),
        scaleX: numberOption(ripple.scaleX, 1.08),
        scaleY: numberOption(ripple.scaleY, 1.35),
        easing: options.easing?.trim() || DEFAULT_EASING,
        reducedMotion,
        fadeDuration,
        fadeOpacity: numberOption(options.fadeOpacity, 0.65, 0, 1),
    };
}

/** 归一化最后几秒循环配置，间隔覆盖单次完整动效后再开始下一轮。 */
export function resolveEnding(value: boolean | CountdownEndingAnimationOptions) {
    const options: CountdownEndingAnimationOptions = value && typeof value === 'object' ? value : {};
    const effect = resolveEffect(value);
    // 布尔 false 不启用阈值；对象只覆盖声明的字段，其余沿用同一套海岛动效。
    return {
        ...effect,
        seconds: value ? numberOption(options.seconds, 5) : 0,
        interval: Math.max(effect.duration, numberOption(options.interval, 1000, 16)),
    };
}

import React, { useState } from 'react';
import { Button, Countdown, Input, Switch, type CountdownProps } from '../../../src';
import { ApiTable, CodeBlock, type ApiRow, labelStyle, sectionTitleStyle } from '../../tools';

/** 动效对象的参数说明，所有时间使用毫秒，阈值使用剩余秒数。 */
const MOTION_API: ApiRow[] = [
    {
        prop: 'shake.seconds / urgentSeconds',
        desc: '抖动 / 加强阈值；0 关闭对应阶段',
        type: 'number',
        defaultVal: '5 / 3',
    },
    {
        prop: 'shake.duration / urgentDuration',
        desc: '普通 / 加强周期（ms）',
        type: 'number',
        defaultVal: '1000 / 650',
    },
    { prop: 'shake.distance / urgentDistance', desc: '普通 / 加强位移（px）', type: 'number', defaultVal: '1.5 / 2.5' },
    { prop: 'shake.rotation / urgentRotation', desc: '普通 / 加强旋转（度）', type: 'number', defaultVal: '0.6 / 0.9' },
    { prop: 'shake.easing', desc: '抖动 CSS 缓动', type: 'string', defaultVal: '组件库缓动' },
    {
        prop: 'endingAnimation.seconds / interval',
        desc: '最后几秒触发 / 循环间隔（ms），间隔不短于完整动效',
        type: 'number',
        defaultVal: '5 / 1000',
    },
    { prop: 'duration', desc: '单次保留时间（ms），自动扩展以覆盖全部子动画', type: 'number', defaultVal: '900' },
    { prop: 'bounce', desc: '数字回弹开关或配置对象', type: 'boolean | CountdownBounceOptions', defaultVal: 'true' },
    { prop: 'bounce.duration', desc: '回弹时长（ms）', type: 'number', defaultVal: '350' },
    { prop: 'bounce.pressScale / popScale', desc: '轻压 / 弹起缩放比例', type: 'number', defaultVal: '0.94 / 1.05' },
    {
        prop: 'bounce.pressOffset / popOffset',
        desc: '轻压 / 弹起纵向偏移（px），正值向下',
        type: 'number',
        defaultVal: '1 / -2',
    },
    { prop: 'ripple', desc: '波纹开关或配置对象', type: 'boolean | CountdownRippleOptions', defaultVal: 'true' },
    {
        prop: 'ripple.count / duration / delay',
        desc: '数量（0–10）/ 每道时长（ms）/ 相邻延迟（ms）',
        type: 'number',
        defaultVal: '2 / 600 / 150',
    },
    {
        prop: 'ripple.color / opacity',
        desc: 'CSS 颜色 / 初始透明度（0–1）',
        type: 'string / number',
        defaultVal: '提醒色或主色 / 0.45',
    },
    {
        prop: 'ripple.width / offset / radius',
        desc: '线宽 / 外间距 / 圆角（px）',
        type: 'number',
        defaultVal: '2 / 5 / 16',
    },
    {
        prop: 'ripple.startScale / scaleX / scaleY',
        desc: '起始缩放 / 结束横向缩放 / 结束纵向缩放',
        type: 'number',
        defaultVal: '0.98 / 1.08 / 1.35',
    },
    { prop: 'easing', desc: '回弹与波纹 CSS 缓动', type: 'string', defaultVal: '组件库缓动' },
    {
        prop: 'reducedMotion',
        desc: '系统减少动态效果时，归零改为淡入或完全关闭；循环运动始终停止',
        type: "'fade' | 'none'",
        defaultVal: "'fade'",
    },
    {
        prop: 'fadeDuration / fadeOpacity',
        desc: '归零替代淡入时长（ms）/ 初始透明度',
        type: 'number',
        defaultVal: '250 / 0.65',
    },
];

/** 独立全配置演示，已有颜色、抖动与归零示例保留；参数实时生成可复制属性。 */
export const CountdownMotionDemo: React.FC = () => {
    const [deadline, setDeadline] = useState(() => Date.now());
    const [seconds, setSeconds] = useState(5);
    const [interval, setIntervalMs] = useState(1000);
    const [duration, setDuration] = useState(900);
    const [count, setCount] = useState(2);
    const [delay, setDelay] = useState(150);
    const [distance, setDistance] = useState(1.5);
    const [popScale, setPopScale] = useState(1.05);
    const [color, setColor] = useState('#e05a5a');
    const [endingEnabled, setEndingEnabled] = useState(true);
    const [shakeEnabled, setShakeEnabled] = useState(true);
    const [bounceEnabled, setBounceEnabled] = useState(true);
    const [rippleEnabled, setRippleEnabled] = useState(true);
    const [finishEnabled, setFinishEnabled] = useState(true);
    const effect = {
        duration,
        bounce: bounceEnabled ? { duration: 350, pressScale: 0.94, popScale, pressOffset: 1, popOffset: -2 } : false,
        ripple: rippleEnabled
            ? {
                  count,
                  duration: 600,
                  delay,
                  color,
                  opacity: 0.45,
                  width: 2,
                  offset: 5,
                  radius: 16,
                  startScale: 0.98,
                  scaleX: 1.08,
                  scaleY: 1.35,
              }
            : false,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        reducedMotion: 'fade' as const,
        fadeDuration: 250,
        fadeOpacity: 0.65,
    };
    const options: Omit<CountdownProps, 'value'> = {
        format: 'mm:ss',
        reminder: [
            { seconds: 60, color: '#c77c34' },
            { seconds: 10, color },
        ],
        shake: shakeEnabled
            ? {
                  seconds,
                  urgentSeconds: 3,
                  duration: 1000,
                  urgentDuration: 650,
                  distance,
                  urgentDistance: distance + 1,
                  rotation: 0.6,
                  urgentRotation: 0.9,
                  easing: effect.easing,
              }
            : false,
        endingAnimation: endingEnabled ? { ...effect, seconds, interval } : false,
        finishAnimation: finishEnabled ? effect : false,
    };
    const fields = [
        { label: '触发秒数', value: seconds, change: setSeconds, min: 0, step: 1 },
        { label: '循环间隔（ms）', value: interval, change: setIntervalMs, min: 16, step: 100 },
        { label: '单次保留（ms）', value: duration, change: setDuration, min: 0, step: 100 },
        { label: '波纹数量', value: count, change: setCount, min: 0, max: 10, step: 1 },
        { label: '波纹延迟（ms）', value: delay, change: setDelay, min: 0, step: 50 },
        { label: '抖动位移（px）', value: distance, change: setDistance, min: 0, step: 0.5 },
        { label: '回弹放大比例', value: popScale, change: setPopScale, min: 0, step: 0.01 },
    ];
    // 输入控制主参数，代码示例包含全部可配置字段，可直接复制到业务页面。
    return (
        <section aria-label="新增倒计时全配置动效演示">
            <div style={sectionTitleStyle}>新增示例：最后几秒持续回弹与波纹</div>
            <p style={labelStyle}>最后几秒反复回弹、扩散波纹，归零再收尾一次。各组效果可单独开关与配置。</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button size="small" onClick={() => setDeadline(Date.now() + 12_000)}>
                    开始 12 秒体验
                </Button>
                <Button size="small" onClick={() => setDeadline(Date.now() + Math.max(1, seconds) * 1_000)}>
                    直接体验最后几秒
                </Button>
                <Button size="small" onClick={() => setDeadline(Date.now() + 20_000)}>
                    重置到 20 秒
                </Button>
            </div>
            <div style={{ margin: '24px 0' }}>
                <Countdown
                    {...options}
                    value={deadline}
                    bordered
                    variant="island"
                    size="large"
                    aria-label="全配置倒计时"
                />
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '20px 0' }}>
                {[
                    { name: '最后几秒动效', checked: endingEnabled, change: setEndingEnabled },
                    { name: '抖动', checked: shakeEnabled, change: setShakeEnabled },
                    { name: '回弹', checked: bounceEnabled, change: setBounceEnabled },
                    { name: '波纹', checked: rippleEnabled, change: setRippleEnabled },
                    { name: '归零动效', checked: finishEnabled, change: setFinishEnabled },
                ].map((item) => (
                    <label key={item.name} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                        {item.name}
                        <Switch size="small" checked={item.checked} onChange={item.change} aria-label={item.name} />
                    </label>
                ))}
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 14,
                    marginBottom: 24,
                }}
            >
                {fields.map((field) => (
                    <label key={field.label} style={{ display: 'grid', gap: 6 }}>
                        {field.label}
                        <Input
                            type="number"
                            size="small"
                            aria-label={field.label}
                            value={field.value}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            onChange={(event) => {
                                if (Number.isFinite(event.target.valueAsNumber))
                                    field.change(event.target.valueAsNumber);
                            }}
                        />
                    </label>
                ))}
                <label style={{ display: 'grid', gap: 6 }}>
                    提醒与波纹颜色
                    <Input
                        size="small"
                        aria-label="提醒与波纹颜色"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                    />
                </label>
            </div>
            <p style={labelStyle}>
                循环间隔不会短于完整动效；波纹数量或延迟增加时，会自动留足播放时间。系统减少动态效果时停止循环运动。
            </p>
            <CodeBlock
                code={`import { Countdown, type CountdownProps } from 'animal-island-ui';

// 布尔简写：最后 5 秒每秒回弹、扩散，归零再播放一次
<Countdown value={deadline} reminder shake endingAnimation finishAnimation />

// 当前完整配置（时间单位 ms；阈值单位秒；距离单位 px）
const options: Omit<CountdownProps, 'value'> = ${JSON.stringify(options, null, 4)};
<Countdown value={deadline} {...options} />`}
            />
            <div style={labelStyle}>
                动效对象参数：无前缀的字段由 endingAnimation 与 finishAnimation 共用，可分别配置
            </div>
            <ApiTable rows={MOTION_API} />
        </section>
    );
};

CountdownMotionDemo.displayName = 'CountdownMotionDemo';

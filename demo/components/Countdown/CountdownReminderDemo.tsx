import React, { useState } from 'react';
import { Button, Countdown, type CountdownReminderRule } from '../../../src';
import { CodeBlock, labelStyle, sectionTitleStyle } from '../../tools';

/** 自定义规则不依赖顺序，展示与默认橙红配色不同的两档提醒。 */
const CUSTOM_REMINDERS: readonly CountdownReminderRule[] = [
    { seconds: 5, color: '#b25770' },
    { seconds: 20, color: '#9a6a38' },
];

/** 独立提醒示例，共享截止时间对比默认、自定义和关闭提醒，不改动基础示例。 */
export const CountdownReminderDemo: React.FC = () => {
    // 初始从橙色阶段进入红色阶段；按钮可重置到阈值附近，无需等待完整一分钟。
    const [deadline, setDeadline] = useState(() => Date.now() + 15_000);
    return (
        <section aria-label="新增倒计时提醒演示">
            <div style={sectionTitleStyle}>新增示例：分阶段颜色提醒</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[65, 60, 15, 10, 5, 0].map((seconds) => (
                    <Button key={seconds} size="small" onClick={() => setDeadline(Date.now() + seconds * 1_000)}>
                        {seconds === 0 ? '归零' : `重置为 ${seconds} 秒`}
                    </Button>
                ))}
            </div>
            <div style={labelStyle}>默认提醒：60 秒内橙色，10 秒内红色，归零保留红色</div>
            <Countdown value={deadline} format="mm:ss" reminder bordered aria-label="默认提醒倒计时" />
            <div style={labelStyle}>自定义提醒：20 秒内暖棕色，5 秒内莓红色</div>
            <Countdown
                value={deadline}
                format="mm:ss"
                reminder={CUSTOM_REMINDERS}
                variant="island"
                bordered
                aria-label="自定义提醒倒计时"
            />
            <div style={labelStyle}>关闭提醒：保留原有数字配色</div>
            <Countdown value={deadline} format="mm:ss" reminder={false} aria-label="无提醒倒计时" />
            <CodeBlock
                code={`// 开启默认提醒：60 秒橙色，10 秒红色
<Countdown value={deadline} reminder />

// 自定义阈值（单位：秒）与颜色，数组替换全部默认规则
<Countdown
    value={deadline}
    reminder={[
        { seconds: 120, color: '#c77c34' },
        { seconds: 30, color: '#b25770' },
    ]}
/>

// 默认关闭，原有用法保持原样
<Countdown value={deadline} />`}
            />
        </section>
    );
};

CountdownReminderDemo.displayName = 'CountdownReminderDemo';

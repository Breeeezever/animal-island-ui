import React, { useState } from 'react';
import { Button, Countdown } from '../../../src';
import { CodeBlock, labelStyle, sectionTitleStyle } from '../../tools';

/** 独立抖动提醒演示，对比默认阈值、自定义阈值和仅颜色提醒。 */
export const CountdownShakeDemo: React.FC = () => {
    const [deadline, setDeadline] = useState(() => Date.now());
    const [enabled, setEnabled] = useState(true);
    const [finished, setFinished] = useState(true);
    /** 重置共享截止时间，让三种配置在相同剩余秒数下对比。 */
    const restart = (seconds: number) => {
        // 完成状态交由真实倒计时回调更新，不额外创建演示定时器。
        setFinished(seconds === 0);
        setDeadline(Date.now() + seconds * 1_000);
    };
    return (
        <section aria-label="新增倒计时抖动演示">
            <div style={sectionTitleStyle}>新增示例：最后几秒的紧迫提醒</div>
            <p style={labelStyle}>最后 5 秒轻抖，最后 3 秒节奏加快，归零后自动停下。</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button size="small" onClick={() => restart(12)}>
                    开始 12 秒倒计时
                </Button>
                <Button size="small" onClick={() => restart(5)}>
                    体验最后 5 秒
                </Button>
                <Button size="small" onClick={() => restart(0)}>
                    立即归零
                </Button>
                <Button size="small" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
                    {enabled ? '关闭抖动' : '开启抖动'}
                </Button>
            </div>
            <div style={labelStyle}>默认阈值：最后 5 秒，叠加橙色 / 红色提醒</div>
            <Countdown
                value={deadline}
                format="mm:ss"
                reminder
                shake={enabled}
                bordered
                onFinish={() => setFinished(true)}
                aria-label="默认抖动倒计时"
            />
            <div style={labelStyle}>自定义阈值：最后 8 秒，海岛风格</div>
            <Countdown
                value={deadline}
                format="mm:ss"
                reminder
                shake={enabled ? 8 : false}
                variant="island"
                bordered
                aria-label="自定义抖动倒计时"
            />
            <div style={labelStyle}>仅颜色提醒：关闭抖动</div>
            <Countdown value={deadline} format="mm:ss" reminder shake={false} aria-label="仅颜色提醒倒计时" />
            <p style={labelStyle} role="status">
                {finished ? '倒计时已结束，可点击按钮重新体验。' : '倒计时进行中，进入对应阈值后开始抖动。'}
                系统开启“减少动态效果”时保留颜色提醒，关闭抖动。
            </p>
            <CodeBlock
                code={`// 开启颜色提醒 + 最后 5 秒抖动
<Countdown value={deadline} reminder shake />

// 自定义为最后 8 秒，最后 3 秒自动加快
<Countdown value={deadline} reminder shake={8} />

// 只保留颜色提醒
<Countdown value={deadline} reminder shake={false} />`}
            />
        </section>
    );
};

CountdownShakeDemo.displayName = 'CountdownShakeDemo';

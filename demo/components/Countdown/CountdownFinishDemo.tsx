import React, { useState } from 'react';
import { Button, Countdown } from '../../../src';
import { CodeBlock, labelStyle, sectionTitleStyle } from '../../tools';

/** 独立归零动效演示，串联最后几秒的紧迫感与归零后的收尾反馈。 */
export const CountdownFinishDemo: React.FC = () => {
    const [deadline, setDeadline] = useState(() => Date.now());
    const [enabled, setEnabled] = useState(true);
    const [finished, setFinished] = useState(true);
    /** 开始一轮真实倒计时，重置期间结束当前收尾动效。 */
    const restart = (seconds: number) => {
        // 动效由组件的归零状态驱动，示例不自行模拟完成事件。
        setFinished(false);
        setDeadline(Date.now() + seconds * 1_000);
    };
    return (
        <section aria-label="新增倒计时归零动效演示">
            <div style={sectionTitleStyle}>新增示例：归零后的收尾动效</div>
            <p style={labelStyle}>数字轻压回弹，两道柔和波纹向外扩散，播放一次后安静停在零。</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button size="small" onClick={() => restart(5)}>
                    体验完整 5 秒
                </Button>
                <Button size="small" onClick={() => restart(1)}>
                    快速体验归零
                </Button>
                <Button size="small" onClick={() => restart(12)}>
                    重新计时 12 秒
                </Button>
                <Button size="small" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
                    {enabled ? '关闭归零动效' : '开启归零动效'}
                </Button>
            </div>
            <div style={labelStyle}>默认风格：颜色提醒、最后几秒抖动、归零收尾</div>
            <Countdown
                value={deadline}
                format="mm:ss"
                reminder
                shake
                finishAnimation={enabled}
                bordered
                onFinish={() => setFinished(true)}
                aria-label="默认归零动效倒计时"
            />
            <div style={labelStyle}>海岛风格：使用相同动效节奏</div>
            <Countdown
                value={deadline}
                format="mm:ss"
                variant="island"
                reminder
                shake
                finishAnimation={enabled}
                bordered
                aria-label="海岛归零动效倒计时"
            />
            <p style={labelStyle} role="status">
                {finished ? '时间到，可重新开始体验归零动效。' : '倒计时进行中…'}
                系统开启“减少动态效果”时，用轻微淡入代替回弹和波纹。
            </p>
            <CodeBlock
                code={`// 颜色提醒 → 最后几秒抖动 → 归零收尾
<Countdown value={deadline} reminder shake finishAnimation />

// 也可以单独开启归零动效
<Countdown value={deadline} finishAnimation />

// 关闭归零动效
<Countdown value={deadline} reminder shake finishAnimation={false} />`}
            />
        </section>
    );
};

CountdownFinishDemo.displayName = 'CountdownFinishDemo';

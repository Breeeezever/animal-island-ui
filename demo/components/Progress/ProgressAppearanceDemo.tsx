import React, { useState } from 'react';
import { Button, Progress } from '../../../src';
import { CodeBlock, labelStyle, sectionTitleStyle } from '../../tools';

/** 独立颜色与海浪示例，使用独立进度状态验证起点、中间态和完成态。 */
export const ProgressAppearanceDemo: React.FC = () => {
    // 不复用基础示例的滑块，确保两个演示可以分别操作。
    const [percent, setPercent] = useState(45);
    const [animated, setAnimated] = useState(true);
    return (
        <section aria-label="新增颜色与海浪进度演示">
            <div style={sectionTitleStyle}>新增示例：进度配色与海浪</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {[0, 45, 100].map((value) => (
                    <Button key={value} size="small" onClick={() => setPercent(value)}>
                        {value}%
                    </Button>
                ))}
                <Button size="small" onClick={() => setAnimated(!animated)}>
                    {animated ? '暂停海浪' : '播放海浪'}
                </Button>
            </div>
            <div style={labelStyle}>自定义颜色，完成后保持原色</div>
            <div style={{ display: 'grid', gap: 14, maxWidth: 720 }}>
                <Progress percent={percent} color="#e59266" aria-label="蜜桃色进度" />
                <Progress percent={percent} color="#8ac68a" aria-label="草绿色进度" />
                <Progress percent={percent} color="#b77dee" aria-label="紫色进度" />
            </div>
            <div style={labelStyle}>海浪三档尺寸，0% / 100% 自动静止</div>
            <div style={{ display: 'grid', gap: 14, maxWidth: 720 }}>
                <Progress percent={percent} wave animated={animated} size="small" aria-label="小号海浪进度" />
                <Progress percent={percent} wave animated={animated} aria-label="海浪进度" />
                <Progress
                    percent={percent}
                    wave
                    animated={animated}
                    size="large"
                    color="#82d5bb"
                    aria-label="大号海浪进度"
                />
            </div>
            <CodeBlock
                code={`<Progress percent={45} color="#82d5bb" wave />
<Progress percent={45} wave animated={false} />`}
            />
        </section>
    );
};

ProgressAppearanceDemo.displayName = 'ProgressAppearanceDemo';

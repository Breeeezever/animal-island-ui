import React, { useState } from 'react';
import { Button, Divider } from '../../../src';
import { CodeBlock, labelStyle, sectionTitleStyle } from '../../tools';

/** 独立海浪示例，保留基础分割线演示并提供暂停对照。 */
export const OceanWaveDemo: React.FC = () => {
    // 动效开关只影响此示例，避免改变上方原有演示。
    const [animated, setAnimated] = useState(true);
    return (
        <section aria-label="新增海浪分割线演示">
            <div style={sectionTitleStyle}>新增示例：海浪分割线</div>
            <div style={labelStyle}>双层薄荷海浪</div>
            <Divider type="ocean-wave" animated={animated} />
            <Button size="small" onClick={() => setAnimated(!animated)} style={{ marginTop: 16 }}>
                {animated ? '暂停海浪' : '播放海浪'}
            </Button>
            <div style={labelStyle}>静态海浪对照</div>
            <Divider type="ocean-wave" animated={false} />
            <CodeBlock
                code={`<Divider type="ocean-wave" />
<Divider type="ocean-wave" animated={false} />`}
            />
        </section>
    );
};

OceanWaveDemo.displayName = 'OceanWaveDemo';

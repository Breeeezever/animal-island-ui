import React, { useState } from 'react';
import { Chart, Switch, type ChartType } from '../../../src';
import { CodeBlock, sectionTitleStyle } from '../../tools';
import { exampleProps } from './data';
import styles from './demo.module.less';

/** 按统计口径补充提示说明，强调数据含义而非装饰效果。 */
const DETAILS: Partial<Record<ChartType, string>> = {
    pie: '提示包含当前可见数据的占比；隐藏图例后占比随可见合计更新。',
    ring: '圆心展示可见合计，提示展示单项占比；锁定后可稳定对照数值。',
    rose: '扇区面积表示数值，提示同时列出数值与可见数据占比。',
    funnel: '保持业务阶段顺序，提示展示相对首阶段比例与相对上一可见阶段的转化率。',
    candle: '提示保留开、收、低、高四个值，辅助线便于按日期对照。',
    time: '同时间戳的数据才参与对比，不同采样时间不会按数组下标混合。',
    scatter: '提示展示横纵坐标，双向辅助线帮助定位散点。',
    bubble: '提示保留横纵坐标和权重，气泡面积仍与权重成正比。',
    radar: '同一维度可同时比较各系列；悬浮图例可单独突出对应多边形。',
    map: '悬浮区域或对应图例可突出分区，点击可锁定统计值。轮廓为虚构岛屿。',
    word: '悬浮词条或图例突出权重，未放入图面的词条仍保留在数据明细中。',
    gauge: '指针限定在量程内，提示保留原始读数；点击锁定后可继续查看明细。',
    arcbar: '每个可见系列的首个有效值作为指标，提示保留原始数值。',
};

/** 新增独立交互示例，不改写各类型原有数据与状态演示。 */
export const ChartInteractionDemo: React.FC<{ type: ChartType }> = ({ type }) => {
    const [shared, setShared] = useState(true);
    const [highlight, setHighlight] = useState(true);
    const [selectable, setSelectable] = useState(true);
    const [crosshair, setCrosshair] = useState(true);
    const [percentage, setPercentage] = useState(true);
    const [message, setMessage] = useState('尚未点击数据');
    const axis = ['column', 'bar', 'line', 'area', 'mount', 'mix', 'candle', 'time', 'radar'].includes(type);
    const proportion = ['pie', 'ring', 'rose', 'funnel'].includes(type);
    const config = {
        highlight,
        selectable,
        tooltip: { trigger: shared ? ('axis' as const) : ('item' as const), crosshair, showPercentage: percentage },
    };
    // 所有类型共用同一交互入口；只展示对当前统计口径有意义的控制项。
    return (
        <section className={styles.interactionDemo} aria-label="新增图表交互示例">
            <div style={sectionTitleStyle}>新增示例：悬浮对比与锁定读数</div>
            <p className={styles.note}>
                {DETAILS[type] ?? '移入绘图区即可读取同分类的多个系列，无需精确碰到柱体或折线点。'}
            </p>
            <div className={styles.controls}>
                {[
                    { name: '同分类对比', value: shared, change: setShared, show: axis },
                    { name: '悬浮高亮', value: highlight, change: setHighlight, show: true },
                    { name: '点击锁定', value: selectable, change: setSelectable, show: true },
                    {
                        name: '坐标辅助线',
                        value: crosshair,
                        change: setCrosshair,
                        show: (axis && type !== 'radar') || type === 'scatter' || type === 'bubble',
                    },
                    { name: '比例明细', value: percentage, change: setPercentage, show: proportion },
                ]
                    .filter((item) => item.show)
                    .map((item) => (
                        <label className={styles.toggle} key={item.name}>
                            {item.name}
                            <Switch size="small" checked={item.value} onChange={item.change} aria-label={item.name} />
                        </label>
                    ))}
            </div>
            <Chart
                {...exampleProps(type)}
                {...config}
                title="交互细节体验"
                height={320}
                description="悬浮图例突出数据；点击图例筛选。聚焦图形后可用方向键逐项浏览。"
                onDataClick={(point) => setMessage(`${point.seriesName} / ${point.name}：${point.value}`)}
            />
            <p className={styles.note} role="status">
                最近点击：{message}。Enter / 空格锁定，Esc 解除。
            </p>
            <CodeBlock
                code={`<Chart {...chartProps}
    highlight={${highlight}}
    selectable={${selectable}}
    tooltip={${JSON.stringify(config.tooltip, null, 4)}}
/>

// 自定义提示（context.items 包含原数据、格式化值、颜色及适用的比例）
<Chart {...chartProps} tooltip={{
    render: ({ name, items }) => <div>
        <strong>{name}</strong>
        {items.map(item => <p key={item.seriesIndex + '-' + item.dataIndex}>
            {item.seriesName}：{item.formattedValue}
        </p>)}
    </div>
}} />`}
            />
        </section>
    );
};

ChartInteractionDemo.displayName = 'ChartInteractionDemo';

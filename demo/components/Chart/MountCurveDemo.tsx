import React from 'react';
import { Chart, CodeBlock, type ChartProps } from '../../../src';
import { meadow, namedPoints } from './gallery-shared';
import styles from './gallery.module.less';

/** 对照图共用数据与量程，轮廓变化不会改变数值的视觉高度。 */
const chartProps: ChartProps = {
    type: 'mount',
    categories: ['果园', '海岸', '营地', '花田'],
    series: [{ name: '到访人数', data: namedPoints(['果园', '海岸', '营地', '花田'], [58, 86, 42, 68], meadow) }],
    min: 0,
    max: 100,
    legend: false,
    showLabels: true,
    height: 240,
};

/** 新增圆润山峰演示，保留默认尖顶并列对照，原有样式图集保持独立。 */
export const MountCurveDemo: React.FC = () => {
    // 复用既有 smooth 属性控制峰顶曲线，复制示例即可用于业务页面。
    const code = `import { Chart, type ChartProps } from 'animal-island-ui';\n\nconst chartProps: ChartProps = ${JSON.stringify(chartProps, null, 4)};\n\n<Chart {...chartProps} smooth title="圆润山峰" />`;
    return (
        <section className={styles.gallery} aria-label="山峰弧度对照示例">
            <header className={styles.header}>
                <h2>新增示例：圆润山峰</h2>
                <p>同一组数据，对照尖顶与圆弧峰顶。圆润轮廓从山脚平滑过渡至峰顶，数值高度保持一致。</p>
            </header>
            <div className={styles.comparisonGrid}>
                <Chart {...chartProps} title="默认尖顶" description="保留原有山峰轮廓。" />
                <Chart
                    {...chartProps}
                    smooth
                    title="圆弧峰顶"
                    description="平滑的坡面与圆润峰顶，适合柔和的海岛统计。"
                />
            </div>
            <div className={styles.actions}>
                <details className={styles.code}>
                    <summary>查看圆润山峰配置</summary>
                    <CodeBlock code={code} />
                </details>
            </div>
        </section>
    );
};
MountCurveDemo.displayName = 'MountCurveDemo';

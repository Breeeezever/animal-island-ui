import type { ChartType } from '../src/components/Chart/types';

/** 图表分类的轻量元信息；侧栏与路由共用，不引入绘图模块。 */
export interface ChartPageInfo {
    /** 类型及路由后缀 */
    type: ChartType;
    /** 中文名称 */
    label: string;
    /** 图表用途 */
    desc: string;
}

/** 类型参考 uCharts 官方目录，各页均使用本库独立绘制的示例数据。 */
export const CHART_PAGES: readonly ChartPageInfo[] = [
    { type: 'column', label: '柱状图', desc: '分类数值对比，支持分组与正负值堆叠。' },
    { type: 'bar', label: '条状图', desc: '横向比较与排名，长分类名称更容易阅读。' },
    { type: 'line', label: '折线图', desc: '连续趋势与多系列比较，支持曲线和缺测断点。' },
    { type: 'area', label: '面积图', desc: '用柔和填充表达趋势与体量。' },
    { type: 'mount', label: '山峰图', desc: '海岛山丘形状的分类数值展示。' },
    { type: 'mix', label: '混合图', desc: '柱状、折线和面积组合，共用同一数值轴。' },
    { type: 'pie', label: '饼图', desc: '用扇区面积表达各项占比。' },
    { type: 'ring', label: '环形图', desc: '环形占比与中心合计。' },
    { type: 'rose', label: '玫瑰图', desc: '等角度扇区，通过面积表达数值。' },
    { type: 'radar', label: '雷达图', desc: '多个维度的共同量纲对比，缺测不自动补零。' },
    { type: 'scatter', label: '散点图', desc: '观察两个数值维度的分布与关系。' },
    { type: 'bubble', label: '气泡图', desc: '气泡面积表达第三个数值维度。' },
    { type: 'arcbar', label: '圆弧进度', desc: '多项指标的目标完成进度。' },
    { type: 'gauge', label: '仪表盘', desc: '单个数值的刻度、指针与当前读数。' },
    { type: 'funnel', label: '漏斗图', desc: '按业务顺序展示阶段转化，不自动重排数据。' },
    { type: 'word', label: '词云图', desc: '按权重排列词条，支持数据查看与点击。' },
    { type: 'candle', label: 'K线图', desc: '开盘、收盘、最高、最低四个值的区间变化。' },
    { type: 'time', label: '时序图', desc: '按真实时间间隔排列的数据趋势。' },
    { type: 'map', label: '地图统计', desc: '使用调用方提供的区域轮廓展示空间统计。' },
];

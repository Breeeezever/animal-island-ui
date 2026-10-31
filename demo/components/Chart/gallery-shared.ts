import type { ChartPoint, ChartProps } from '../../../src/components/Chart/types';

/** 独立样式示例；配置同时用于绘制和生成可复制的代码。 */
export interface ChartGalleryExample {
    /** 在同一类型内保持稳定的示例标识 */
    id: string;
    /** 只使用公开 Chart 属性，标题和说明必须可读 */
    props: ChartProps & { title: string; description: string };
}

/** 延续组件库的薄荷、蜜桃、草绿与花田色系。 */
export const meadow = ['#48a891', '#97bc76', '#e4b75c', '#ce9271', '#aa91ba'];
export const sunset = ['#dc886b', '#e4b75c', '#c993a5', '#ab8cba', '#8dab9b'];
export const forest = ['#408f7c', '#68a18b', '#8fb6a0', '#b3cbb4', '#d2dfc8'];
export const flowers = ['#a88abb', '#d38ba3', '#e9b782', '#92b7a0', '#c1b979'];
export const creamSurface = { background: '#fffaf0', borderColor: '#eadfc9' };
export const mintSurface = { background: '#f3f8ef', borderColor: '#dce6d6' };
export const blossomSurface = { background: '#fcf5f1', borderColor: '#eadcd4' };

/** 创建紧凑的图表示例，保留各类型自行指定高度的能力。 */
export function galleryExample(id: string, title: string, description: string, props: ChartProps): ChartGalleryExample {
    // 绘图区高度与容器宽度分开，窄屏仍由 Chart 自身处理坐标滚动。
    return { id, props: { height: 240, ...props, title, description } };
}

/** 将明确给定的名称、数值与可选单点颜色组成公开数据结构。 */
export function namedPoints(
    names: readonly string[],
    values: readonly number[],
    colors?: readonly string[]
): ChartPoint[] {
    // 单点颜色用于分类强调；不修改共享调色板或原始数据。
    return names.map((name, index) => ({ name, value: values[index], color: colors?.[index % colors.length] }));
}

/** 为进度及占比示例保留百分比单位，函数可独立复制。 */
export function formatPercent(value: number): string {
    // 统一刻度、提示与中心读数的单位，避免只在标题上注明。
    return `${Math.round(value)}%`;
}

/** 为温度量程示例补充摄氏度单位，函数不依赖演示页状态。 */
export function formatTemperature(value: number): string {
    // 负温度也使用相同格式，便于查看跨零的量程。
    return `${Math.round(value)}°C`;
}

/** 为分钟量程示例补充单位，函数可直接用于数值格式化属性。 */
export function formatMinutes(value: number): string {
    // 读数与轴刻度共用同一格式化入口。
    return `${Math.round(value)} 分`;
}

import type { ChartProps, ChartType, ChartMapRegion } from '../../../src/components/Chart/types';

/** 示例均为虚构岛屿统计，用于演示图形、交互与数据结构。 */
const categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const trend = [32, 46, 38, 62, 55, 79, 68];
const comparison = [24, 31, 42, 48, 39, 61, 54];
const proportions = [
    { name: '果园', value: 38 },
    { name: '海岸', value: 27 },
    { name: '露营地', value: 21 },
    { name: '花田', value: 14 },
];

/** 虚构岛屿分区轮廓，使用平面坐标，不代表真实行政区边界。 */
const regions: ChartMapRegion[] = [
    {
        name: '果园',
        polygons: [
            [
                [0, 2],
                [1, 5],
                [4, 6],
                [5, 3],
                [3, 2],
            ],
        ],
    },
    {
        name: '海岸',
        polygons: [
            [
                [5, 3],
                [4, 6],
                [7, 5],
                [9, 3],
                [8, 1],
            ],
        ],
    },
    {
        name: '露营地',
        polygons: [
            [
                [0, 2],
                [3, 2],
                [5, 3],
                [5, 0],
                [2, -1],
            ],
        ],
    },
    {
        name: '花田',
        polygons: [
            [
                [5, 3],
                [8, 1],
                [7, -1],
                [5, 0],
            ],
        ],
    },
];

/** 根据类型构造独立示例，所有数据结构都可直接复制用于公开 Chart API。 */
export function exampleProps(type: ChartType, alternate = false): ChartProps {
    const values = alternate ? [51, 35, 72, 49, 86, 60, 93] : trend;
    // 特殊图形使用其必需的坐标或区间数据，不用随机数伪造稳定性。
    if (['pie', 'ring', 'rose', 'funnel', 'map'].includes(type))
        return {
            type,
            series: [
                {
                    name: '到访人数',
                    data: proportions.map((p, i) => ({ ...p, value: alternate ? p.value + i * 7 + 5 : p.value })),
                },
            ],
            regions: type === 'map' ? regions : undefined,
            showLabels: type === 'map',
        };
    if (type === 'radar')
        return {
            type,
            categories: ['生态', '服务', '交通', '设施', '景观'],
            max: 100,
            series: [
                { name: '本月', data: alternate ? [86, 70, 90, 60, 85] : [72, 90, 65, 82, 94] },
                { name: '上月', data: [60, 74, 78, 65, 81] },
            ],
        };
    if (type === 'scatter' || type === 'bubble')
        return {
            type,
            series: [
                {
                    name: '海岸活动',
                    data: [
                        { name: '拾贝', x: 12, y: alternate ? 42 : 28, size: 12 },
                        { name: '钓鱼', x: 30, y: 55, size: 25 },
                        { name: '潜水', x: 46, y: 38, size: 18 },
                        { name: '观景', x: 65, y: 72, size: 38 },
                    ],
                },
                {
                    name: '林间活动',
                    data: [
                        { name: '采果', x: 20, y: 42, size: 20 },
                        { name: '野餐', x: 42, y: 64, size: 32 },
                        { name: '露营', x: 58, y: 48, size: 16 },
                    ],
                },
            ],
        };
    if (type === 'gauge' || type === 'arcbar')
        return {
            type,
            min: 0,
            max: 100,
            valueFormatter: (value) => `${Math.round(value)}%`,
            series:
                type === 'gauge'
                    ? [{ name: '岛屿舒适度', data: [alternate ? 91 : 72] }]
                    : [
                          { name: '植树目标', data: [alternate ? 88 : 72] },
                          { name: '步道维护', data: [alternate ? 76 : 58] },
                      ],
        };
    if (type === 'word')
        return {
            type,
            series: [
                {
                    name: '提及次数',
                    data: [
                        '海风',
                        '露营',
                        '星空',
                        '果园',
                        '钓鱼',
                        '日落',
                        '咖啡',
                        '贝壳',
                        '花田',
                        '步道',
                        '朋友',
                        '野餐',
                    ].map((name, i) => ({ name, value: (alternate ? 15 - i : 12 - i) * 8 })),
                },
            ],
        };
    if (type === 'candle')
        return {
            type,
            categories: ['10/01', '10/02', '10/03', '10/04', '10/05', '10/06'],
            min: 20,
            series: [
                {
                    name: '集市价格（示例）',
                    data: [
                        { open: 40, close: 55, low: 32, high: 62 },
                        { open: 55, close: 48, low: 44, high: 66 },
                        { open: 48, close: alternate ? 70 : 62, low: 42, high: 74 },
                        { open: 62, close: 68, low: 54, high: 78 },
                        { open: 68, close: 51, low: 47, high: 72 },
                        { open: 51, close: 64, low: 45, high: 70 },
                    ],
                },
            ],
        };
    if (type === 'time')
        return {
            type,
            series: [
                {
                    name: '实时到访',
                    data: [0, 5, 15, 20, 45, 60].map((minutes, i) => ({
                        name: `${minutes} 分钟`,
                        x: Date.UTC(2026, 9, 31, 2, minutes),
                        y: values[i],
                    })),
                },
            ],
        };
    return {
        type,
        categories,
        series: [
            { name: '本周', data: values, type: 'column' },
            { name: '上周', data: comparison, type: type === 'mix' ? 'line' : undefined },
        ],
    };
}

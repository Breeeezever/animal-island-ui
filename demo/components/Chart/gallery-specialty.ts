import type { ChartMapRegion, ChartPoint, ChartType } from '../../../src/components/Chart/types';
import { exampleProps } from './data';
import {
    galleryExample as example,
    namedPoints,
    meadow,
    sunset,
    forest,
    flowers,
    creamSurface,
    mintSurface,
    blossomSurface,
    type ChartGalleryExample,
} from './gallery-shared';

/** 构造有明确坐标的固定观测值，不使用随机数改变演示内容。 */
function observations(coordinates: readonly (readonly [number, number, number?])[], prefix: string): ChartPoint[] {
    // 同一份坐标可以比较散点与气泡的表达，第三项仅作为气泡权重。
    return coordinates.map(([x, y, size], index) => ({ name: `${prefix}${index + 1}`, x, y, size }));
}

/** 从固定起点生成时序记录，时间间隔由每条记录显式指定。 */
function timePoints(records: readonly (readonly [number, number])[]): ChartPoint[] {
    // 毫秒时间戳由组件统一格式化，避免演示名称与用户时区不一致。
    const start = Date.UTC(2026, 9, 31);
    return records.map(([minutes, y]) => ({ x: start + minutes * 60_000, y }));
}

/** 虚构群岛的平面轮廓；与原来的连续分区示例展示不同空间布局。 */
const archipelago: ChartMapRegion[] = [
    {
        name: '风铃岛',
        polygons: [
            [
                [0, 3],
                [1, 5],
                [3, 5.5],
                [4, 4],
                [3, 2.5],
                [1, 2],
            ],
        ],
    },
    {
        name: '月湾岛',
        polygons: [
            [
                [5, 2],
                [6, 4],
                [8, 4.5],
                [9, 3],
                [8, 1],
                [6, 0.5],
            ],
        ],
    },
    {
        name: '小麦岛',
        polygons: [
            [
                [1, -1],
                [2, 0.5],
                [4, 0],
                [4.5, -1.5],
                [3, -2.5],
                [1.5, -2],
            ],
        ],
    },
    {
        name: '星沙岛',
        polygons: [
            [
                [7, -2],
                [8, -1],
                [9.5, -2],
                [9, -3.5],
                [7.5, -3.5],
            ],
        ],
    },
];

/** 专项图表示例：强调坐标、权重、阶段、区间与空间轮廓的真实语义。 */
export const specialtyExamples: Record<
    Extract<ChartType, 'scatter' | 'bubble' | 'funnel' | 'word' | 'candle' | 'time' | 'map'>,
    readonly ChartGalleryExample[]
> = {
    scatter: [
        example('correlation', '单组分布 · 步道体验', '横轴为路程，纵轴为体验评分，观察整体分布。', {
            type: 'scatter',
            colors: forest,
            legend: false,
            min: 0,
            max: 100,
            series: [
                {
                    name: '步道观测',
                    data: observations(
                        [
                            [1, 36],
                            [2, 48],
                            [2.5, 42],
                            [3, 64],
                            [4, 58],
                            [5, 76],
                            [5.5, 68],
                            [6, 85],
                        ],
                        '步道'
                    ),
                },
            ],
        }),
        example('clusters', '分组散点 · 活动偏好', '横轴为活动分钟数，纵轴为满意度，区分活动类型。', {
            type: 'scatter',
            colors: [sunset[0], flowers[0], meadow[0]],
            min: 0,
            max: 100,
            style: creamSurface,
            series: [
                {
                    name: '手作',
                    data: observations(
                        [
                            [20, 68],
                            [30, 82],
                            [35, 74],
                        ],
                        '手作'
                    ),
                },
                {
                    name: '露营',
                    data: observations(
                        [
                            [60, 78],
                            [75, 92],
                            [85, 86],
                        ],
                        '露营'
                    ),
                },
                {
                    name: '采果',
                    data: observations(
                        [
                            [40, 58],
                            [50, 72],
                            [55, 64],
                        ],
                        '采果'
                    ),
                },
            ],
        }),
        example('quadrants', '正负分布 · 区域变化', '横轴为到访变化，纵轴为营收变化，保留正负坐标。', {
            type: 'scatter',
            colors: [flowers[0]],
            style: blossomSurface,
            series: [
                {
                    name: '区域变化',
                    data: observations(
                        [
                            [-28, 18],
                            [-12, -24],
                            [8, 12],
                            [22, 38],
                            [36, -14],
                            [-38, -32],
                            [46, 48],
                        ],
                        '分区'
                    ),
                },
            ],
        }),
        example('labels', '标注散点 · 四处观景点', '少量观测值直接标注评分，悬浮查看完整坐标。', {
            type: 'scatter',
            colors: [meadow[0]],
            showLabels: true,
            min: 0,
            max: 100,
            legend: false,
            style: mintSurface,
            series: [
                {
                    name: '景观评分',
                    data: [
                        { name: '栈桥', x: 12, y: 52 },
                        { name: '灯塔', x: 28, y: 76 },
                        { name: '山顶', x: 46, y: 88 },
                        { name: '海滩', x: 62, y: 64 },
                    ],
                },
            ],
        }),
    ],
    bubble: [
        example('weight', '大小气泡 · 活动规模', '横轴时长、纵轴评分、气泡面积表示参与人数。', {
            type: 'bubble',
            colors: forest,
            min: 0,
            max: 100,
            legend: false,
            series: [
                {
                    name: '活动体验',
                    data: observations(
                        [
                            [12, 36, 12],
                            [24, 62, 32],
                            [40, 48, 18],
                            [56, 78, 56],
                            [72, 68, 40],
                        ],
                        '活动'
                    ),
                },
            ],
        }),
        example('grouped', '双色气泡 · 海岸与林间', '同一套坐标与权重尺度，比较两类活动的分布。', {
            type: 'bubble',
            colors: [sunset[0], flowers[0]],
            min: 0,
            max: 100,
            style: creamSurface,
            series: [
                {
                    name: '海岸',
                    data: observations(
                        [
                            [15, 32, 15],
                            [35, 68, 48],
                            [65, 56, 30],
                        ],
                        '海岸'
                    ),
                },
                {
                    name: '林间',
                    data: observations(
                        [
                            [25, 58, 28],
                            [48, 42, 18],
                            [75, 82, 56],
                        ],
                        '林间'
                    ),
                },
            ],
        }),
        example('colored', '单点配色 · 营地设施', '设施使用不同颜色，气泡面积表达使用次数。', {
            type: 'bubble',
            legend: false,
            min: 0,
            max: 100,
            style: mintSurface,
            series: [
                {
                    name: '设施使用',
                    data: observations(
                        [
                            [15, 42, 18],
                            [32, 78, 48],
                            [48, 56, 32],
                            [70, 84, 64],
                        ],
                        '设施'
                    ).map((point, index) => ({ ...point, color: meadow[index] })),
                },
            ],
        }),
        example('minimal', '无网格气泡 · 游玩偏好', '隐藏坐标，悬浮读取时长、评分与参与规模。', {
            type: 'bubble',
            colors: flowers,
            showAxes: false,
            legend: false,
            style: blossomSurface,
            series: [
                {
                    name: '游玩偏好',
                    data: observations(
                        [
                            [12, 34, 16],
                            [26, 58, 42],
                            [44, 42, 24],
                            [58, 76, 64],
                            [76, 60, 36],
                        ],
                        '项目'
                    ),
                },
            ],
        }),
    ],
    funnel: [
        example('conversion', '四阶段 · 活动报名', '完整保留报名顺序，提示展示阶段转化率。', {
            type: 'funnel',
            colors: meadow,
            showLabels: true,
            legend: false,
            series: [{ name: '报名人数', data: namedPoints(['浏览', '咨询', '预约', '到场'], [360, 240, 160, 128]) }],
        }),
        example('tonal', '同色漏斗 · 手作课程', '以深浅草绿表达五个连续阶段的数量。', {
            type: 'funnel',
            colors: forest,
            showLabels: true,
            legend: false,
            height: 260,
            style: mintSurface,
            series: [
                {
                    name: '参与人数',
                    data: namedPoints(['查看', '收藏', '报名', '签到', '完成'], [480, 340, 240, 180, 150]),
                },
            ],
        }),
        example('simple', '简洁漏斗 · 集市到访', '仅显示阶段名称，具体数值在悬浮提示中查看。', {
            type: 'funnel',
            colors: sunset,
            showLabels: false,
            legend: false,
            style: creamSurface,
            series: [{ name: '到访人数', data: namedPoints(['看到活动', '到达集市', '参与体验'], [280, 196, 108]) }],
        }),
        example('retention', '暖色漏斗 · 志愿留存', '接近的阶段数值呈现较平缓的轮廓，便于比较留存。', {
            type: 'funnel',
            colors: flowers,
            showLabels: true,
            legend: false,
            style: blossomSurface,
            series: [{ name: '志愿人数', data: namedPoints(['报名', '培训', '上岗', '持续参与'], [100, 92, 86, 78]) }],
        }),
    ],
    word: [
        example('colorful', '多彩词云 · 海岛印象', '关闭底部图例，让词条大小与颜色成为阅读重点。', {
            type: 'word',
            colors: meadow,
            legend: false,
            series: [
                {
                    name: '提及次数',
                    data: namedPoints(
                        ['海风', '露营', '星空', '日落', '果园', '咖啡', '朋友', '贝壳', '花田', '野餐'],
                        [96, 84, 72, 64, 56, 48, 40, 32, 24, 16]
                    ),
                },
            ],
        }),
        example('monochrome', '单色词云 · 森林日记', '统一草绿色，只通过字体大小表达词条权重。', {
            type: 'word',
            colors: [forest[0]],
            legend: false,
            style: mintSurface,
            series: [
                {
                    name: '提及次数',
                    data: namedPoints(
                        ['森林', '清晨', '松果', '晨露', '小径', '鸟鸣', '苔藓', '树荫'],
                        [100, 78, 64, 52, 46, 38, 30, 22]
                    ),
                },
            ],
        }),
        example('warm', '暖色词云 · 集市记忆', '蜜桃与暖黄色系，搭配简洁的奶油底色。', {
            type: 'word',
            colors: sunset,
            legend: false,
            style: creamSurface,
            series: [
                {
                    name: '提及次数',
                    data: namedPoints(
                        ['手作', '鲜花', '面包', '陶艺', '咖啡', '果酱', '甜品', '编织', '香草'],
                        [92, 78, 68, 60, 52, 42, 34, 28, 20]
                    ),
                },
            ],
        }),
        example('focus', '重点词条 · 周末计划', '用单点颜色强调主词，保留图例用于交互筛选。', {
            type: 'word',
            colors: [flowers[0]],
            style: blossomSurface,
            series: [
                {
                    name: '计划人数',
                    data: [
                        { name: '慢生活', value: 120, color: sunset[0] },
                        ...namedPoints(['阅读', '散步', '喝茶', '写信', '听风'], [68, 56, 44, 32, 24]),
                    ],
                },
            ],
        }),
    ],
    candle: [
        example('week', '每日区间 · 集市果价', '展示开、收、高、低，保留涨珊瑚、跌薄荷的语义。', {
            type: 'candle',
            categories: ['周一', '周二', '周三', '周四', '周五'],
            min: 20,
            max: 80,
            legend: false,
            series: [
                {
                    name: '果价（虚构）',
                    data: [
                        { open: 36, close: 48, low: 30, high: 54 },
                        { open: 48, close: 42, low: 36, high: 58 },
                        { open: 42, close: 62, low: 38, high: 68 },
                        { open: 62, close: 56, low: 48, high: 72 },
                        { open: 56, close: 68, low: 50, high: 76 },
                    ],
                },
            ],
        }),
        example('narrow-range', '局部量程 · 平稳交易', '缩小显示量程，观察幅度较小的区间变化。', {
            type: 'candle',
            categories: ['一', '二', '三', '四', '五'],
            min: 90,
            max: 110,
            legend: false,
            style: mintSurface,
            series: [
                {
                    name: '成交价（虚构）',
                    data: [
                        { open: 96, close: 100, low: 94, high: 103 },
                        { open: 100, close: 98, low: 95, high: 104 },
                        { open: 98, close: 104, low: 96, high: 107 },
                        { open: 104, close: 101, low: 98, high: 108 },
                        { open: 101, close: 105, low: 99, high: 109 },
                    ],
                },
            ],
        }),
        example('labels', '收盘标注 · 四季价格', '少量区间直接标注收盘值，便于快速对照。', {
            type: 'candle',
            categories: ['春', '夏', '秋', '冬'],
            min: 0,
            max: 100,
            showLabels: true,
            legend: false,
            style: creamSurface,
            series: [
                {
                    name: '季末价格（虚构）',
                    data: [
                        { open: 36, close: 58, low: 22, high: 74 },
                        { open: 58, close: 42, low: 28, high: 70 },
                        { open: 42, close: 68, low: 32, high: 86 },
                        { open: 68, close: 54, low: 40, high: 80 },
                    ],
                },
            ],
        }),
        example('flat', '平盘与波动 · 市集观察', '开收相同仍显示实体，悬浮查看完整区间。', {
            type: 'candle',
            categories: ['一', '二', '三', '四', '五'],
            min: 20,
            max: 80,
            legend: false,
            style: blossomSurface,
            series: [
                {
                    name: '观察价（虚构）',
                    data: [
                        { open: 40, close: 40, low: 32, high: 48 },
                        { open: 40, close: 58, low: 36, high: 66 },
                        { open: 58, close: 58, low: 50, high: 72 },
                        { open: 58, close: 42, low: 34, high: 64 },
                        { open: 42, close: 50, low: 38, high: 58 },
                    ],
                },
            ],
        }),
    ],
    time: [
        example('regular', '等时采样 · 步道到访', '每隔 15 分钟采样，曲线表达连续变化。', {
            type: 'time',
            smooth: true,
            colors: forest,
            legend: false,
            style: mintSurface,
            series: [
                {
                    name: '到访人数',
                    data: timePoints([
                        [0, 18],
                        [15, 32],
                        [30, 26],
                        [45, 48],
                        [60, 42],
                        [75, 62],
                    ]),
                },
            ],
        }),
        example('irregular', '不等间隔 · 活动签到', '短间隔与长间隔按真实时间比例排列。', {
            type: 'time',
            colors: [sunset[0]],
            legend: false,
            showLabels: true,
            max: 100,
            style: creamSurface,
            series: [
                {
                    name: '累计签到',
                    data: timePoints([
                        [0, 12],
                        [5, 28],
                        [12, 42],
                        [45, 64],
                        [90, 82],
                    ]),
                },
            ],
        }),
        example('comparison', '双线时序 · 南北入口', '同一时刻对比两个入口，悬浮提示合并读数。', {
            type: 'time',
            colors: [meadow[0], flowers[0]],
            series: [
                {
                    name: '南入口',
                    data: timePoints([
                        [0, 22],
                        [20, 42],
                        [40, 36],
                        [60, 62],
                        [80, 48],
                    ]),
                },
                {
                    name: '北入口',
                    data: timePoints([
                        [0, 18],
                        [20, 28],
                        [40, 48],
                        [60, 38],
                        [80, 56],
                    ]),
                },
            ],
        }),
        example('minimal', '无网格时序 · 午后热度', '简化装饰，保留真实时间间隔与单点读取。', {
            type: 'time',
            colors: [flowers[0]],
            showAxes: false,
            smooth: true,
            legend: false,
            style: blossomSurface,
            series: [
                {
                    name: '热度指数',
                    data: timePoints([
                        [0, 24],
                        [10, 38],
                        [25, 62],
                        [50, 46],
                        [70, 72],
                        [100, 58],
                    ]),
                },
            ],
        }),
    ],
    map: [
        example('tonal', '单色深浅 · 分区到访', '同色填充深浅表达数量，区域名称直接标注。', {
            ...exampleProps('map'),
            colors: [forest[0]],
            showLabels: true,
            legend: false,
            style: mintSurface,
        }),
        example('category', '分类配色 · 区域采收', '不同区域采用暖色区分，悬浮查看各自采收量。', {
            ...exampleProps('map'),
            colors: sunset,
            showLabels: false,
            style: creamSurface,
            series: [{ name: '采收量', data: namedPoints(['果园', '海岸', '露营地', '花田'], [82, 26, 48, 62]) }],
        }),
        example('islands', '独立群岛 · 周末到访', '换一组平面轮廓，展示互不相连的四座虚构岛屿。', {
            type: 'map',
            regions: archipelago,
            colors: meadow,
            showLabels: true,
            legend: false,
            series: [
                { name: '到访人数', data: namedPoints(['风铃岛', '月湾岛', '小麦岛', '星沙岛'], [88, 62, 46, 30]) },
            ],
        }),
        example('missing', '缺测区域 · 观察记录', '星沙岛未提供记录，保留沙色轮廓而不填成零值。', {
            type: 'map',
            regions: archipelago,
            colors: [flowers[0]],
            showLabels: true,
            legend: false,
            style: blossomSurface,
            series: [{ name: '观察次数', data: namedPoints(['风铃岛', '月湾岛', '小麦岛'], [68, 92, 42]) }],
        }),
    ],
};

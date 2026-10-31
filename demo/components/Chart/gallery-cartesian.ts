import type { ChartType } from '../../../src/components/Chart/types';
import {
    galleryExample as example,
    namedPoints,
    formatPercent,
    meadow,
    sunset,
    forest,
    flowers,
    creamSurface,
    mintSurface,
    blossomSurface,
    type ChartGalleryExample,
} from './gallery-shared';

/** 分类坐标类示例：每组分别展示结构、配色和信息密度的不同用法。 */
export const cartesianExamples: Record<
    Extract<ChartType, 'column' | 'bar' | 'line' | 'area' | 'mount' | 'mix'>,
    readonly ChartGalleryExample[]
> = {
    column: [
        example('harvest', '彩色单柱 · 果园收成', '每种水果独立配色，直接标注采收数量。', {
            type: 'column',
            categories: ['苹果', '香梨', '蜜桃', '樱桃'],
            legend: false,
            showLabels: true,
            max: 100,
            series: [
                { name: '采收数量', data: namedPoints(['苹果', '香梨', '蜜桃', '樱桃'], [64, 85, 52, 73], meadow) },
            ],
        }),
        example('grouped', '多系列分组 · 活动预约', '薄荷、蜜桃与花紫，对比三类活动的预约量。', {
            type: 'column',
            categories: ['周五', '周六', '周日'],
            colors: [meadow[0], sunset[0], flowers[0]],
            style: creamSurface,
            series: [
                { name: '露营', data: [28, 54, 42] },
                { name: '野餐', data: [38, 45, 62] },
                { name: '观星', data: [18, 32, 48] },
            ],
        }),
        example('stacked', '暖色堆叠 · 集市营收', '同一根柱子查看总量，悬浮比较各摊位贡献。', {
            type: 'column',
            categories: ['一月', '二月', '三月', '四月'],
            colors: sunset,
            stacked: true,
            style: blossomSurface,
            series: [
                { name: '鲜果', data: [32, 48, 42, 58] },
                { name: '甜品', data: [24, 28, 38, 32] },
                { name: '手作', data: [16, 22, 18, 28] },
            ],
        }),
        example('diverging', '正负对比 · 物资变化', '收入与消耗分列零线两侧，保留真实正负值。', {
            type: 'column',
            categories: ['木材', '种子', '石料', '布料'],
            colors: [meadow[0], sunset[0]],
            series: [
                { name: '补充', data: [42, 28, 54, 36] },
                { name: '消耗', data: [-26, -18, -32, -20] },
            ],
        }),
    ],
    bar: [
        example('ranking', '单色排名 · 步道人气', '按到访量排列，让较长的地点名称也容易阅读。', {
            type: 'bar',
            categories: ['海风步道', '森林小径', '日落栈桥', '花田环线'],
            colors: forest,
            legend: false,
            max: 120,
            series: [{ name: '到访人数', data: [102, 86, 65, 42] }],
        }),
        example('grouped', '双组对照 · 周末到访', '暖色背景搭配两组条形，比较不同区域的变化。', {
            type: 'bar',
            categories: ['果园', '海岸', '营地'],
            colors: [sunset[0], flowers[0]],
            style: creamSurface,
            series: [
                { name: '本周', data: [72, 94, 58] },
                { name: '上周', data: [54, 68, 70] },
            ],
        }),
        example('share', '百分比堆叠 · 预约来源', '各行合计 100%，对比不同渠道的构成。', {
            type: 'bar',
            categories: ['露营', '野餐', '观星', '采果'],
            colors: meadow,
            stacked: true,
            max: 100,
            valueFormatter: formatPercent,
            series: [
                { name: '提前预约', data: [60, 45, 75, 50] },
                { name: '现场报名', data: [25, 40, 15, 30] },
                { name: '团体安排', data: [15, 15, 10, 20] },
            ],
        }),
        example('balance', '双向条形 · 预算结余', '用单点颜色区分结余与超支，突出零线。', {
            type: 'bar',
            categories: ['花田', '营地', '步道', '集市'],
            legend: false,
            style: mintSurface,
            series: [
                {
                    name: '预算结余',
                    data: namedPoints(
                        ['花田', '营地', '步道', '集市'],
                        [32, -18, 48, -26],
                        [meadow[0], sunset[0], meadow[0], sunset[0]]
                    ),
                },
            ],
        }),
    ],
    line: [
        example('smooth', '柔和曲线 · 一周到访', '双系列平滑连接，适合观察整体趋势。', {
            type: 'line',
            categories: ['一', '二', '三', '四', '五', '六', '日'],
            smooth: true,
            colors: [meadow[0], sunset[0]],
            series: [
                { name: '海岸', data: [22, 38, 30, 52, 45, 78, 64] },
                { name: '森林', data: [16, 24, 36, 28, 42, 55, 48] },
            ],
        }),
        example('labels', '标记折线 · 每月新成员', '保留折点与数值，适合读取少量关键指标。', {
            type: 'line',
            categories: ['一月', '二月', '三月', '四月', '五月'],
            colors: [flowers[0]],
            showLabels: true,
            legend: false,
            max: 100,
            style: blossomSurface,
            series: [{ name: '新成员', data: [24, 42, 36, 68, 82] }],
        }),
        example('minimal', '无网格曲线 · 阅读时长', '隐藏坐标和图例，悬浮仍能读取日期与分钟数。', {
            type: 'line',
            categories: ['周一', '周二', '周三', '周四', '周五', '周六'],
            colors: forest,
            smooth: true,
            showAxes: false,
            legend: false,
            style: mintSurface,
            series: [{ name: '阅读分钟', data: [15, 32, 24, 45, 38, 60] }],
        }),
        example('gaps', '缺测断点 · 环境观察', '缺失记录保留断口，不把未知数据补成零。', {
            type: 'line',
            categories: ['一', '二', '三', '四', '五', '六', '日'],
            colors: [sunset[0], flowers[0]],
            series: [
                { name: '海岸', data: [62, 70, null, 78, 68, 82, 76] },
                { name: '林地', data: [48, 58, 64, 56, null, 70, 66] },
            ],
        }),
    ],
    area: [
        example('smooth', '薄荷面积 · 到访走势', '单系列曲线与柔和填充，强调趋势和体量。', {
            type: 'area',
            categories: ['一', '二', '三', '四', '五', '六', '日'],
            colors: forest,
            smooth: true,
            legend: false,
            style: mintSurface,
            series: [{ name: '到访人数', data: [24, 42, 34, 58, 48, 86, 72] }],
        }),
        example('comparison', '多色叠映 · 区域热度', '面积透明叠映，三条曲线分别读取，不做堆叠。', {
            type: 'area',
            categories: ['春', '夏', '秋', '冬'],
            colors: [flowers[0], sunset[0], meadow[0]],
            smooth: true,
            series: [
                { name: '海岸', data: [35, 88, 62, 28] },
                { name: '花田', data: [78, 52, 45, 22] },
                { name: '森林', data: [42, 65, 80, 45] },
            ],
        }),
        example('minimal', '暖色留白 · 采收节奏', '隐藏网格、保留关键数值，适合概览中的趋势块。', {
            type: 'area',
            categories: ['第一批', '第二批', '第三批', '第四批'],
            colors: sunset,
            legend: false,
            showAxes: false,
            showLabels: true,
            max: 100,
            style: creamSurface,
            series: [{ name: '采收篮数', data: [28, 54, 42, 76] }],
        }),
        example('signed', '跨零面积 · 库存净变化', '以零为基线，正负面积表达补充和消耗。', {
            type: 'area',
            categories: ['一', '二', '三', '四', '五', '六'],
            colors: [flowers[0]],
            legend: false,
            series: [{ name: '净变化', data: [30, 12, -24, -10, 28, 46] }],
        }),
    ],
    mount: [
        example('colored', '彩色山丘 · 分区人气', '不同区域用独立颜色，山丘高度代表到访量。', {
            type: 'mount',
            categories: ['果园', '海岸', '营地', '花田'],
            legend: false,
            showLabels: true,
            max: 100,
            series: [
                { name: '到访人数', data: namedPoints(['果园', '海岸', '营地', '花田'], [58, 86, 42, 68], meadow) },
            ],
        }),
        example('forest', '林间山丘 · 四季采收', '统一草绿色，突出季节之间的高低变化。', {
            type: 'mount',
            categories: ['春', '夏', '秋', '冬'],
            colors: forest,
            legend: false,
            style: mintSurface,
            series: [{ name: '采收篮数', data: [36, 68, 92, 24] }],
        }),
        example('clean', '暖色山丘 · 四处日落', '隐藏坐标网格，以直接标注配合柔和填充。', {
            type: 'mount',
            categories: ['栈桥', '灯塔', '山顶', '海滩'],
            legend: false,
            showAxes: false,
            showLabels: true,
            max: 100,
            style: creamSurface,
            series: [
                { name: '观景人数', data: namedPoints(['栈桥', '灯塔', '山顶', '海滩'], [72, 46, 84, 58], sunset) },
            ],
        }),
        example('signed', '双向山丘 · 花田净增', '山丘可跨零展示，使用正负配色表达增减。', {
            type: 'mount',
            categories: ['春', '夏', '秋', '冬'],
            legend: false,
            series: [
                {
                    name: '花株净增',
                    data: namedPoints(
                        ['春', '夏', '秋', '冬'],
                        [68, 42, -18, -36],
                        [meadow[0], meadow[1], sunset[0], flowers[0]]
                    ),
                },
            ],
        }),
    ],
    mix: [
        example('target', '柱线组合 · 预约与目标', '柱体显示实际人数，折线显示同单位的目标。', {
            type: 'mix',
            categories: ['周五', '周六', '周日', '假日'],
            colors: [meadow[0], sunset[0]],
            series: [
                { name: '实际预约', type: 'column', data: [42, 68, 58, 88] },
                { name: '预约目标', type: 'line', data: [50, 60, 65, 80] },
            ],
        }),
        example('area-line', '面积与曲线 · 新旧步道', '面积衬托旧步道，曲线强调新步道的增长。', {
            type: 'mix',
            categories: ['一', '二', '三', '四', '五', '六'],
            colors: [meadow[1], flowers[0]],
            smooth: true,
            style: mintSurface,
            series: [
                { name: '旧步道', type: 'area', data: [64, 58, 72, 66, 78, 70] },
                { name: '新步道', type: 'line', data: [18, 30, 42, 38, 58, 76] },
            ],
        }),
        example('three-series', '分组柱线 · 活动参与', '两类活动分组对照，折线补充参与人数合计。', {
            type: 'mix',
            categories: ['春', '夏', '秋', '冬'],
            colors: [sunset[0], flowers[0], meadow[0]],
            smooth: true,
            style: creamSurface,
            series: [
                { name: '采果', type: 'column', data: [28, 42, 52, 18] },
                { name: '手作', type: 'column', data: [18, 30, 26, 38] },
                { name: '合计', type: 'line', data: [46, 72, 78, 56] },
            ],
        }),
        example('balance', '收支与结余 · 海岛物资', '三条系列共用一条数值轴，单位保持一致。', {
            type: 'mix',
            categories: ['一月', '二月', '三月', '四月'],
            colors: [meadow[0], sunset[0], flowers[0]],
            series: [
                { name: '收入', type: 'column', data: [52, 68, 42, 76] },
                { name: '支出', type: 'column', data: [-32, -48, -58, -42] },
                { name: '结余', type: 'line', data: [20, 20, -16, 34] },
            ],
        }),
    ],
};

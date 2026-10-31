# NoData

源码：`src/components/NoData/`。可复用空内容展示，沿用组件库字体、大地棕文字、奶油表面及 `naive-icons`。不增加请求、定时器或运行时依赖。

# 变体与结构

`default` 使用奶油白与浅薄荷色的叠放手账纸，点缀小胶带和 LeafIcon 印记。`search` 沿用纸张组合，叠加浅绿 SearchIcon，默认标题为“没有找到相关结果”。`simple` 仅保留一张直立的留白纸，不显示胶带、叶片与阴影。其他变体默认标题为“暂无数据”。纸张由 CSS 几何装饰构成，具象图标仍来自 naive-icons。全部图形对辅助技术隐藏。

内容顺序为图形、标题、可选说明、可选操作区。title/icon 为 undefined 时采用默认值，null/false 隐藏。extra 优先于 children。bordered 添加 1.5px 沙色虚线、20px 圆角与 `var(--animal-bg-color, #faf8f1)` 主题背景；默认关闭，便于放入已有卡片。

# 视觉规范

| 部分 | 规范 |
| --- | --- |
| Small | 18px × 12px 内边距，图形宽 108px；14px 标题、12px 说明；图形下间距与操作区上间距 14px，说明上间距 5px。 |
| Medium | 32px × 24px 内边距，图形 164 × 126px；16px 标题、13px 说明；图形下间距与操作区上间距 22px，说明上间距 8px。 |
| Large | 40px × 24px 内边距，图形宽 200px、保持相同比例；18px 标题、14px 说明；图形下间距 26px。 |
| 文字 | 组件库字体，标题 700，正文继承 500。标题继承 `--animal-text-color`，说明使用 `var(--animal-text-color-secondary, #7f6e57)`，行高 1.8，最大 32ch，均衡换行避免末行只剩单个词。 |
| 纸张 | 前景奶油白 #fffdf5、1.5px 沙色 #d8cdb7 勾线、13px 圆角（small 为 9px），旋转 8 度；背纸浅薄荷 #deebe0、#a8c4af 勾线，旋转 −13 度。小暖色胶带和两条短留白线补充纸张结构。使用 0 7px 14px 柔和棕色投影，不使用硬偏移立体阴影。 |
| 搜索态 | 前纸旋转 4 度，右下方放大镜采用 #9fbdab / #809b8b。内置图标的描边与填充仅在装饰区覆盖，不改变调用方图标的颜色。 |
| 简洁/自定义 | 简洁态使用图形宽度 55% 的单张平面纸。自定义图标保持直立，外部奶油色方片旋转 −4 度；简洁态移除方片边框、背景和阴影。自定义图标尺寸仍为 32/52/64px。 |
| 操作区 | 居中 flex，间距 12px，窄容器自动换行；复用 Button 样式与焦点态。 |
| 动效 | 静态展示，没有持续播放的空态动画。 |

可在根节点通过 `--no-data-paper`、`--no-data-paper-line`、`--no-data-mint`、`--no-data-mint-line` 调整纸张配色。图形宽度不超出容器。原生属性、标题/说明/图标插槽与操作区优先级保持不变。

# 语义与组合

根节点为原生 div，可透传原生属性，不强制给静态页面内容增加实时播报。业务需要动态播报时可传 role="status" 或 aria-live。图形区设置 aria-hidden，标题、说明和操作区保持可读与可交互。使用简洁的恢复说明，并为操作区传入真实回调。

Chart 的无数据、缺少地图轮廓和图例全隐藏场景使用 small 变体；图例全隐藏提供恢复全部操作。Table 保留现有空态图标，在 emptyText 中放置 NoData 时可传 icon={null}。不改变原有 Table 行为。

独立演示位于 **反馈 → NoData 空状态**，顶部新增独立的手账/搜索并排预览，随后保留基础用法、可操作的搜索恢复（通过持久的礼貌活区播报结果数量或无匹配）、表格新建操作、多尺寸、自定义图标和纯文字。属性与示例见 [NoData 参考](https://github.com/guokaigdg/animal-island-ui/blob/main/skills/animal-island-ui-style/references/components/no-data.md)。

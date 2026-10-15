# ADR 0005: 以 dayjs 作为日期层

## 状态

已接受（v2.3.0）—— 取代 [ADR 0001](0001-zero-runtime-dependencies.md) 中「不得再新增运行时依赖」这一条，该记录的其余内容保持不变。

## 背景

ADR 0001 定下的规则是：本库不声明任何运行时依赖，此后仅为图标开过一次例外。如今有两件事在顶撞这条绝对规则：

1. **日期逻辑是组件库中最容易出现隐性错误的部分。** `DatePicker` 与 `Countdown` 各自长出了一套私有日期代码：用 `new Date(year, month + 1, 0).getDate()` 推算月份网格，用 `getFullYear/getMonth/getDate` 三个字段逐个比较来判断同一天/同一月，用链式 `String.replace` 做字符串格式化，用时间戳相减做倒计时。每一处都是时区、月份长度、日序号溢出会导致 bug、而代码评审又很难看出来的地方。
2. **日期相关的面积即将扩大。** [discussion #38](https://github.com/guokaigdg/animal-island-ui/discussions/38) 中提出的日历/日程组件，需要周起始日处理、locale 月份名，可能还需要时区感知。现有的手写工具函数一个都接不住，每一条都得推倒重建。

ADR 0001 给出的退路是「内置一份实现进 `src/`」，但这对日期库并不成立。日期库是两千多行、靠长期积累堆出来的边界情况处理；把它裁剪成本库当前所需再内置，等新需求出现又要重新裁剪与验证 —— 到那时它既不小、也不低风险。

## 决策

`dayjs` 成为 `dependencies` 下的第二条运行时依赖，也是 `src/` 中做日期运算、解析、格式化与比较的唯一许可方式：

```json
"dependencies": {
    "dayjs": "^1.11.23",
    "naive-icons": "^1.6.0"
}
```

- **内联打包，而非 external。** 与 peer 包不同，`dayjs` 有意不进入 `vite.config.ts` 的 `external` 列表。它被产出为 `dist/es/node_modules/dayjs/dayjs.min.js`（以及 CJS 版本）一份文件，由所有引入它的组件共享 —— 消费者无需额外安装、也不会出现第二份副本。同时 `preserveModules` 仍能让未引入任何日期组件的消费者完全摇掉它。
- **插件在用到的模块里注册。** `dayjs.extend(customParseFormat)` 写在需要它的模块顶部。严格解析 `value` / `defaultValue` 必须依赖 `customParseFormat`：正是它让 `2026-02-30` 这类不存在的日期被判定为非法，而不是被静默进位成 3 月 2 日。
- **不碰 locale。** 本库永不会调用 `dayjs.locale(...)`。locale 是进程级状态，归宿主应用所有；在组件内部改动它，会连带改变消费者自己的 dayjs 代码行为。
- **墙上时钟的值不掺和进来。** `TimePicker` 持有的是 `{ h, m, s }` 挂钟值，`Time` 渲染的是当前挂钟。二者都不做日期运算，也都不引入 dayjs —— 给一个纯时间附上一个日历日期，只会制造夏令时 bug，而不是消除它们。

未来若还要新增运行时依赖，仍需单独开一份记录。本次决策刻意收窄：它只为日期库开口子，不等于整体放宽规则。

## 影响

- 零传递依赖的性质得以保持：`dayjs` 自身不声明任何依赖，安装本库依然只多一个包。
- 对引入 `DatePicker`、`Countdown` 或未来日期组件的消费者，包体增大约 3 kB（gzip）；不引入这些组件的消费者则毫无增加。
- 日期行为变得一致且可评审 —— 一套库的语义，取代四份私有实现 —— 日历组件也能建立在一个已经懂周、月与 locale 的基础之上。
- `dayjs` 的 locale 注册表是与宿主应用共享的可变模块状态。永远不调用 `dayjs.locale()` 是这份共享安全的前提；未来若有组件需要 locale，必须以 prop 传入并通过局部实例格式化，而不是改全局。
- `DatePicker` 的日期格式化改为遵循 dayjs 的 token。此前记录的占位符子集（`YYYY` / `MM` / `DD` / `M` / `D`）渲染结果完全一致；而 `HH:mm` 这类额外 token 现在会真实插值，不再是原样输出。

## 相关记录

- 取代 [ADR 0001](0001-zero-runtime-dependencies.md) 中「不得再新增运行时依赖」这一条。
- 本次决策有意不改动的 externals 列表，属于 [ADR 0003](0003-vite-library-mode-build.md) 的内容。

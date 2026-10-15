import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import styles from './date-picker.module.less';

// 严格解析插件：拒绝 2026-02-30 这类会被原生 Date 静默进位的非法日期
dayjs.extend(customParseFormat);

export type DatePickerSize = 'small' | 'middle' | 'large';

export type DatePickerStatus = 'error' | 'warning';

/** 选中值：日期模式为 YYYY-MM-DD，范围模式为 [开始, 结束]，清空为 null */
export type DatePickerValue = string | [string, string] | null;

export interface DatePickerProps {
    /** 范围选择模式：联动选择开始日期与结束日期 */
    range?: boolean;
    /** 选择粒度：date 选择日期（YYYY-MM-DD），month 选择月份（YYYY-MM），面板直接打开月份网格 */
    picker?: 'date' | 'month';
    /** 当前选中值（受控）；日期模式为 YYYY-MM-DD，范围模式为 [开始, 结束]，清空为 null */
    value?: DatePickerValue;
    /** 默认选中值（非受控）；日期模式为 YYYY-MM-DD，范围模式为 [开始, 结束] */
    defaultValue?: string | [string, string];
    /** 值变化回调；日期模式返回 YYYY-MM-DD，范围模式返回 [开始, 结束]，清空返回 null */
    onChange?: (value: DatePickerValue) => void;
    /** 占位文本 */
    placeholder?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否允许一键清空 */
    allowClear?: boolean;
    /** 尺寸 */
    size?: DatePickerSize;
    /** 校验状态 */
    status?: DatePickerStatus;
    /** 展示格式，占位符遵循 dayjs 的 token（YYYY / MM / DD / M / D 等），默认 YYYY-MM-DD */
    format?: string;
    /** 禁用日期判断函数，返回 true 的日期不可选 */
    disabledDate?: (date: Date) => boolean;
    /** 受控展开状态 */
    open?: boolean;
    /** 展开状态变化回调 */
    onOpenChange?: (open: boolean) => void;
    /** 面板底部是否显示「今天」快捷按钮 */
    showToday?: boolean;
    /** 对外暴露的无障碍标签（无可见 label 时使用） */
    'aria-label'?: string;
    /** 关联外部可见 label 的 id */
    'aria-labelledby'?: string;
    /** 额外类名 */
    className?: string;
    /** 行内样式 */
    style?: React.CSSProperties;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

/** 日期网格固定补满 6 行 × 7 列 */
const GRID_CELLS = 42;

/** 解析 YYYY-MM-DD / YYYY-M-D / YYYY-MM，非法输入返回 null（严格模式，不回退到原生 Date 的进位行为） */
const parseValue = (value: string | null | undefined): Dayjs | null => {
    if (!value) return null;
    const parsed = dayjs(value, ['YYYY-MM-DD', 'YYYY-M-D', 'YYYY-MM'], true);
    return parsed.isValid() ? parsed : null;
};

/** 序列化为 YYYY-MM-DD */
const toValue = (date: Dayjs) => date.format('YYYY-MM-DD');

/** 序列化为 YYYY-MM（月份选择模式的值） */
const toMonthValue = (date: Dayjs) => date.format('YYYY-MM');

const isSameDay = (a: Dayjs, b: Dayjs) => a.isSame(b, 'day');

const isSameMonth = (a: Dayjs, b: Dayjs) => a.isSame(b, 'month');

/** 解析范围值 [开始, 结束]，任一端非法或非数组均返回 null */
const parseRange = (value: DatePickerValue): [Dayjs, Dayjs] | null => {
    if (!value || typeof value === 'string') return null;
    const start = parseValue(value[0]);
    const end = parseValue(value[1]);
    return start && end ? [start, end] : null;
};

/** 关闭退场动画时长，与 .panel 的 0.2s 过渡保持一致，动画结束后再卸载面板 */
const CLOSE_ANIMATION_MS = 200;

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    defaultValue,
    onChange,
    range = false,
    picker = 'date',
    placeholder = '请选择日期',
    disabled = false,
    allowClear = false,
    size = 'middle',
    status,
    format = picker === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD',
    disabledDate,
    open: openProp,
    onOpenChange,
    showToday = true,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
}) => {
    const [innerValue, setInnerValue] = useState<DatePickerValue>(defaultValue ?? null);
    const [innerOpen, setInnerOpen] = useState(false);
    const [viewDate, setViewDate] = useState(
        () => parseValue(typeof defaultValue === 'string' ? defaultValue : null) ?? dayjs()
    );
    const [mode, setMode] = useState<'date' | 'month' | 'year'>('date');
    const [focusedDate, setFocusedDate] = useState(
        () => parseValue(typeof defaultValue === 'string' ? defaultValue : null) ?? dayjs()
    );
    const [rangeStart, setRangeStart] = useState<Dayjs | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Dayjs | null>(null);
    const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
    /** 单日期模式待选日期（点选后尚未确认） */
    const [pendingDate, setPendingDate] = useState<Dayjs | null>(null);
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);
    const [closing, setClosing] = useState(false);
    const closingRef = useRef(false);
    const closeTimerRef = useRef<number | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const isControlled = value !== undefined;
    const currentValue: DatePickerValue = isControlled ? (value ?? null) : innerValue;
    const selectedDate = range ? null : parseValue(typeof currentValue === 'string' ? currentValue : null);
    const selectedRange = range ? parseRange(currentValue) : null;
    const open = openProp !== undefined ? openProp : innerOpen;

    const idPrefix = `animal-date-picker-${useId().replace(/:/g, '')}`;
    const panelId = `${idPrefix}-panel`;

    // 面板展开时重置视图所用到的当前值引用，避免值变化本身触发重置
    const valueRef = useRef(currentValue);
    useEffect(() => {
        valueRef.current = currentValue;
    }, [currentValue]);

    const setOpen = useCallback(
        (next: boolean) => {
            if (openProp === undefined) setInnerOpen(next);
            onOpenChange?.(next);
        },
        [openProp, onOpenChange]
    );

    // 统一关闭入口：先播放退场动效，动画结束后再卸载面板
    const closePanel = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        setClosing(true);
        closeTimerRef.current = window.setTimeout(() => {
            closingRef.current = false;
            setClosing(false);
            setOpen(false);
            setMounted(false);
            setRangeStart(null);
            setRangeEnd(null);
            setHoverDate(null);
            setPendingDate(null);
        }, CLOSE_ANIMATION_MS);
    }, [setOpen]);

    // 组件卸载时清理未触发的关闭定时器
    useEffect(
        () => () => {
            if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
        },
        []
    );

    // 每次展开时把面板视图重置到当前选中值（无选中则回到今天）
    useEffect(() => {
        if (!open) return;
        // 重新展开：取消未完成的退场动画
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        closingRef.current = false;
        setClosing(false);
        const current = valueRef.current;
        const base = range
            ? (parseRange(current)?.[0] ?? dayjs())
            : (parseValue(typeof current === 'string' ? current : null) ?? dayjs());
        setViewDate(base);
        setFocusedDate(base);
        setMode(picker === 'month' && !range ? 'month' : 'date');
        setRangeStart(null);
        setRangeEnd(null);
        setHoverDate(null);
        setPendingDate(null);
    }, [open, range, picker]);

    // 点击面板外部关闭
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                closePanel();
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, closePanel]);

    // 面板定位：优先向下展开，下方空间不足且上方更宽裕时向上翻转
    useEffect(() => {
        if (open && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const panelHeight = 340;
            const newStyle: React.CSSProperties = { position: 'absolute', left: 0 };
            if (rect.bottom + panelHeight > viewportHeight && rect.top > viewportHeight - rect.bottom) {
                newStyle.bottom = '100%';
                newStyle.marginBottom = '6px';
            } else {
                newStyle.top = '100%';
                newStyle.marginTop = '6px';
            }
            // 右侧空间不足时右对齐
            if (rect.left + (range ? 620 : 300) > window.innerWidth) {
                newStyle.right = 0;
                newStyle.left = 'auto';
            }
            setPanelStyle(newStyle);
            requestAnimationFrame(() => setMounted(true));
        } else if (!open) {
            setMounted(false);
        }
    }, [open, range]);

    // 点选日期：仅更新待选值，点击「确定」后才提交并关闭
    const selectDate = useCallback(
        (date: Dayjs) => {
            if (disabledDate?.(date.toDate())) return;
            if (!range) {
                setPendingDate(date);
                return;
            }
            // 范围模式：第一次点击确定开始日期，第二次点击确定结束日期
            if (!rangeStart) {
                setRangeStart(date);
                return;
            }
            if (date.isBefore(rangeStart, 'day')) {
                // 第二次点击早于开始日期：以它作为新的开始日期
                setRangeStart(date);
                return;
            }
            setRangeEnd(date);
        },
        [disabledDate, range, rangeStart]
    );

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) setInnerValue(null);
        onChange?.(null);
        triggerRef.current?.focus();
    };

    const shiftView = (yearDelta: number, monthDelta = 0) => {
        setViewDate(viewDate.date(1).add(yearDelta, 'year').add(monthDelta, 'month'));
    };

    const handleToday = () => {
        const today = dayjs();
        if (!range) {
            // 单日期模式：跳转到今天所在月份，并把今天设为待选日期
            setViewDate(today.date(1));
            setFocusedDate(today);
            setMode(picker === 'month' ? 'month' : 'date');
            setPendingDate(today);
            return;
        }
        // 范围模式：「今天」仅负责把视图跳转到今天所在月份
        setViewDate(today.date(1));
        setFocusedDate(today);
        setRangeStart(null);
        setRangeEnd(null);
    };

    // 确定：提交待选值并关闭面板；无待选值（或范围不完整）时仅关闭
    const confirmTime = () => {
        if (!range) {
            if (pendingDate) {
                const next = picker === 'month' ? toMonthValue(pendingDate) : toValue(pendingDate);
                if (!isControlled) setInnerValue(next);
                onChange?.(next);
            }
            closePanel();
            triggerRef.current?.focus();
            return;
        }
        if (rangeStart && rangeEnd) {
            const next: [string, string] = [toValue(rangeStart), toValue(rangeEnd)];
            if (!isControlled) setInnerValue(next);
            onChange?.(next);
        }
        closePanel();
        triggerRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const { key } = e;
        if (!open) {
            if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }
        if (key === 'Escape') {
            e.preventDefault();
            closePanel();
            triggerRef.current?.focus();
            return;
        }
        if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            if (mode === 'date') {
                if (disabledDate?.(focusedDate.toDate())) return;
                if (range) {
                    // 范围模式：回车依次确定开始日期与结束日期（待选）
                    if (!rangeStart) {
                        setRangeStart(focusedDate);
                    } else if (focusedDate.isBefore(rangeStart, 'day')) {
                        setRangeStart(focusedDate);
                    } else {
                        setRangeEnd(focusedDate);
                    }
                    return;
                }
                setPendingDate(focusedDate);
            } else if (mode === 'month') {
                if (picker === 'month' && !range) {
                    // 月份选择模式：回车设为待选月份
                    setPendingDate(viewDate.date(1));
                } else {
                    setViewDate(viewDate.date(1));
                    setFocusedDate(viewDate.date(1));
                    setMode('date');
                }
            } else {
                setFocusedDate(viewDate.date(1));
                setMode('month');
            }
            return;
        }
        if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
            e.preventDefault();
            const delta = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? -7 : 7;
            if (mode === 'date') {
                const next = focusedDate.add(delta, 'day');
                setFocusedDate(next);
                if (!isSameMonth(next, viewDate)) setViewDate(next.date(1));
            } else if (mode === 'month') {
                const next = viewDate.add(delta, 'month').date(1);
                setViewDate(next);
                setFocusedDate(next);
            } else {
                const next = viewDate.add(delta, 'year').date(1);
                setViewDate(next);
                setFocusedDate(next);
            }
            return;
        }
        if (key === 'PageUp' || key === 'PageDown') {
            e.preventDefault();
            const delta = key === 'PageUp' ? -1 : 1;
            if (mode === 'date') {
                const next = viewDate.add(delta, 'month').date(1);
                setViewDate(next);
                setFocusedDate(next.date(focusedDate.date()));
            } else if (mode === 'month') {
                const next = viewDate.add(delta, 'year').date(1);
                setViewDate(next);
                setFocusedDate(next);
            } else {
                const next = viewDate.add(delta * 10, 'year').date(1);
                setViewDate(next);
                setFocusedDate(next);
            }
        }
    };

    // 构建日期网格：固定 6 行 × 7 列，首尾补齐上/下月日期
    const buildCells = (vDate: Dayjs): Dayjs[] => {
        const first = vDate.date(1);
        // 由本月 1 日是星期几决定向前补几天（周日起始）
        const gridStart = first.subtract(first.day(), 'day');
        return Array.from({ length: GRID_CELLS }, (_, i) => gridStart.add(i, 'day'));
    };

    const today = dayjs();

    // 渲染某个月份的星期表头 + 日期网格（范围模式左右面板共用）
    const renderDayGrid = (vDate: Dayjs) => {
        const vMonth = vDate.month();
        return (
            <>
                <div className={styles.weekRow}>
                    {WEEKDAYS.map((w) => (
                        <div key={w} className={styles.weekCell}>
                            {w}
                        </div>
                    ))}
                </div>
                <div className={styles.grid}>
                    {buildCells(vDate).map((cell) => {
                        const disabledCell = disabledDate?.(cell.toDate()) === true;
                        const isToday = isSameDay(cell, today);
                        const outside = cell.month() !== vMonth;
                        let selected = false;
                        let rangeStartCell = false;
                        let rangeEndCell = false;
                        let inRange = false;
                        if (range) {
                            // 有效范围端点：进行中的选择（预览）优先于已选范围
                            let effStart: Dayjs | null = null;
                            let effEnd: Dayjs | null = null;
                            if (rangeStart) {
                                if (rangeEnd) {
                                    // 已选定开始与结束：以待选范围高亮
                                    effStart = rangeStart;
                                    effEnd = rangeEnd;
                                } else if (hoverDate && hoverDate.isBefore(rangeStart, 'day')) {
                                    // 反向预览：悬停日期作为新的潜在起点
                                    effStart = hoverDate;
                                    effEnd = rangeStart;
                                } else {
                                    effStart = rangeStart;
                                    effEnd = hoverDate && hoverDate.isAfter(rangeStart, 'day') ? hoverDate : rangeStart;
                                }
                            } else if (selectedRange) {
                                effStart = selectedRange[0];
                                effEnd = selectedRange[1];
                            }
                            if (effStart && effEnd) {
                                rangeStartCell = isSameDay(cell, effStart);
                                rangeEndCell = isSameDay(cell, effEnd);
                                inRange = cell.isAfter(effStart, 'day') && cell.isBefore(effEnd, 'day');
                            }
                        } else {
                            const activeDate = pendingDate ?? selectedDate;
                            selected = !!activeDate && isSameDay(cell, activeDate);
                        }
                        const cls = [
                            styles.dayCell,
                            outside && styles.dayCellOutside,
                            // 范围模式不圈出今天
                            !range && isToday && styles.dayCellToday,
                            selected && styles.dayCellSelected,
                            rangeStartCell && styles.dayCellRangeStart,
                            rangeEndCell && styles.dayCellRangeEnd,
                            inRange && styles.dayCellInRange,
                            disabledCell && styles.dayCellDisabled,
                        ]
                            .filter(Boolean)
                            .join(' ');
                        return (
                            <button
                                key={cell.valueOf()}
                                type="button"
                                className={cls}
                                aria-label={`${cell.year()}年${cell.month() + 1}月${cell.date()}日`}
                                aria-disabled={disabledCell || undefined}
                                disabled={disabledCell}
                                onClick={() => selectDate(cell)}
                                onMouseEnter={() => range && setHoverDate(cell)}
                                onMouseLeave={() => range && setHoverDate(null)}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {cell.date()}
                            </button>
                        );
                    })}
                </div>
            </>
        );
    };

    const year = viewDate.year();
    const month = viewDate.month();
    const startYear = Math.floor(year / 10) * 10;
    const yearCells = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

    const triggerCls = [
        styles.trigger,
        styles[`trigger-${size}`],
        status && styles[`trigger-${status}`],
        open && styles['trigger-open'],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            ref={wrapperRef}
            className={[styles.wrapper, disabled && styles['wrapper-disabled'], className].filter(Boolean).join(' ')}
            style={style}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
                // 仅当焦点明确移出 wrapper（如 Tab 到外部元素）时关闭；
                // 点击面板空白区域（relatedTarget 为 null）不关闭，外部点击由 mousedown 监听处理
                if (open && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) {
                    closePanel();
                }
            }}
        >
            <div
                ref={triggerRef}
                role="combobox"
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-controls={open ? panelId : undefined}
                aria-disabled={disabled || undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                tabIndex={disabled ? -1 : 0}
                className={triggerCls}
                onClick={() => !disabled && !closing && setOpen(!open)}
            >
                {range ? (
                    open && rangeStart ? (
                        // 正在选择：实时显示待选的开始与结束日期
                        <>
                            <span className={styles.value}>{rangeStart.format(format)}</span>
                            <span className={styles.rangeDivider} aria-hidden />
                            <span className={rangeEnd ? styles.value : styles.placeholder}>
                                {rangeEnd ? rangeEnd.format(format) : placeholder}
                            </span>
                        </>
                    ) : selectedRange ? (
                        <>
                            <span className={styles.value}>{selectedRange[0].format(format)}</span>
                            <span className={styles.rangeDivider} aria-hidden />
                            <span className={styles.value}>{selectedRange[1].format(format)}</span>
                        </>
                    ) : (
                        <span className={styles.placeholder}>{placeholder}</span>
                    )
                ) : (
                    <span className={currentValue || (open && pendingDate) ? styles.value : styles.placeholder}>
                        {open && pendingDate
                            ? pendingDate.format(format)
                            : selectedDate
                              ? selectedDate.format(format)
                              : placeholder}
                    </span>
                )}
                {allowClear && currentValue && !disabled && (
                    <button
                        type="button"
                        className={styles.clear}
                        aria-label="清除日期"
                        onClick={handleClear}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        ×
                    </button>
                )}
                <span className={styles.calendarIcon} aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M1.5 5.5h11" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M4.7 1v2.4M9.3 1v2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                </span>
            </div>
            {open && (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label={range ? '选择日期范围' : '选择日期'}
                    className={`${styles.panel} ${range ? styles.panelRange : ''} ${
                        closing ? styles.panelClosing : mounted ? styles.panelVisible : ''
                    }`}
                    style={panelStyle}
                >
                    {range ? (
                        <>
                            <div className={styles.rangePanels}>
                                {[viewDate, viewDate.date(1).add(1, 'month')].map((panelDate, idx) => (
                                    <div key={panelDate.valueOf()} className={styles.rangePanel}>
                                        <div className={styles.header}>
                                            <div className={styles.headerGroup}>
                                                {idx === 0 && (
                                                    <button
                                                        type="button"
                                                        className={styles.navBtn}
                                                        aria-label="上一年"
                                                        onClick={() => shiftView(-1, 0)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                    >
                                                        <svg
                                                            className={styles.navIcon}
                                                            viewBox="0 0 12 12"
                                                            fill="none"
                                                            aria-hidden
                                                        >
                                                            <path
                                                                d="M7.5 2.5L4 6l3.5 3.5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                                {idx === 0 && (
                                                    <button
                                                        type="button"
                                                        className={styles.navBtn}
                                                        aria-label="上个月"
                                                        onClick={() => shiftView(0, -1)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                    >
                                                        <svg
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 12 12"
                                                            fill="none"
                                                            aria-hidden
                                                        >
                                                            <path
                                                                d="M7.5 2.5L4 6l3.5 3.5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <span className={styles.yearLabel}>
                                                {panelDate.year()}年{panelDate.month() + 1}月
                                            </span>
                                            <div className={styles.headerGroup}>
                                                {idx === 1 && (
                                                    <button
                                                        type="button"
                                                        className={styles.navBtn}
                                                        aria-label="下个月"
                                                        onClick={() => shiftView(0, 1)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                    >
                                                        <svg
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 12 12"
                                                            fill="none"
                                                            aria-hidden
                                                        >
                                                            <path
                                                                d="M4.5 2.5L8 6l-3.5 3.5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                                {idx === 1 && (
                                                    <button
                                                        type="button"
                                                        className={styles.navBtn}
                                                        aria-label="下一年"
                                                        onClick={() => shiftView(1, 0)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                    >
                                                        <svg
                                                            className={styles.navIcon}
                                                            viewBox="0 0 12 12"
                                                            fill="none"
                                                            aria-hidden
                                                        >
                                                            <path
                                                                d="M4.5 2.5L8 6l-3.5 3.5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {renderDayGrid(panelDate)}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.footer}>
                                <button
                                    type="button"
                                    className={styles.confirmBtn}
                                    onClick={confirmTime}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    确定
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.header}>
                                <div className={styles.headerGroup}>
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        aria-label="上一年"
                                        onClick={() => (mode === 'year' ? shiftView(-10, 0) : shiftView(-1, 0))}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <svg className={styles.navIcon} viewBox="0 0 12 12" fill="none" aria-hidden>
                                            <path
                                                d="M7.5 2.5L4 6l3.5 3.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                    {mode === 'date' && (
                                        <button
                                            type="button"
                                            className={styles.navBtn}
                                            aria-label="上个月"
                                            onClick={() => shiftView(0, -1)}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                                                <path
                                                    d="M7.5 2.5L4 6l3.5 3.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {mode === 'date' && (
                                    <button type="button" className={styles.labelBtn} onClick={() => setMode('year')}>
                                        {year}年{month + 1}月
                                    </button>
                                )}
                                {mode === 'month' && (
                                    <button type="button" className={styles.labelBtn} onClick={() => setMode('year')}>
                                        {year}年
                                    </button>
                                )}
                                {mode === 'year' && (
                                    <span className={styles.yearLabel}>
                                        {startYear} - {startYear + 9}年
                                    </span>
                                )}
                                <div className={styles.headerGroup}>
                                    {mode === 'date' && (
                                        <button
                                            type="button"
                                            className={styles.navBtn}
                                            aria-label="下个月"
                                            onClick={() => shiftView(0, 1)}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                                                <path
                                                    d="M4.5 2.5L8 6l-3.5 3.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.navBtn}
                                        aria-label="下一年"
                                        onClick={() => (mode === 'year' ? shiftView(10, 0) : shiftView(1, 0))}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <svg className={styles.navIcon} viewBox="0 0 12 12" fill="none" aria-hidden>
                                            <path
                                                d="M4.5 2.5L8 6l-3.5 3.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {mode === 'date' && <>{renderDayGrid(viewDate)}</>}
                            {mode === 'month' && (
                                <div className={styles.grid3x4}>
                                    {MONTHS.map((label, i) => {
                                        const activeDate = pendingDate ?? selectedDate;
                                        const selected =
                                            !!activeDate && activeDate.year() === year && activeDate.month() === i;
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                className={`${styles.monthCell} ${selected ? styles.monthCellSelected : ''}`}
                                                aria-label={`${i + 1}月`}
                                                onClick={() => {
                                                    const picked = viewDate.year(year).month(i).date(1);
                                                    if (picker === 'month' && !range) {
                                                        // 月份选择模式：点击即设为待选月份
                                                        setPendingDate(picked);
                                                    } else {
                                                        setViewDate(picked);
                                                        setFocusedDate(picked);
                                                        setMode('date');
                                                    }
                                                }}
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {mode === 'year' && (
                                <div className={styles.grid3x4}>
                                    {yearCells.map((y) => {
                                        const selected = selectedDate?.year() === y;
                                        return (
                                            <button
                                                key={y}
                                                type="button"
                                                className={`${styles.yearCell} ${selected ? styles.yearCellSelected : ''}`}
                                                aria-label={`${y}年`}
                                                onClick={() => {
                                                    setViewDate(viewDate.year(y).month(month).date(1));
                                                    setFocusedDate(viewDate.year(y).month(month).date(1));
                                                    setMode('month');
                                                }}
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                {y}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {(mode === 'date' || (picker === 'month' && mode === 'month')) && (
                                <div className={styles.footer}>
                                    {showToday && (
                                        <button
                                            type="button"
                                            className={styles.todayBtn}
                                            onClick={handleToday}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            今天
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.confirmBtn}
                                        onClick={confirmTime}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        确定
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

DatePicker.displayName = 'DatePicker';

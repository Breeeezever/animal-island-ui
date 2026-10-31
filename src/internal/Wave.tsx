import React, { useEffect, useRef, useState } from 'react';
import styles from './wave.module.less';

/** Divider、Progress 与 Upload 共用的装饰波层；颜色继承 currentColor。 */
interface WaveProps {
    /** 是否播放波浪；关闭后保留静态波形 */
    animated: boolean;
}

/** 双层无缝海浪，仅在视口内且页面可见时播放，不参与无障碍内容。 */
export const Wave: React.FC<WaveProps> = ({ animated }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || !animated) return;
        let visible = typeof IntersectionObserver === 'undefined';
        /** 合并视口与页面可见性，避免后台或离屏装饰持续运行。 */
        const update = () => {
            // 页面重新可见时仍需尊重最后一次视口观测结果。
            setPlaying(visible && !document.hidden);
        };
        const observer =
            typeof IntersectionObserver === 'undefined'
                ? undefined
                : new IntersectionObserver(([entry]) => {
                      visible = entry?.isIntersecting ?? false;
                      update();
                  });
        observer?.observe(element);
        document.addEventListener('visibilitychange', update);
        update();
        return () => {
            observer?.disconnect();
            document.removeEventListener('visibilitychange', update);
        };
    }, [animated]);

    return (
        <span
            ref={ref}
            aria-hidden="true"
            className={styles.wave}
            style={{ '--animal-wave-play-state': animated && playing ? 'running' : 'paused' } as React.CSSProperties}
        />
    );
};

Wave.displayName = 'Wave';

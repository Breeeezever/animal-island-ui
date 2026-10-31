import React from 'react';
import { Upload, type UploadProgressType, type UploadListType } from '../../../src';
import { CodeBlock, labelStyle, sectionTitleStyle } from '../../tools';

/** 两种进度展示方式，分别覆盖文字、缩略图和图片卡片列表。 */
const PROGRESS_MODES: { type: UploadProgressType; label: string }[] = [
    { type: 'background', label: '背景进度：整个文件项背景随百分比填充' },
    { type: 'bar', label: '条形进度：在文件名下方显示独立进度条' },
];

/** 每种列表保留一个固定进度示例，选择新文件时仍可体验内置模拟上传。 */
const LIST_TYPES: UploadListType[] = ['text', 'picture', 'picture-card'];

/** 独立上传进度示例，不改变原有基础、拖拽和图片上传示例。 */
export const UploadProgressDemo: React.FC = () => {
    // 示例中的预置文件仅用于稳定对比外观，不代表真实网络请求。
    return (
        <section aria-label="新增上传进度演示">
            <div style={sectionTitleStyle}>新增示例：两种上传进度</div>
            <p style={labelStyle}>预置文件为固定进度预览；点击上传可体验新文件的模拟进度。</p>
            {PROGRESS_MODES.map((mode) => (
                <div key={mode.type}>
                    <div style={labelStyle}>{mode.label}</div>
                    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
                        {LIST_TYPES.map((listType) => (
                            <Upload
                                key={listType}
                                listType={listType}
                                progress={{ type: mode.type, wave: true, color: '#19c8b9' }}
                                defaultFileList={[
                                    {
                                        uid: `${mode.type}-${listType}`,
                                        name: '海岛游记.png',
                                        status: 'uploading',
                                        percent: 46,
                                    },
                                ]}
                            />
                        ))}
                    </div>
                </div>
            ))}
            <CodeBlock
                code={`// 背景就是进度区域，不额外显示条形
<Upload progress={{ type: 'background', wave: true }} />

// 独立进度条
<Upload progress={{ type: 'bar', color: '#82d5bb', wave: true }} />

// 不传 progress，保留原来的转圈与百分比
<Upload />`}
            />
        </section>
    );
};

UploadProgressDemo.displayName = 'UploadProgressDemo';

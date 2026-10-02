# Data display components — props reference

Props/types below are copied from the library source. In an npm-installed project, the installed package's TypeScript declarations (`dist/types/index.d.ts`) are the ground truth — prefer exploring them when in doubt.

Covers: Table, Pagination, CodeBlock, Tag, Image, Avatar.

## Table

```ts
interface TableColumn<T = Record<string, unknown>> {
    title: React.ReactNode;
    dataIndex?: keyof T;
    render?: (value: unknown, record: T, index: number) => React.ReactNode;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    fixed?: 'left' | 'right';
    style?: React.CSSProperties;
}
interface TableProps<T = Record<string, unknown>> {
    columns?: TableColumn<T>[]; // default []
    dataSource?: T[]; // default []
    rowKey?: string | ((record: T) => string); // default 'key'
    striped?: boolean; // default true
    showHeader?: boolean; // default true
    rowClassName?: string | ((record: T, index: number) => string);
    onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
    loading?: boolean; // default false
    emptyText?: React.ReactNode; // default '暂无数据'
    scroll?: { x?: number | string; y?: number | string };
    pagination?: false | PaginationProps; // default false — object enables client-side paging
    className?: string;
    style?: React.CSSProperties;
}
```

```tsx
<Table
    columns={[
        { title: '名称', dataIndex: 'name', width: 160 },
        { title: '价格', dataIndex: 'price', align: 'right' },
        { title: '操作', render: (_, r) => <Button size="small">买</Button> },
    ]}
    dataSource={items}
    rowKey="id"
/>
```

> **Not supported:** no built-in `sorter`/`filters`/column-search, `rowSelection`, `expandable`/nested rows, `summary`, `bordered` toggle (always borderless), virtual scroll. `scroll.x/y` only enable native overflow scrolling. Client-side paging IS built in via `pagination={{ ... }}` (see Pagination below) — for server-side paging slice `dataSource` yourself.

## Pagination

```ts
interface PaginationProps {
    total: number; // REQUIRED
    current?: number; // controlled; defaultCurrent defaults to 1
    pageSize?: number; // controlled; defaultPageSize defaults to 10
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void; // size change only
    showSizeChanger?: boolean; // default false — page-size popover; pageSizeOptions default [10,20,50,100]
    showQuickJumper?: boolean; // default false — "跳至 <input> 页"
    showTotal?: boolean; // default false — "共 N 条"
    disabled?: boolean; // default false
    className?: string;
    style?: React.CSSProperties;
}
```

```tsx
<Pagination total={85} defaultCurrent={3} showTotal showSizeChanger pageSizeOptions={[10, 20, 50]} />
<Pagination total={500} current={page} pageSize={20} showQuickJumper onChange={(p) => setPage(p)} />
<Table columns={columns} dataSource={data} pagination={{ defaultPageSize: 5, showTotal: true }} />
```

Notes: DatePicker visual language — ghost 32px circles (transparent bg) hover to `#e6f9f6` + teal text; active page teal `#19c8b9` solid circle with white text; size trigger & jumper are cream `#fffbe7` capsules. Page run: first + last always visible, current ±1 neighbourhood, `···` when `pageCount > 7`. `current`/`pageSize` are controlled when passed, else internal. The size changer is a self-contained popover (click-outside/Escape closes). a11y: `<nav aria-label="分页">`, `aria-current="page"`, native disabled.

## CodeBlock

```ts
interface CodeBlockProps {
    code: string; // REQUIRED — raw source string
    style?: React.CSSProperties; // merged on top of the dark preset
    className?: string;
    copyable?: boolean; // default true
    onCopy?: (code: string) => void;
}
```

```tsx
<CodeBlock code={`import { Button } from 'animal-island-ui';\n\n<Button type="primary">Go</Button>`} />
<CodeBlock code={src} style={{ borderRadius: 5, backgroundColor: '#242c46' }} />
```

> Renders a `<pre>` with built-in JSX/TS tokenizer and a top-right copy button. No `language` prop, line numbers or word-wrap. Default theme: bg `#2b2118`, border `1px solid #3d3028`, radius 20px, font-size 14, line-height 1.7.

## Tag

```ts
type TagSize = 'small' | 'medium' | 'large';
type TagVariant = 'solid' | 'outlined' | 'dashed' | 'soft';
type TagColor = 'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink';
interface TagProps {
    children?: React.ReactNode;
    size?: TagSize; // default 'medium'
    variant?: TagVariant; // default 'soft'
    color?: TagColor; // default 'default'
    closable?: boolean; // default false
    onClose?: (e: React.MouseEvent<HTMLElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void; // enables clickable + keyboard a11y
    disabled?: boolean; // default false
    className?: string;
    style?: React.CSSProperties;
}
```

```tsx
<Tag>默认标签</Tag>
<Tag color="app-pink" variant="solid">已选</Tag>
<Tag color="app-teal" variant="outlined">草稿</Tag>
<Tag closable onClose={(e) => console.log('closed')}>可关闭</Tag>
<Tag color="app-blue" onClick={() => alert('clicked')}>可点击</Tag>
<Tag disabled>禁用</Tag>
```

Notes: color palette exactly matches `Card` — 12 brand colors + 1 default. `solid` saturated bg + white text; `outlined`/`dashed` same color text + border on transparent; `soft` pastel bg + deeper same-hue text, no border; `default` is the parchment-pill neutral (`rgb(247,243,223)` bg, `#8f734f` text). Sizes (class `size-{size}`): small 24 / medium 32 / large 40px, font 12/14/16, all `border-radius: 999px`, `font-weight: 600`, 1.5px transparent border. `closable` renders a × button (`aria-label="close"`, 16×16 circle bg, click is `stopPropagation`'d). `onClick` upgrades to `<span role="button" tabIndex={0}>` with Enter/Space support. `disabled` = `opacity: 0.5` + `pointer-events: none`.

## Image

```ts
type ImageColor = 'white' | 'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink';
interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height' | 'onLoad' | 'onError'> {
    src: string; // REQUIRED
    alt?: string; // default '' — empty means decorative
    width?: number | string;
    height?: number | string;
    color?: ImageColor; // default 'white'; others are the Card pattern base colours (pastel, no dots)
    variant?: 'default' | 'bordered' | 'stamp'; // default 'default'; 'stamp' = postage-stamp border
    stampYear?: string; // variant='stamp' only — issue year, top-right
    lazy?: boolean; // default false — native loading="lazy"
    preview?: boolean; // default true — click opens a lightbox
    onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}
```

```tsx
<Image src="/photo.png" alt="岛屿风景" width={200} height={150} />
<Image src="/photo.png" alt="粉色" color="app-pink" />
<Image src="/photo.png" alt="懒加载" lazy />
<Image src="/photo.png" alt="预览" width={200} height={130} preview />
<Image src="/photo.png" alt="邮票（带年份）" width={240} height={176} variant="stamp" stampYear="2026" />
```

> Renders a `<img>` in a fixed mat frame (12px padding, 8px radius, soft shadow, no border, `overflow: hidden`). The image stays `opacity: 0` until `onLoad` fades it in; on error a built-in placeholder renders (`role="img"` + `aria-label`). With `preview` the frame becomes a `<button>`; clicking opens a portaled lightbox (`role="dialog"` + `aria-modal`, name from `alt`) — close via ESC, mask, or close button; focus moves to the close button on open and is restored on close.

## Avatar

```ts
type AvatarShape = 'circle' | 'square';
type AvatarSize = 'small' | 'middle' | 'large';
interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onError'> {
    shape?: AvatarShape; // default 'circle'
    size?: number | AvatarSize; // default 'middle' — 32/40/48px; any px number allowed
    src?: string; // image URL; falls back to icon/text on load error
    alt?: string; // img alt (a11y)
    icon?: React.ReactNode; // placeholder icon; default UserIcon
    gap?: number; // default 4 — text/icon inset from the edge; oversized text auto-shrinks
    onError?: () => boolean; // load-fail callback; return false to keep the img
    children?: React.ReactNode; // text avatar, or a naive-icons component for an icon avatar
}
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    maxCount?: number; // collapse excess into a "+N" badge
    maxStyle?: React.CSSProperties; // styling for the "+N" badge
    size?: number | AvatarSize; // injected into children that don't set their own
    shape?: AvatarShape; // injected into children that don't set their own
    gap?: number; // default 8 — overlap between avatars
    children?: React.ReactNode;
}
```

```tsx
<Avatar>岛</Avatar>
<Avatar icon={<UserIcon />} />
<Avatar><FishIcon /></Avatar>{/* naive-icons component as children → icon avatar */}
<Avatar src="/u.png" alt="岛民" />
<Avatar size={64}>64</Avatar>
<Avatar src="/broken.png" onError={() => false}>兜底</Avatar>

<AvatarGroup maxCount={3} size="small" shape="square" gap={12}>
    <Avatar src="/a.png" alt="A" />
    <Avatar>勤</Avatar>
    <Avatar>劳</Avatar>
    <Avatar src="/d.png" alt="D" />
</AvatarGroup>
```

Notes: image avatars render an `<img>` (`object-fit: cover`); on `error` the component falls back to `icon` (default naive-icons `UserIcon`) or text `children` unless `onError` returns `false`. Passing a naive-icons component as `children` (element type is a function component) creates an icon avatar — same rendering path as `icon`; plain text/number children are text avatars. Text/icon avatars sit on a light-teal `--animal-primary-color-bg` background with teal content and a 2px cream border (`--animal-bg-color`) — a "sticker" look; circles use `border-radius: 999px`, squares 8px (matches the Image mat). `gap` drives automatic font shrinking via `useLayoutEffect` measurement (available width = `size - gap*2`) — text avatars only, icon avatars skip the shrink path. Numeric sizes derive font size as `size * 0.4`. The group stacks avatars with `margin-left: calc(-1 * var(--avatar-group-gap))`; a 2px cream gap ring separates them. `Avatar.Group` is also available as a static property. a11y: image avatars use `alt`; the bare default icon gets `role="img"` + `aria-label="avatar"`; text/icon content is readable as-is.

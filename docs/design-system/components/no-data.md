# NoData

Source: `src/components/NoData/`. Reusable empty-content presentation, using the library font, earth-brown text, cream surfaces and `naive-icons`. No requests, timers or runtime dependencies are added.

# Variants and anatomy

`default` uses a pair of cream and pale-mint journal sheets with a small tape strip and LeafIcon imprint. `search` shares the paper composition and adds a sage SearchIcon; its default title is “没有找到相关结果”. `simple` keeps one upright blank sheet without tape, leaf or shadow. The other variants default to “暂无数据”. Paper shapes are CSS decoration; pictorial icons remain from naive-icons. All artwork is hidden from assistive technology.

Content order is artwork, title, optional description and optional action area. Undefined title/icon uses the defaults; null/false hides it. Extra content takes precedence over children. The bordered option adds a 1.5px dashed sand outline, 20px radius and themed `var(--animal-bg-color, #faf8f1)` background; it defaults off so empty states can sit inside existing cards.

# Visual specification

| Part | Specification |
| --- | --- |
| Small | 18px × 12px padding; 108px-wide artwork; 14px title, 12px description; 14px artwork/action gaps, 5px description gap. |
| Medium | 32px × 24px padding; 164 × 126px artwork; 16px title, 13px description; 22px artwork/action gaps, 8px description gap. |
| Large | 40px × 24px padding; 200px-wide artwork at the same aspect ratio; 18px title, 14px description; 26px artwork gap. |
| Type | Library font; title 700, body inherits 500. Title inherits `--animal-text-color`; description uses `var(--animal-text-color-secondary, #7f6e57)`, line height 1.8 and maximum 32ch; balanced wrapping avoids an isolated final word. |
| Paper | Cream #fffdf5 foreground with 1.5px sand #d8cdb7 outline, 13px corners (9px small), 8-degree rotation; mint #deebe0 backing with #a8c4af outline at −13 degrees. Small warm tape and two short blank lines complete the paper. Soft 0 7px 14px brown shadow, no hard offset depth. |
| Search | Front sheet rotates 4 degrees; magnifier sits at the bottom-right in #9fbdab / #809b8b. Built-in icon strokes and fills are scoped to the artwork; caller-supplied icons are never recolored. |
| Simple/custom | Simple uses a single flat sheet at 55% of artwork width. Custom icons use an upright symbol inside a cream tile rotated −4 degrees; simple removes the tile border, background and shadow. Icon sizes remain 32/52/64px. |
| Actions | Centered flex layout, 12px gap, wraps on narrow containers; reuse existing Button styles and focus states. |
| Motion | Static presentation; no perpetual empty-state motion. |

The artwork palette can be themed with `--no-data-paper`, `--no-data-paper-line`, `--no-data-mint` and `--no-data-mint-line` on the root. Artwork stays within its container width. Native attributes, title/description/icon slots and action precedence remain unchanged.

# Semantics and composition

The root is a native div and accepts native attributes; it does not force a live region for static page content. Consumers may pass role="status" or aria-live when content changes need announcements. The decorative artwork has aria-hidden; title, description and actions remain readable and interactive. Use concise recovery instructions and a real callback in the action slot.

Chart uses the small variant for no data, missing map contours and all-hidden legends; the last state offers a restore-all action. Table retains its existing empty icon, so use icon={null} when placing NoData in its emptyText slot. Existing Table behavior is unchanged.

The independent demo under **反馈 → NoData 空状态** starts with an independent side-by-side journal/search preview, followed by the retained defaults, working search reset with a persistent polite live region announcing result counts or no matches, a table creation action, sizes, custom icons and text-only presentation. Props and examples: [NoData reference](https://github.com/guokaigdg/animal-island-ui/blob/main/skills/animal-island-ui-style/references/components/no-data.md).

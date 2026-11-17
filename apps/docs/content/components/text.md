---
title: Text
description: Typography in the theme's variants. A <span> in 2D; troika text in 3D that measures itself and takes its place in a layout.
---

<!-- demo: TextVariants 3d -->

In 3D, `align` also sets the anchor (default centre). Inside a container the text is measured and placed like any other child. Text with `;` is safe: it's set on troika directly, not through an attribute string.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `text` | `string` | `''` | The text. Required in 3D |
| `children` | `Snippet` | | 2D only: replaces `text` |
| `variant` | `TypographyVariant` | `'ParagraphMedium'` | `LabelXSmall`, `LabelSmall`, `LabelMedium`, `LabelLarge`, `HeadingSmall`, `HeadingMedium`, `ParagraphMedium` |
| `color` | `string` | `theme.colors.contentPrimary` | |
| `align` | `'left' \| 'center' \| 'right'` | | Text alignment; in 3D also the anchor (default centre) |
| `maxWidth` | `number` | | px; longer text wraps |
| `dimension` | `'2d' \| '3d'` | from context | |
| …rest | | | On the root element |

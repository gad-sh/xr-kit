---
title: Theming
description: Design tokens in px, createTheme overrides, ThemeProvider, and the 3D-only tokens that control size, depth and materials.
---

All colors, sizes, type and timings are tokens in one theme object (`defaultTheme`, dark by default). Both renderers read the same tokens, so an override changes the HTML and the 3D components alike.

## Override tokens

`createTheme(overrides)` deep-merges your overrides into the default theme (or into the theme you pass as the second argument). Put the result in a [`ThemeProvider`](/components/theme-provider) around the components it applies to, 2D and 3D:

<!-- demo: ThemeDemo 3d -->

`ThemeProvider` renders no DOM, so it can wrap the whole app, a `<Scene3D>`, or a single Surface. When its `theme` prop changes, the components inside update.

## What's in a theme

| Group | What it holds |
| --- | --- |
| `colors` | Content and background colors, and a group per component: `button.primary/secondary/tertiary`, `panel`, `checkbox`, `slider`, `tag`, `input`, `keyboard`, `tabs`, `menu`, `modal`, `radial`, `toast`, `progressBar`, `avatar`, `tooltip` |
| `typography` | `fontFamily` (2D), `font3d` (a font URL for troika; empty = the bundled Geist), and the variants `LabelXSmall` … `HeadingMedium`, `ParagraphMedium` (`fontSize`, `lineHeight`, `fontWeight`) |
| `sizing` | The spacing scale, `scale0` (2 px) … `scale1600` (64 px) |
| `borders` | Radii, including `buttonBorderRadius` |
| `animation` | Timings (`timing100` … `timing500`, ms) and easings (CSS curves for 2D, A-Frame easing names for 3D) |
| Per component | `button.sizes`, `panel`, `checkbox`, `slider`, `tag`, `tabs`, `menu`, `modal`, `input`, `keyboard`, `radial`, `toast`, `spinner`, `progressBar`, `avatar`, `tooltip`: sizes and paddings in px |
| `space3d` | 3D only, below |

The full theme, with every token's default, is `packages/ui/src/theme.ts` (`dist/theme.js` in the installed package).

## 3D tokens

| Token | Default | What it does |
| --- | --- | --- |
| `space3d.metersPerPx` | `0.003125` | px → meters: a default 48 px button is 0.15 m tall |
| `space3d.textScale` | `1.5` | Text is drawn this much larger in 3D, to read in a headset |
| `space3d.depth` | `0.05` | Slab thickness (m) |
| `space3d.hoverScale` | `1.04` | Scale while hovered |
| `space3d.pressDepth` | `0.02` | How far a pressed button sinks (m) |
| `space3d.material` | primary `glass`, secondary `solid`, tertiary `none` | Button slab material per kind |
| `space3d.panelOpacity` | `0.92` | Solid panel opacity |
| `space3d.glassText` | white | Label color on glass, which ignores the fill color |

`toMeters(theme, px)` converts with a theme's `metersPerPx`, if you place your own entities next to components.

## Fonts

The library bundles Geist (SIL Open Font License) and registers it with `@font-face` when you import `@xr-kit/ui`. 3D text uses the same font file unless `typography.font3d` points at another one.

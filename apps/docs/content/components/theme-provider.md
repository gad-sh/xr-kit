---
title: ThemeProvider
description: Puts a theme in context for everything inside it, 2D and 3D. Renders no DOM.
---

```svelte
<script lang="ts">
  import { ThemeProvider, createTheme } from '@xr-kit/ui';

  const theme = createTheme({ colors: { button: { secondary: { fill: '#2B3150' } } } });
</script>

<ThemeProvider {theme}>
  <!-- the app -->
</ThemeProvider>
```

Components outside any ThemeProvider use `defaultTheme`. When `theme` changes, the components inside update. Providers can nest; the nearest one wins. See [Theming](/guides/theming) for the tokens.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `theme` | `Theme` | `defaultTheme` | |
| `children` | `Snippet` | | |

# Sum Bar — Brand Assets

This folder contains all branding tokens and assets for the Sum Bar catering form.

## How to update branding

1. **Colors & Fonts**: Edit `brand-tokens.json`. All values flow into the app automatically via CSS custom properties and Tailwind config.
2. **Logos**: Replace files in `assets/` — keep the same filenames or update imports in `src/config/brand.ts`.
3. **Brand Guidelines**: Drop PDF/image reference files into `references/` for context.

## Brand Token Structure

```json
{
  "colors": { ... },    // All color values as hex
  "fonts": { ... },     // Font family strings (include fallbacks)
  "borderRadius": { ... } // Border radius values
}
```

## To apply a brand sheet

Upload your brand sheet PDF to `references/`, then ask Claude to:
> "Read the brand sheet in branding/references/ and update brand-tokens.json to match. Also update any logo SVGs in branding/assets/."

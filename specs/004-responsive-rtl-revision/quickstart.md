# Quickstart: Responsive & RTL Development

## Setup

1. Switch to branch `004-responsive-rtl-revision`.
2. Run `npm install` to ensure all dependencies (`framer-motion`, `recharts`) are latest.
3. Start dev server: `npm run dev`.

## Testing RTL

- Click the language toggle to switch to Arabic.
- Verify `document.documentElement.dir === 'rtl'`.
- All `margin-left` usage should be replaced with `ms-` (margin-start) or logical properties.

## Testing Mobile

- Open DevTools, select Responsive mode.
- Set width to `360px`.
- Verify the Sidebar collapses into a Hamburger menu and Transaction tables transform into cards.

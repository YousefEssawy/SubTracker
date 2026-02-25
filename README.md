# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## RTL and Mobile Design Guidelines

SubTracker uses a mobile-first, RTL-supported design architecture.

- **Logical Properties**: Always use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) instead of left/right to ensure the layout mirrors correctly in Arabic (RTL).
- **Responsive Stacking**: Core elements like Forms and Tables must stack vertically (`flex-col`) on mobile (`< 768px`) and transition to row-based layouts on larger screens (`sm:flex-row`).
- **Icons**: Mirror directional icons using `rtl:-scale-x-100` if they point left/right (e.g., arrows, logout).
- **Touch Targets**: Ensure buttons and interactive elements have a minimum target size of 44x44px.

# Component Contract: DataTable

## Props

| Name         | Type    | Description                                    |
| ------------ | ------- | ---------------------------------------------- |
| data         | Array   | List of objects to display.                    |
| columns      | Array   | Column definitions (title, key, formatter).    |
| isResponsive | boolean | If true, enables table-to-card transformation. |

## Mobile Behavior

When `isMobile` is true:

- Table header is hidden.
- Each row is rendered as a `div` with `shadow-card`.
- Cells occupy full width with labels on the left (or right in RTL) and values on the opposite.

The app's signature "how far through the billing cycle" indicator — a ring that fills as the next renewal approaches, replacing a plain category icon.

```jsx
<RenewalDial icon="🎬" iconColor="#EF4444" daysUntil={3} billingCycle="monthly" size={44} />
```

Ring color escalates by urgency: `--brand-primary-500` (>7 days), `--warning-500` (≤7 days), `--danger-500` (≤3 days or past-due, ring fills solid). Used in the dashboard hero, subscription rows, and the landing page's demo card. In production this animates in with framer-motion (see motion-spec.md §2 in the source repo); here it's a plain CSS transition.

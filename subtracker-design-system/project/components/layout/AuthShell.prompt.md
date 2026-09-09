Split shell for Login/Signup — a gradient brand panel (headline + proof stats or bullet list) beside the actual form, which is passed in as `children`.

```jsx
<AuthShell variant="login" title="Welcome back" subtitle="Log in to see where your money is going.">
  <form>{/* email/password fields, submit button */}</form>
</AuthShell>
```

`variant="login"` shows avg-spend/next-renewal proof stats at the bottom of the brand panel; `variant="signup"` shows a 3-item benefit checklist instead. On mobile the brand panel hides entirely and a small logo appears above the form.

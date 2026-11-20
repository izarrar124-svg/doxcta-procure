Name/email/company/intent/message contact form with a success state. Wire `onSubmit` to your own endpoint.
```jsx
<ContactForm onSubmit={(data) => fetch("/api/contact", { method: "POST", body: data })} />
```

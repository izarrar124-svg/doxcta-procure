import React, { useState } from "react";
import { Input } from "../ui/Input.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Label } from "../ui/Label.jsx";
import { Button } from "../ui/Button.jsx";

export function ContactForm({ onSubmit }) {
  const [status, setStatus] = useState("idle");

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    Promise.resolve(onSubmit ? onSubmit(new FormData(e.target)) : null).then(() => setStatus("success"));
  }

  if (status === "success") {
    return (
      <div style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--color-green-200)", background: "var(--color-green-50)", padding: 32 }} role="status">
        <p style={{ margin: 0, fontSize: "var(--text-h3-size)", fontWeight: 600, color: "var(--color-green-800)" }}>Message sent.</p>
        <p style={{ marginTop: 8, color: "var(--color-green-700)" }}>We'll get back to you within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <div><Label htmlFor="name">Name</Label><Input id="name" name="name" autoComplete="name" required /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
      </div>
      <div><Label htmlFor="company">Company (optional)</Label><Input id="company" name="company" autoComplete="organization" /></div>
      <div>
        <Label htmlFor="intent">How can we help?</Label>
        <select id="intent" name="intent" className="dx-input" style={{ height: 44 }}>
          <option value="discovery">Book a discovery call</option>
          <option value="general">General inquiry</option>
          <option value="support">Existing client support</option>
        </select>
      </div>
      <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" rows={5} required /></div>
      <Button type="submit" disabled={status === "loading"}>{status === "loading" ? "Sending..." : "Send message"}</Button>
    </form>
  );
}

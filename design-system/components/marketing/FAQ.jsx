import React from "react";
import { Eyebrow } from "../layout/Eyebrow.jsx";
import { Heading } from "../layout/Heading.jsx";
import { Accordion } from "../ui/Accordion.jsx";

export function FAQ({ items, title = "common questions", eyebrow = "FAQ" }) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading as="h2" size="h1" style={{ marginTop: 12 }}>{title}</Heading>
      <div style={{ marginTop: 32 }}>
        <Accordion items={items} />
      </div>
    </div>
  );
}

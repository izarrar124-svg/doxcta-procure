import React from "react";
import { Heading } from "../layout/Heading.jsx";
import { Text } from "../layout/Text.jsx";

export function Timeline({ steps }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {steps.map((step, i) => (
        <li key={step.title} className="dx-timeline-item">
          {i < steps.length - 1 && <span className="dx-timeline-line" />}
          <div className="dx-timeline-marker">{step.icon || i + 1}</div>
          <div style={{ minWidth: 0, flex: 1, paddingTop: 2 }}>
            <Heading as="h3" size="h3">{step.title.toLowerCase()}</Heading>
            <Text muted style={{ marginTop: 8 }}>{step.description}</Text>
          </div>
        </li>
      ))}
    </ol>
  );
}

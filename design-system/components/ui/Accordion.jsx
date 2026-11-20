import React, { useState } from "react";
export function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div className="dx-accordion-item" key={item.question}>
            <button type="button" className="dx-accordion-trigger" aria-expanded={open} onClick={() => setOpenIndex(open ? null : i)}>
              {item.question}
              <svg className={"dx-accordion-chevron" + (open ? " open" : "")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <div className="dx-accordion-content" style={{ maxHeight: open ? "400px" : "0px", transition: "max-height .25s ease" }}>
              <div className="dx-accordion-content-inner">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

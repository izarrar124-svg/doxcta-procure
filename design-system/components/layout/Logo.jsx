import React from "react";
/**
 * Logo assets are generated, background-specific PNGs (see readme "Assets"):
 *   doxcta-lockup-dark.png / doxcta-mark-dark.png   — bone + green artwork, for the dark canvas
 *   doxcta-lockup-light.png / doxcta-mark-light.png — ink + green artwork, for the bone "paper" surface
 * Do not use the raw repo exports directly — their file names do not match their actual colors.
 */
const sources = {
  dark: { md: "../../assets/logos/doxcta-lockup-dark.png", sm: "../../assets/logos/doxcta-mark-dark.png" },
  light: { md: "../../assets/logos/doxcta-lockup-light.png", sm: "../../assets/logos/doxcta-mark-light.png" },
};
export function Logo({ theme = "dark", size = "md", style, ...rest }) {
  return (
    <img
      src={sources[theme][size]}
      alt="Doxcta"
      style={{ height: 34, width: "auto", display: "inline-block", ...style }}
      {...rest}
    />
  );
}

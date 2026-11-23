// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: "https://clarksonuniversityrocketry.com",
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Montserrat",
      cssVariable: "--font-heading",
      weights: [600],
    },
    {
      provider: fontProviders.google(),
      name: "Roboto",
      cssVariable: "--font-body",
      weights: [400, 500, 700],
    },
    {
      provider: fontProviders.local(),
      name: "Nasalization",
      cssVariable: "--font-display",
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/nasalization-rg.woff2"],
          },
        ],
      },
    },
  ],
});
/**
 * Single source of truth for launch timing and page copy (spec §5).
 * Change LAUNCH_DATE here to move the countdown — nowhere else.
 */

/** 30 June 2026, 00:00 CAT (UTC+2). Edit this one constant to change the countdown. */
export const LAUNCH_DATE = "2026-06-30T00:00:00+02:00";

export const CONTACT = {
  email: "info@primecane.com",
  location: "Chiredzi, Masvingo Province, Zimbabwe",
  site: "https://primecane.com/",
} as const;

export const BRAND = {
  legalName: "Prime Cane (Pvt) Ltd",
  strapline: "Sustainable Agricultural Solutions",
  promise: ["Pure", "Natural", "Premium"] as const,
} as const;

export const HERO = {
  eyebrow: "Sustainable Agricultural Solutions",
  headline: "Zimbabwe's sugar, refined from the ground up.",
  subline:
    "Prime Cane (Pvt) Ltd is building a modern sugar mill in Chiredzi, processing cane into sugar, ethanol and more. Our website is on its way.",
  formIntro: "Be the first to know when we go live.",
  reassurance: "No spam, one email, at launch.",
} as const;

export const MILL = {
  eyebrow: "The Mill",
  statement: "A new chapter for Zimbabwean cane.",
  paragraph:
    "Prime Cane is establishing an integrated milling and processing operation in the heart of Zimbabwe's sugar belt. From raw cane to refined product, every stage is built for quality, sustainability and the communities the industry supports.",
  chips: ["Sugar belt, Chiredzi", "Integrated processing", "Sustainable by design"],
} as const;

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export const PRODUCTS: readonly Product[] = [
  {
    id: "sugar",
    name: "Sugar",
    description: "Pure, naturally processed cane sugar, the heart of the mill.",
  },
  {
    id: "ethanol",
    name: "Ethanol",
    description: "Cane-derived ethanol for fuel blending and industry.",
  },
  {
    id: "molasses",
    name: "Molasses",
    description: "A rich by-product for animal feed and fermentation.",
  },
  {
    id: "byproducts",
    name: "Cane By-Products",
    description: "Bagasse and more, nothing from the crop is wasted.",
  },
];

export const PRODUCTS_SECTION = {
  eyebrow: "What We Produce",
  heading: "Four products from one crop.",
  ticker: ["Sugar", "Ethanol", "Molasses", "Bagasse"],
} as const;

export const CHIREDZI = {
  eyebrow: "Our Home",
  heading: "Built in the Lowveld.",
  paragraph:
    "Chiredzi sits at the centre of Zimbabwe's sugar industry, the natural home for a mill built to grow with the region. We're proud to be putting down roots here.",
} as const;

export const FOOTER = {
  legal: `© ${new Date().getFullYear()} Prime Cane (Pvt) Ltd. All rights reserved.`,
} as const;

/** Email endpoint — Cloudflare Pages Function by default; overridable via env. */
// `||` (not `??`) so an empty-string env var falls back to the default endpoint.
export const SIGNUP_ENDPOINT = import.meta.env.VITE_SIGNUP_ENDPOINT || "/api/subscribe";

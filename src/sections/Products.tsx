import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { Marquee } from "@/components/Marquee";
import { container, inView } from "@/lib/motion";
import { PRODUCTS, PRODUCTS_SECTION, type Product } from "@/lib/constants";

/* Simple brand line-icons (green stroke), keyed by product id. */
const ICON_PATHS: Record<string, string[]> = {
  sugar: ["M11 17l5-5 5 5-5 5z", "M22 25l4-4 4 4-4 4z", "M9 27l3-3 3 3-3 3z"],
  ethanol: ["M20 7c6 10 8 14 8 18a8 8 0 1 1-16 0c0-4 2-8 8-18z"],
  molasses: ["M13 15h14", "M15 15v15a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V15", "M20 21v5"],
  byproducts: ["M20 31c-9-2-11-12-8-19 7 2 11 11 8 19z", "M20 31c8-3 11-12 9-18"],
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-7 shadow-sm transition-colors duration-300 hover:border-lime/60 sm:p-8"
    >
      {/* Lime accent bar draws across the bottom on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-lime transition-transform duration-500 ease-out group-hover:scale-x-100"
      />

      {/* Faint cane-texture corner */}
      <svg
        className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 text-green/5"
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        <path d="M14 40V8M20 40V4M26 40V10" stroke="currentColor" strokeWidth="2" />
      </svg>

      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green/8 text-green transition-transform duration-300 group-hover:scale-110">
        <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none" aria-hidden="true">
          {ICON_PATHS[product.id]?.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </span>

      <h3 className="mt-5 font-display text-2xl font-medium text-ink">{product.name}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{product.description}</p>
    </motion.article>
  );
}

export function Products() {
  return (
    <section className="bg-cream px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <Eyebrow className="text-green">{PRODUCTS_SECTION.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal className="mt-4">
            <h2 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] font-light leading-tight text-ink">
              {PRODUCTS_SECTION.heading}
            </h2>
          </Reveal>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>

      <Marquee
        items={PRODUCTS_SECTION.ticker}
        className="mt-16 border-y border-ink/10 py-4"
      />
    </section>
  );
}

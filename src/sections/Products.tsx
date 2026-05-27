import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { Marquee } from "@/components/Marquee";
import { container, inView } from "@/lib/motion";
import { PRODUCTS, PRODUCTS_SECTION, type Product } from "@/lib/constants";
import sugarPack from "@/assets/products/sugar-pack.webp";

/** Flagship product render — the real 2kg White Sugar pack, gently floating. */
function FlagshipPack() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative flex justify-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Soft lime pedestal glow */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/30 blur-3xl"
      />
      <motion.img
        src={sugarPack}
        alt="Prime Cane 2kg White Sugar packaging"
        width={529}
        height={661}
        className="relative h-auto w-[clamp(180px,42vw,300px)] [filter:drop-shadow(0_24px_40px_rgba(15,52,28,0.35))]"
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      />
    </motion.div>
  );
}

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

        {/* Flagship product — the real packaged sugar (spec §3, "Sugar — the heart of the mill") */}
        <div className="mt-14 grid items-center gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="eyebrow text-green/70">Our flagship</p>
            <h3 className="mt-3 font-display text-3xl font-light text-ink sm:text-4xl">
              2kg White Sugar
            </h3>
            <p className="mt-4 max-w-md leading-relaxed text-ink/65">
              Pure, naturally processed cane sugar — milled and packed right here in
              Chiredzi. The first product off the line, and the heart of the mill.
            </p>
            <p className="eyebrow mt-5 text-green">Pure · Natural · Trusted</p>
          </Reveal>
          <FlagshipPack />
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

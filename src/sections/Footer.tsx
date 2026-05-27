import { motion } from "motion/react";
import { Logo } from "@/components/Logo";
import { container, riseItem, inView } from "@/lib/motion";
import { BRAND, CONTACT, FOOTER } from "@/lib/constants";

const STRAPLINE = BRAND.promise.join(" · ").toUpperCase();

export function Footer() {
  return (
    <footer className="bg-green-night px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <Logo className="h-auto w-[110px] opacity-95" />

        {/* Contact — text links, descriptive anchors */}
        <address className="flex flex-col items-center gap-2 not-italic text-sm text-cream/70">
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-block rounded px-3 py-2 font-medium text-lime transition-colors hover:text-lime/80"
          >
            {CONTACT.email}
          </a>
          <span>{CONTACT.location}</span>
        </address>

        <a
          href="#top"
          className="inline-block rounded-full border border-cream/15 px-5 py-2 text-sm text-cream/85 transition-colors hover:border-lime hover:text-cream"
        >
          Be the first to know at launch ↑
        </a>

        {/* Strapline — letters stagger in */}
        <motion.p
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="eyebrow flex flex-wrap justify-center text-lime"
          style={{ letterSpacing: "0.32em" }}
        >
          <span className="sr-only">{STRAPLINE}</span>
          {[...STRAPLINE].map((char, i) => (
            <motion.span key={i} variants={riseItem} aria-hidden="true">
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </motion.p>

        <p className="text-xs text-cream/65">{FOOTER.legal}</p>
      </div>
    </footer>
  );
}

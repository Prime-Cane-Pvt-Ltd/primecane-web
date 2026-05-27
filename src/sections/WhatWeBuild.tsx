import { motion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { AccentLine } from "@/components/AccentLine";
import { container, riseItem, inView } from "@/lib/motion";
import { MILL } from "@/lib/constants";

export function WhatWeBuild() {
  return (
    <section className="bg-green px-6 py-24 sm:py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Reveal>
          <Eyebrow className="text-lime">{MILL.eyebrow}</Eyebrow>
        </Reveal>
        <AccentLine className="mt-4" />

        <Reveal className="mt-8">
          <h2 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] font-light leading-tight text-cream">
            {MILL.statement}
          </h2>
        </Reveal>

        <Reveal className="mt-6">
          <p className="max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg">
            {MILL.paragraph}
          </p>
        </Reveal>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {MILL.chips.map((chip) => (
            <motion.li
              key={chip}
              variants={riseItem}
              className="flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-4 py-2 text-sm text-cream/85"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              {chip}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

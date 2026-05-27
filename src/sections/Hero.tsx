import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Logo } from "@/components/Logo";
import { Eyebrow } from "@/components/Eyebrow";
import { Countdown } from "@/components/Countdown";
import { SignupForm } from "@/components/SignupForm";
import { container, riseItem } from "@/lib/motion";
import { HERO } from "@/lib/constants";

import field1440Webp from "@/assets/hero/field-1440.webp";
import field768Webp from "@/assets/hero/field-768.webp";
import field1440Jpg from "@/assets/hero/field-1440.jpg";
import field768Jpg from "@/assets/hero/field-768.jpg";
import { heroBlurDataURL } from "@/assets/hero/blur";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yShift = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const y = reduce ? 0 : yShift;
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const words = HERO.headline.split(" ");

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden"
    >
      {/* Background layers ----------------------------------------------- */}
      <motion.div style={{ y }} className="absolute inset-0 -z-20">
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
          style={{
            backgroundImage: `url("${heroBlurDataURL}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <picture>
            {/* Phones get the light 768px image regardless of DPR — the hero is a
                darkened, overlaid background, so the smaller file is imperceptible
                and meaningfully faster on low-end mobile (LCP). */}
            <source media="(max-width: 640px)" type="image/webp" srcSet={field768Webp} />
            <source media="(max-width: 640px)" srcSet={field768Jpg} />
            <source
              type="image/webp"
              srcSet={`${field768Webp} 768w, ${field1440Webp} 1440w`}
              sizes="100vw"
            />
            <img
              src={field1440Jpg}
              srcSet={`${field768Jpg} 768w, ${field1440Jpg} 1440w`}
              sizes="100vw"
              alt="Sugar-cane field at sunset in Zimbabwe's Lowveld"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </picture>
        </motion.div>
      </motion.div>

      {/* Lime sun-glow behind the horizon */}
      <div
        aria-hidden="true"
        className="animate-glow pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-lime/30 blur-[90px]"
      />

      {/* Green gradient overlay (bottom 90% → top 35%) for legibility */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 -z-10 bg-gradient-to-t from-green-deep/95 via-green-deep/60 to-green-deep/35"
      />

      {/* Content --------------------------------------------------------- */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        transition={{ delayChildren: 0.4 }}
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-7 px-6 py-24 text-center lg:items-start lg:py-28 lg:text-left"
      >
        <motion.div variants={riseItem}>
          <Logo
            priority
            className="h-auto w-[118px] [filter:drop-shadow(0_2px_10px_rgba(10,36,20,0.45))] sm:w-[132px]"
          />
        </motion.div>

        <motion.div variants={riseItem}>
          <Eyebrow className="text-lime">{HERO.eyebrow}</Eyebrow>
        </motion.div>

        <h1
          aria-label={HERO.headline}
          className="max-w-3xl font-display text-[clamp(2.4rem,6vw,4.5rem)] font-light leading-[1.05] text-cream"
        >
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={riseItem}
              aria-hidden="true"
              className="mr-[0.28em] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={riseItem}
          className="max-w-xl text-base text-cream/80 sm:text-lg"
        >
          {HERO.subline}
        </motion.p>

        <motion.div variants={riseItem} className="mt-2">
          <Countdown />
        </motion.div>

        <motion.div
          variants={riseItem}
          className="mt-2 flex w-full flex-col items-center gap-2 lg:items-start"
        >
          <p className="text-sm font-medium text-cream">{HERO.formIntro}</p>
          <SignupForm />
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-9 w-5 rounded-full border border-cream/30"
        >
          <span className="mx-auto mt-2 block h-1.5 w-1 rounded-full bg-lime" />
        </motion.div>
      </motion.div>
    </section>
  );
}

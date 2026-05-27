import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { Hero } from "@/sections/Hero";
import { Preloader } from "@/components/Preloader";

// Below-the-fold sections are code-split so they don't block first paint.
const WhatWeBuild = lazy(() =>
  import("@/sections/WhatWeBuild").then((m) => ({ default: m.WhatWeBuild })),
);
const Products = lazy(() =>
  import("@/sections/Products").then((m) => ({ default: m.Products })),
);
const Chiredzi = lazy(() =>
  import("@/sections/Chiredzi").then((m) => ({ default: m.Chiredzi })),
);
const Footer = lazy(() =>
  import("@/sections/Footer").then((m) => ({ default: m.Footer })),
);

export default function App() {
  const [loading, setLoading] = useState(true);

  // Lock scroll while the preloader is on screen.
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Mounted only once fonts are ready (preloader gates this), so the first
          paint of all text is in the brand fonts — eliminating font-swap CLS. */}
      {!loading && (
        <main id="top">
          <Hero />
          <Suspense fallback={null}>
            <WhatWeBuild />
            <Products />
            <Chiredzi />
            <Footer />
          </Suspense>
        </main>
      )}
    </MotionConfig>
  );
}

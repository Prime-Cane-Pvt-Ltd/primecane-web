import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { AccentLine } from "@/components/AccentLine";
import { ZimbabweMap } from "@/components/ZimbabweMap";
import { CHIREDZI } from "@/lib/constants";

export function Chiredzi() {
  return (
    <section className="bg-green-deep px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col">
          <Reveal>
            <Eyebrow className="text-lime">{CHIREDZI.eyebrow}</Eyebrow>
          </Reveal>
          <AccentLine className="mt-4" />
          <Reveal className="mt-8">
            <h2 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] font-light leading-tight text-cream">
              {CHIREDZI.heading}
            </h2>
          </Reveal>
          <Reveal className="mt-6">
            <p className="max-w-md text-base leading-relaxed text-cream/75 sm:text-lg">
              {CHIREDZI.paragraph}
            </p>
          </Reveal>
        </div>

        <div className="flex justify-center">
          <ZimbabweMap className="w-full max-w-sm" />
        </div>
      </div>
    </section>
  );
}

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HERO, SIGNUP_ENDPOINT } from "@/lib/constants";

type Status =
  | "idle"
  | "submitting"
  | "success"
  | "duplicate"
  | "error-invalid"
  | "error-network";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_COPY: Record<"error-invalid" | "error-network", string> = {
  "error-invalid": "Please enter a valid email address.",
  "error-network": "Something went wrong. Please try again in a moment.",
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SignupForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const msgId = useId();

  const submitting = status === "submitting";
  const isError = status === "error-invalid" || status === "error-network";
  const done = status === "success" || status === "duplicate";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot: a real user never fills this. Silently drop bots.
    if (honeypotRef.current?.value) {
      setStatus("success");
      return;
    }

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error-invalid");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, hp: honeypotRef.current?.value ?? "" }),
      });
      let body: { status?: string } = {};
      try {
        body = await res.json();
      } catch {
        /* tolerate empty / non-JSON bodies */
      }

      if (res.ok && body.status === "duplicate") setStatus("duplicate");
      else if (res.ok) setStatus("success");
      else if (res.status === 400 || body.status === "invalid") setStatus("error-invalid");
      else setStatus("error-network");
    } catch {
      setStatus("error-network");
    }
  }

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-lime/30 bg-lime/10 p-4"
            role="status"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-green-night">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="text-sm text-cream">
              {status === "duplicate"
                ? "You're already on the list — we'll be in touch at launch."
                : "You're on the list. We'll email you once, at launch."}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            initial={false}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>

            {/* Honeypot — visually hidden, off the tab order, ignored by humans */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
              <label htmlFor={`${inputId}-company`}>Company (leave blank)</label>
              <input
                ref={honeypotRef}
                id={`${inputId}-company`}
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id={inputId}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                aria-invalid={isError}
                aria-describedby={msgId}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isError) setStatus("idle");
                }}
                className={`min-w-0 flex-1 rounded-xl border bg-white/5 px-4 py-3 text-cream placeholder:text-mist backdrop-blur-sm transition-colors focus:border-lime focus:outline-none ${
                  isError ? "border-[#E2735F]" : "border-cream/20"
                }`}
              />
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-6 py-3 font-semibold text-green-night shadow-lg shadow-lime/10 transition-[box-shadow,background-color] hover:shadow-xl hover:shadow-lime/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Spinner />
                    Sending…
                  </>
                ) : (
                  "Notify me"
                )}
              </motion.button>
            </div>

            {/* Live region for validation / network errors */}
            <p
              id={msgId}
              role={isError ? "alert" : undefined}
              className="min-h-[1.25rem] text-sm"
            >
              {isError ? (
                <span className="text-[#F2B8B5]">{ERROR_COPY[status]}</span>
              ) : (
                <span className="text-cream/60">{HERO.reassurance}</span>
              )}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

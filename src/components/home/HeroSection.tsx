"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.23, 1, 0.32, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, transform: "translateY(16px)" },
  animate: { opacity: 1, transform: "translateY(0px)" },
  transition: { duration: 0.5, ease, delay },
});

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pb-10">
      {/* Heading */}
      <motion.h1
        className="mb-6 font-heading text-[2.5rem] font-extrabold leading-[1.02] tracking-tight text-foreground md:text-7xl"
        {...fadeUp(0.12)}
      >
        The curated{" "}
        
        {/* Shelf */}
        <motion.span
          className="relative inline-block cursor-default rounded-xl bg-foreground px-3 py-0.5 text-background"
          initial={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: -2,
                  y: 0,
                }
          }
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: 0,
                  y: -2,
                  scale: 1.015,
                }
          }
          whileTap={
            shouldReduceMotion
              ? undefined
              : {
                  scale: 0.985,
                  y: 0,
                }
          }
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.8,
          }}
        >
          shelf

          {/* Subtle physical shadow */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2 -bottom-1 -z-10 h-2 rounded-full bg-foreground/15 blur-md"
            initial={{ opacity: 0, scaleX: 0.8 }}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 1,
                    scaleX: 1,
                  }
            }
            transition={{
              duration: 0.2,
              ease,
            }}
          />
        </motion.span>

        {" "}
        <br className="hidden lg:block" />
        developers
      </motion.h1>

      {/* Subheading */}
      <motion.p
        className="max-w-xl text-lg text-muted-foreground md:text-xl"
        {...fadeUp(0.2)}
      >
        <span className="font-medium text-foreground">
          Stop searching everywhere. Start building.
        </span>{" "}
        UI, APIs, tools, and more.
      </motion.p>
    </div>
  );
}


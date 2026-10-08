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
      {/* Badge */}
      {/* <motion.a
        href="https://github.com/drealdumore/thesupadevs"
        target="_blank"
        rel="noopener noreferrer"
        className="group mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-foreground/40 hover:bg-muted/50"
        {...fadeUp(0.05)}
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.03,
              }
        }
        whileTap={
          shouldReduceMotion
            ? undefined
            : {
                scale: 0.97,
              }
        }
      >
        <svg
          className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
            clipRule="evenodd"
          />
        </svg>

        <span className="transition-colors duration-200 group-hover:text-foreground">
          Open source
        </span>
      </motion.a> */}

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
        UI, APIs, tools, and more, curated for developers.
      </motion.p>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { VisaSelector } from "@/components/landing-page/VisaSelector";
import { ChevronDown } from "@/components/svgs/chevron-down";
import { cn } from "@/lib/utils";

const STICK_TOP_OFFSET = 80; // matches nav height (top-20)

export function StickyVisaBar() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const heroBar = document.getElementById("hero-visa-selector");
    if (!heroBar) return;

    const check = () => {
      const rect = heroBar.getBoundingClientRect();
      // Show fixed bar when hero bar has cleared the nav; hero bar is hidden via CSS when this is true
      setVisible(rect.bottom < STICK_TOP_OFFSET);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // Hide the hero bar when fixed bar is visible so only one is ever shown
  useEffect(() => {
    const className = "sticky-visa-bar-active";
    if (visible) document.body.classList.add(className);
    else document.body.classList.remove(className);
    return () => document.body.classList.remove(className);
  }, [visible]);

  return (
    <div
      className="fixed left-0 right-0 z-40 flex flex-col w-full bg-white transition-opacity duration-200 shadow-[0_24px_48px_0_rgba(0,0,0,0.04)]"
      style={{
        top: STICK_TOP_OFFSET,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden={!visible}
    >
      {/* Mobile: foldable header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="md:hidden flex w-full items-center justify-between px-6 py-3 text-left text-base font-semibold text-primary-copy"
        aria-expanded={expanded}
        aria-controls="sticky-visa-bar-content"
        id="sticky-visa-bar-toggle"
      >
        <span>Choose your visa</span>
        <span
          className={cn(
            "flex shrink-0 transition-transform duration-200",
            expanded && "rotate-180"
          )}
          aria-hidden
        >
          <ChevronDown />
        </span>
      </button>
      {/* Content: collapsible on mobile, always visible on md+ */}
      <div
        id="sticky-visa-bar-content"
        role="region"
        aria-labelledby="sticky-visa-bar-toggle"
        className={cn(
          "w-full overflow-hidden transition-[max-height] duration-200 ease-in-out",
          "md:max-h-none",
          expanded ? "max-md:max-h-[600px]" : "max-md:max-h-0"
        )}
      >
        <div className="w-full max-w-7xl mx-auto px-1">
          <VisaSelector rounded={false} shadow={false} />
        </div>
      </div>
    </div>
  );
}

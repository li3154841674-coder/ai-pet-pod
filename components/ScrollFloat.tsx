"use client";

import { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: React.ReactNode;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  containerClassName?: string;
  textClassName?: string;
}

export default function ScrollFloat({
  children,
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "center bottom+=50",
  scrollEnd = "bottom bottom-=40",
  stagger = 0.025,
  containerClassName = "block",
  textClassName = "text-zinc-200 drop-shadow-md tracking-wide",
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const splitText = useMemo(() => {
    if (typeof children !== "string") {
      return [];
    }

    return children.split("").map((char, index) => {
      return (
        <span key={index} className={`inline-block ${textClassName}`}>
          {char === " " ? "\u00A0" : char}
        </span>
      );
    });
  }, [children, textClassName]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll("span");

    gsap.fromTo(
      chars,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: animationDuration,
        ease,
        stagger,
        scrollTrigger: {
          trigger: containerRef.current,
          start: scrollStart,
          end: scrollEnd,
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <div ref={containerRef} className={containerClassName}>
      {splitText}
    </div>
  );
}
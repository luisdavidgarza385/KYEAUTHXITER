"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export function TypewriterBrand() {
  const [titleText, setTitleText] = useState("");
  const [subText, setSubText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  const titleWord = "SecureX Auth";
  const subWord = "developer ~ xDavid";

  useEffect(() => {
    let mode: "typingTitle" | "typingSubtitle" | "pausingAll" | "erasingSubtitle" | "erasingTitle" = "typingTitle";
    let titleIndex = 0;
    let subIndex = 0;

    const timer = setInterval(() => {
      if (mode === "typingTitle") {
        if (titleIndex < titleWord.length) {
          setTitleText(titleWord.slice(0, titleIndex + 1));
          titleIndex++;
        } else {
          mode = "typingSubtitle";
        }
      } else if (mode === "typingSubtitle") {
        if (subIndex < subWord.length) {
          setSubText(subWord.slice(0, subIndex + 1));
          subIndex++;
        } else {
          mode = "pausingAll";
          setTimeout(() => {
            if (mode === "pausingAll") {
              mode = "erasingSubtitle";
            }
          }, 3000);
        }
      } else if (mode === "erasingSubtitle") {
        if (subIndex > 0) {
          subIndex--;
          setSubText(subWord.slice(0, subIndex));
        } else {
          mode = "erasingTitle";
        }
      } else if (mode === "erasingTitle") {
        if (titleIndex > 0) {
          titleIndex--;
          setTitleText(titleWord.slice(0, titleIndex));
        } else {
          mode = "typingTitle";
        }
      }
    }, 110);

    const cursorInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(cursorInterval);
    };
  }, []);

  const showSubCursor = subText.length > 0 || (titleText === titleWord && subText.length < subWord.length);

  return (
    <div className="flex items-center gap-3 select-none py-1 h-[48px]">
      <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-sky-500/40 shadow-lg shadow-sky-500/20 relative shrink-0">
        <Image src="/logo.png" alt="Sukuna SecureX Auth Logo" width={36} height={36} className="w-full h-full object-cover" priority />
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center">
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,191,255,0.4)]">
            {titleText || "\u00A0"}
          </span>
          {!showSubCursor && titleText.length < titleWord.length && (
            <span className={`w-[2.5px] h-4 ml-1 bg-sky-400 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`} />
          )}
        </div>
        <div className="flex items-center h-[14px]">
          <span className="font-mono text-[10px] text-sky-400/80 tracking-wider">
            {subText || "\u00A0"}
          </span>
          {showSubCursor && (
            <span className={`w-[2px] h-3 ml-0.5 bg-sky-400 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`} />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

export function TypewriterBrand() {
  const [titleText, setTitleText] = useState("");
  const [subText, setSubText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  const titleWord = "DARK HACKS";
  const subWord = "developer. X David";

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
    <div className="flex flex-col items-center justify-center text-center select-none py-1 h-[48px]">
      <div className="flex items-center">
        <span className="font-extrabold text-xl tracking-widest bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
          {titleText || "\u00A0"}
        </span>
        {!showSubCursor && titleText.length < titleWord.length && (
          <span className={`w-[3px] h-5 ml-1 bg-purple-500 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`} />
        )}
      </div>
      <div className="flex items-center mt-1.5 h-[14px]">
        <span className="font-mono text-[10px] text-zinc-500 tracking-wider">
          {subText || "\u00A0"}
        </span>
        {showSubCursor && (
          <span className={`w-[2px] h-3 ml-0.5 bg-zinc-500 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`} />
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

export function TypewriterBrand() {
  const [titleText, setTitleText] = useState("");
  const [subText, setSubText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  const titleWord = "DARK HACKS";
  const subWord = "developer. X David";

  useEffect(() => {
    let titleIndex = 0;
    let subIndex = 0;
    let isTitleDone = false;

    const interval = setInterval(() => {
      if (!isTitleDone) {
        if (titleIndex < titleWord.length) {
          setTitleText(titleWord.slice(0, titleIndex + 1));
          titleIndex++;
        } else {
          isTitleDone = true;
        }
      } else {
        if (subIndex < subWord.length) {
          setSubText(subWord.slice(0, subIndex + 1));
          subIndex++;
        } else {
          clearInterval(interval);
        }
      }
    }, 120);

    const cursorInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center select-none py-1">
      <div className="flex items-center">
        <span className="font-extrabold text-xl tracking-widest bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
          {titleText}
        </span>
        {!subText && (
          <span className={`w-[3px] h-5 ml-1 bg-purple-500 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`} />
        )}
      </div>
      {titleText === titleWord && (
        <div className="flex items-center mt-1">
          <span className="font-mono text-[10px] text-zinc-500 tracking-wider">
            {subText}
          </span>
          {subText && (
            <span className={`w-[2px] h-3 ml-0.5 bg-zinc-500 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`} />
          )}
        </div>
      )}
    </div>
  );
}

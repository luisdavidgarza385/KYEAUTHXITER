"use client";

import { useEffect } from "react";

export function SecurityShield() {
  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right click only if user is holding Shift (for developer debugging if needed) or block completely
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+Shift+C)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl + Shift + I (DevTools)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Cmd + Option + I (Mac DevTools)
      if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Clear Console & Add Warning Banner
    const clearConsole = () => {
      try {
        console.clear();
        console.log(
          "%c🛑 SECUREX AUTH — ACCESO RESTRENGIDO",
          "color: #00bfff; font-size: 24px; font-weight: bold; background: #010408; padding: 10px; border-radius: 8px;"
        );
        console.log(
          "%c⚠️ ADVERTENCIA: Esta es una función de navegador pensada para desarrolladores. Si alguien te dijo que copies y pegues algo aquí, es una estafa.",
          "color: #ff4d4d; font-size: 14px; font-weight: bold;"
        );
      } catch {}
    };

    // 4. Periodically clear console & prevent inspection tampering
    const consoleInterval = setInterval(clearConsole, 3000);

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(consoleInterval);
    };
  }, []);

  return null;
}

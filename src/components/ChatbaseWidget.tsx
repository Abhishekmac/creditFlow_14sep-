import { useEffect } from "react";

const CHATBASE_ID = "ALyMPFnU2LsaCg8ShZO0y"; // ← your Chatbase script id

declare global {
  interface Window { chatbase?: any }
}

export default function ChatbaseWidget() {
  useEffect(() => {
    // Don't inject twice
    if (document.getElementById(CHATBASE_ID)) return;

    // Minimal shim (from Chatbase snippet)
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      const q: any[] = [];
      const fn = (...args: any[]) => q.push(args);
      (fn as any).q = q;
      window.chatbase = new Proxy(fn as any, {
        get(target, prop) {
          if (prop === "q") return q;
          return (...args: any[]) => (target as any)(prop, ...args);
        },
      });
    }

    const load = () => {
      const s = document.createElement("script");
      s.src = "https://www.chatbase.co/embed.min.js";
      s.id = CHATBASE_ID;                 // IMPORTANT: keep this id
      (s as any).domain = "www.chatbase.co";
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
      s.addEventListener("load", () => console.log("[Chatbase] loaded"));
    };

    if (document.readyState === "complete") load();
    else window.addEventListener("load", load);

    return () => window.removeEventListener("load", load);
  }, []);

  return null;
}

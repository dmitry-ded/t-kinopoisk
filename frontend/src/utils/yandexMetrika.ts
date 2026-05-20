const METRIKA_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID);

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

let initialized = false;

export function initYandexMetrika(): void {
  if (!METRIKA_ID || initialized) return;
  initialized = true;

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function (...args: unknown[]) {
        (m[i].a = m[i].a || []).push(args);
      };
    m[i].l = 1 * new Date().getTime();
    for (let j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t) as HTMLScriptElement;
    a = e.getElementsByTagName(t)[0];
    k.async = true;
    k.src = r;
    a.parentNode?.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  window.ym?.(METRIKA_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  });
}

export function trackPageView(url: string): void {
  if (!METRIKA_ID) return;
  window.ym?.(METRIKA_ID, 'hit', url);
}

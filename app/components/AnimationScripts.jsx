"use client";

import Script from "next/script";
import { useState } from "react";

export default function AnimationScripts() {
  const [webfontReady, setWebfontReady] = useState(false);
  const [jqueryReady, setJqueryReady] = useState(false);
  const [webflowReady, setWebflowReady] = useState(false);
  const [lenisReady, setLenisReady] = useState(false);
  const [gsapReady, setGsapReady] = useState(false);
  const [scrollTriggerReady, setScrollTriggerReady] = useState(false);
  const [flipReady, setFlipReady] = useState(false);
  const [flowplayReady, setFlowplayReady] = useState(false);
  const [splitTypeReady, setSplitTypeReady] = useState(false);

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
        strategy="afterInteractive"
        onLoad={() => setWebfontReady(true)}
      />
      {webfontReady && (
        <Script id="webfont-loader" strategy="afterInteractive">
          {`WebFont.load({ google: { families: ["Inter:300,400,500,600,700", "Roboto:300,400,500,600,700"] } });`}
        </Script>
      )}
      <Script id="webflow-html-class" strategy="afterInteractive">
        {`!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`}
      </Script>
      <Script
        src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=69d4c3e8c1b59a7426c52fe8"
        strategy="afterInteractive"
        onLoad={() => setJqueryReady(true)}
      />
      {jqueryReady && (
        <Script
          src="/webflow/excellence-awards.js"
          strategy="afterInteractive"
          onLoad={() => setWebflowReady(true)}
        />
      )}
      {webflowReady && (
        <Script
          src="https://unpkg.com/@studio-freight/lenis@1.0.33/dist/lenis.min.js"
          strategy="afterInteractive"
          onLoad={() => setLenisReady(true)}
        />
      )}
      {lenisReady && (
        <Script
          src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"
          strategy="afterInteractive"
          onLoad={() => setGsapReady(true)}
        />
      )}
      {gsapReady && (
        <Script
          src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"
          strategy="afterInteractive"
          onLoad={() => setScrollTriggerReady(true)}
        />
      )}
      {scrollTriggerReady && (
        <Script
          src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Flip.min.js"
          strategy="afterInteractive"
          onLoad={() => setFlipReady(true)}
        />
      )}
      {flipReady && (
        <Script
          src="https://cdn.jsdelivr.net/gh/videsigns/webflow-tools@latest/Media%20Player/flowplayplus.js"
          strategy="afterInteractive"
          onLoad={() => setFlowplayReady(true)}
        />
      )}
      {flowplayReady && (
        <Script
          src="https://unpkg.com/split-type"
          strategy="afterInteractive"
          onLoad={() => setSplitTypeReady(true)}
        />
      )}
      {splitTypeReady && <Script src="/script.js" strategy="afterInteractive" />}
    </>
  );
}

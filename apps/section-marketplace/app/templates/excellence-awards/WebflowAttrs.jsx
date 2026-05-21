"use client";

import { useEffect } from "react";

// Sets the data-wf-page / data-wf-site / lang attributes on <html>
// only while the Excellence Awards template is mounted, so the
// Webflow-exported scripts can identify the page without polluting
// the marketplace root layout.
export default function WebflowAttrs() {
  useEffect(() => {
    const html = document.documentElement;
    const prev = {
      wfPage: html.getAttribute("data-wf-page"),
      wfSite: html.getAttribute("data-wf-site"),
      lang: html.getAttribute("lang"),
    };
    html.setAttribute("data-wf-page", "69eb624095ebc215712a36c0");
    html.setAttribute("data-wf-site", "69d4c3e8c1b59a7426c52fe8");
    html.setAttribute("lang", "en-GB");
    return () => {
      if (prev.wfPage === null) html.removeAttribute("data-wf-page");
      else html.setAttribute("data-wf-page", prev.wfPage);
      if (prev.wfSite === null) html.removeAttribute("data-wf-site");
      else html.setAttribute("data-wf-site", prev.wfSite);
      if (prev.lang === null) html.removeAttribute("lang");
      else html.setAttribute("lang", prev.lang);
    };
  }, []);
  return null;
}

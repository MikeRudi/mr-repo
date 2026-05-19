"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const languages = [
  { locale: "en-GB", key: "english", label: "English" },
  { locale: "fr-FR", key: "french", label: "Français" },
  { locale: "de-DE", key: "german", label: "Deutsch" },
  { locale: "it-IT", key: "italian", label: "Italiano" },
  { locale: "ja-JP", key: "japanese", label: "日本語" },
  { locale: "ko-KR", key: "korean", label: "한국어" },
  { locale: "pl-PL", key: "polish", label: "Polski" },
  { locale: "pt-BR", key: "portuguese", label: "Português" },
  { locale: "ru-RU", key: "russian", label: "Русский" },
  { locale: "es-LA", key: "spanish", label: "Español" },
  { locale: "tr-TR", key: "turkish", label: "Türkçe" },
  { locale: "zh-CN", key: "chineseSimplified", label: "简体中文" },
  { locale: "zh-Hant-TW", key: "chineseTraditional", label: "繁體中文" },
  { locale: "nl-NL", key: "dutch", label: "Nederlands" },
];

const defaultLanguage = languages[0];

function getLocaleFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const match = languages.find((language) => language.locale === parts[0] || language.locale === parts[1]);
  return match?.locale || defaultLanguage.locale;
}

function getLanguage(locale) {
  return languages.find((language) => language.locale === locale) || defaultLanguage;
}

function applyLanguage(language) {
  document.documentElement.lang = language.locale;
  window.localStorage.setItem("selectedLang", language.key);
  window.localStorage.setItem("selectedLangPath", `/${language.locale}`);

  document.querySelectorAll(".lang-text-wrap").forEach((wrap) => {
    if (!wrap.dataset.i18nReady) {
      const values = {};
      const classes = {};
      wrap.querySelectorAll("[lang-text]").forEach((node) => {
        const key = node.getAttribute("lang-text");
        values[key] = node.innerHTML.trim();
        classes[key] = node.className || "";
      });
      wrap.dataset.i18nValues = JSON.stringify(values);
      wrap.dataset.i18nClasses = JSON.stringify(classes);
      wrap.dataset.i18nReady = "true";
    }

    const values = JSON.parse(wrap.dataset.i18nValues || "{}");
    const classes = JSON.parse(wrap.dataset.i18nClasses || "{}");
    const html = values[language.key] || values.english || "";
    const className = (classes[language.key] || classes.english || "")
      .replace(/display-none/g, "")
      .replace(/active-lang/g, "")
      .trim();

    wrap.innerHTML = "";
    const span = document.createElement("span");
    span.className = `${className} active-lang`.trim();
    span.innerHTML = html;
    wrap.appendChild(span);
  });
}

export default function LanguageController() {
  const router = useRouter();
  const pathname = usePathname();
  const initialLocale = useMemo(() => getLocaleFromPath(pathname), [pathname]);
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    const language = getLanguage(locale);
    applyLanguage(language);
  }, [locale]);

  function handleChange(event) {
    const nextLocale = event.target.value;
    setLocale(nextLocale);
    router.replace(`/${nextLocale}`, { scroll: false });
  }

  return (
    <label className="language-controller" aria-label="Select language">
      <span>Language</span>
      <select value={locale} onChange={handleChange}>
        {languages.map((language) => (
          <option key={language.locale} value={language.locale}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}

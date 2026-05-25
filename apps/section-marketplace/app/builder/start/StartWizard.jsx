"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEFAULT_TOKENS } from "../../../lib/styleguide-defaults.js";
import StyleGuideEditor from "../../styleguide/_components/StyleGuideEditor.jsx";

// Onboarding wizard. Two steps before the user enters the builder:
//   1. Site name
//   2. Blank style guide
// On finish, the wizard stashes { siteName, styleGuide } in sessionStorage
// under WIZARD_KEY, then routes to /builder/new which hydrates from it.
//
// Nothing is persisted to the database here. Per the user's instruction,
// real persistence only happens on explicit Save from inside the builder.

export const WIZARD_KEY = "mr.builder.wizardState.v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function StartWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [siteName, setSiteName] = useState("");
  const [guideName, setGuideName] = useState("Default");
  const [tokens, setTokens] = useState(DEFAULT_TOKENS);

  const canAdvanceStep1 = siteName.trim().length > 0;
  const canFinish = guideName.trim().length > 0;

  const finish = () => {
    if (!canFinish || !canAdvanceStep1) return;
    const styleGuide = {
      id: uid(),
      name: guideName.trim(),
      tokens,
      isActive: true,
    };
    const payload = {
      siteName: siteName.trim(),
      styleGuides: [styleGuide],
      activeStyleGuideId: styleGuide.id,
    };
    try {
      sessionStorage.setItem(WIZARD_KEY, JSON.stringify(payload));
    } catch {
      // sessionStorage unavailable — fall through; builder will use defaults
    }
    router.push("/builder/new");
  };

  return (
    <div className="min-h-dvh bg-[var(--chrome-ground)] text-[var(--chrome-fg)] flex flex-col">
      <header className="flex min-h-20 items-center border-b border-[var(--chrome-border)] bg-[var(--chrome-surface)]/85 px-6 backdrop-blur">
        <Link
          href="/"
          className="text-[20px] font-semibold text-[var(--chrome-fg)]"
        >
          MR
        </Link>
        <span className="mx-3 text-[var(--chrome-border)]">/</span>
        <span
          className="text-[16px] text-[var(--chrome-fg-muted)]"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        >
          Start a new site
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <StepDot label="1. Site" active={step === 1} done={step > 1} />
          <span className="w-6 h-px bg-[var(--chrome-border)]" />
          <StepDot label="2. Style guide" active={step === 2} done={false} />
        </div>
        <div className="flex-1" />
        <Link href="/" className="btn-chrome btn-chrome--ghost btn-chrome--sm">
          Cancel
        </Link>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        {step === 1 ? (
          <Step1
            siteName={siteName}
            onChange={setSiteName}
            canAdvance={canAdvanceStep1}
            onNext={() => setStep(2)}
          />
        ) : (
          <Step2
            guideName={guideName}
            onGuideNameChange={setGuideName}
            tokens={tokens}
            onTokensChange={setTokens}
            onBack={() => setStep(1)}
            onFinish={finish}
            canFinish={canFinish && canAdvanceStep1}
          />
        )}
      </main>
    </div>
  );
}

function StepDot({ label, active, done }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[16px] font-normal ${
        active
          ? "text-[var(--chrome-fg)]"
          : done
            ? "text-[var(--chrome-fg-muted)]"
            : "text-[var(--chrome-fg-subtle)]"
      }`}
    >
      <span
        aria-hidden
        className={`inline-block size-2 rounded-full ${
          active || done ? "bg-[var(--chrome-fg)]" : "bg-[var(--chrome-border)]"
        }`}
      />
      {label}
    </span>
  );
}

function Step1({ siteName, onChange, canAdvance, onNext }) {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-20">
      <p className="app-eyebrow">
        Step 1 of 2
      </p>
      <h1
        className="app-title mt-3"
        style={{ textTransform: "none" }}
      >
        What's your site called?
      </h1>
      <p
        className="app-text mt-4 max-w-[480px]"
        style={{ textTransform: "none", letterSpacing: "normal" }}
      >
        Just a name for now. You can change it later in the builder.
      </p>

      <div className="mt-10">
        <label
          htmlFor="site-name"
          className="text-[16px] font-normal text-[var(--chrome-fg)]"
        >
          Site name
        </label>
        <input
          id="site-name"
          type="text"
          autoFocus
          value={siteName}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAdvance) onNext();
          }}
          placeholder="My new site"
          className="app-input mt-2 w-full px-3"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        />
      </div>

      <div className="mt-10 flex items-center gap-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          className="btn-chrome btn-chrome--lg"
        >
          Continue →
        </button>
        <span
          className="text-[16px] text-[var(--chrome-fg-subtle)]"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        >
          Or press Enter
        </span>
      </div>
    </div>
  );
}

function Step2({
  guideName,
  onGuideNameChange,
  tokens,
  onTokensChange,
  onBack,
  onFinish,
  canFinish,
}) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="flex items-start justify-between gap-6 mb-10">
        <div className="flex-1">
          <p className="app-eyebrow">
            Step 2 of 2
          </p>
          <h1
            className="app-title mt-3"
            style={{ textTransform: "none" }}
          >
            Set up the style guide for this site
          </h1>
          <p
            className="app-text mt-3 max-w-[560px]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            Colours, type, spacing, buttons.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onBack} className="btn-chrome btn-chrome--ghost btn-chrome--sm">
            ← Back
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={!canFinish}
            className="btn-chrome btn-chrome--sm"
          >
            Enter builder →
          </button>
        </div>
      </div>

      <div className="mb-8">
        <label
          htmlFor="guide-name"
          className="text-[16px] font-normal text-[var(--chrome-fg)]"
        >
          Style guide name
        </label>
        <input
          id="guide-name"
          type="text"
          value={guideName}
          onChange={(e) => onGuideNameChange(e.target.value)}
          placeholder="e.g. Default, Editorial, Compact"
          className="app-input mt-2 w-full max-w-[420px] px-3"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        />
      </div>

      <StyleGuideEditor tokens={tokens} onChange={onTokensChange} />
    </div>
  );
}

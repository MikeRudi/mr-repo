import AppShell from "../_components/AppShell.jsx";
import StyleGuideForm from "./StyleGuideForm.jsx";

export const metadata = {
  title: "Style Guide — MakeReign",
};

export default function StyleGuidePage() {
  return (
    <AppShell active="/styleguide">
      <section className="mx-auto max-w-[1320px] px-6 pt-12 pb-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-(--chrome-fg-subtle)">
          Set the brand
        </p>
        <h1 className="mt-2 font-[family-name:var(--chrome-font-display)] text-[44px] leading-tight text-(--chrome-fg)">
          Style guide
        </h1>
        <p className="mt-2 text-[14px] text-(--chrome-fg-muted) max-w-[640px]">
          Define the brand once. Wizardry sets a fluid rem so every section
          scales with the viewport. Colours, type, spacing, radii, card, and
          button tokens propagate to every section in the library. Saved to
          Neon so the whole team can pick up the same canvas.
        </p>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-20">
        <StyleGuideForm />
      </section>
    </AppShell>
  );
}

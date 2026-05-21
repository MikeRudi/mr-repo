import AppShell from "../_components/AppShell.jsx";
import StyleGuideForm from "./StyleGuideForm.jsx";

export const metadata = {
  title: "Style Guide — MakeReign",
};

export default function StyleGuidePage() {
  return (
    <AppShell active="/styleguide">
      <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-6">
        <p className="text-[12px] uppercase tracking-[0.18em] text-(--chrome-fg-subtle)">
          Set the brand
        </p>
        <h1 className="mt-2 font-[family-name:var(--chrome-font-display)] text-[44px] leading-tight text-(--chrome-fg)">
          Style guide
        </h1>
        <p className="mt-2 text-[14px] text-(--chrome-fg-muted) max-w-[640px]">
          Define the brand once. Sections in the library adapt to these tokens
          when you compose a site. Saved to Neon Postgres so you (and others
          on the team) can pick it up in the builder.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <StyleGuideForm />
      </section>
    </AppShell>
  );
}

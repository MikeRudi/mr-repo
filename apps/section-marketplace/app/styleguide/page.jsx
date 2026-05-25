import AppShell from "../_components/AppShell.jsx";
import StyleGuideForm from "./StyleGuideForm.jsx";

export const metadata = {
  title: "Style Guide — MakeReign",
};

export default function StyleGuidePage() {
  return (
    <AppShell active="/styleguide">
      <section className="mx-auto max-w-[1320px] px-8 pt-12 pb-4">
        <p className="app-eyebrow">
          Set the brand
        </p>
        <h1 className="app-title mt-2">
          Style guide
        </h1>
      </section>

      <section className="mx-auto max-w-[1320px] px-8 pb-20">
        <StyleGuideForm />
      </section>
    </AppShell>
  );
}

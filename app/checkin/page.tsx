import { AppHeader } from "@/components/AppHeader";
import { CheckInFlow } from "@/components/CheckInFlow";

export const metadata = { title: "Check in · Digital Sanctuary" };

export default function CheckInPage() {
  return (
    <main className="max-w-2xl mx-auto px-6">
      <AppHeader />
      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">
          ✦ your brain&apos;s soft launch
        </span>
        <h1 className="text-3xl sm:text-4xl max-w-[18ch]">
          Tiny check-in. <span className="ds-hl">One next move.</span> Zero
          pressure.
        </h1>
        <p className="text-ink-soft text-lg mt-4 max-w-[56ch]">
          15 seconds, fully optional. Slide what feels true, skip what
          doesn&apos;t.
        </p>
        <div className="mt-7">
          <CheckInFlow />
        </div>
      </section>
    </main>
  );
}

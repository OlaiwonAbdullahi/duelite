import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiChat02Icon,
  ArrowRight02Icon,
  Briefcase01Icon,
  CheckmarkCircle02Icon,
  StudentIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Section } from "@/components/landing/section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRUST_STRIP = [
  "Powered by BMONI",
  "cNGN backed 1:1 by Nigerian banks",
  "Every transaction on a verifiable ledger",
  "Test environment — no real funds",
];

const STEPS = [
  {
    number: "01",
    title: "Rep opens a department.",
    description:
      "Name it, set the due, get a link. Behind the scenes, Duelite opens a secure BMONI wallet for the department. Takes two minutes.",
  },
  {
    number: "02",
    title: "Students pay from the link.",
    description:
      "No app to download. Open the link, see what you owe, tap pay. Each student gets their own secure balance funded by simple bank transfer — money moves student → department as cNGN, a regulated digital naira backed 1:1 by real banks.",
  },
  {
    number: "03",
    title: "Everyone sees the same truth.",
    description:
      "The paid list, the balance, every single transaction — pulled live from the BMONI ledger, not typed in by anybody. When money leaves, it leaves through a verified bank withdrawal. Receipts for all. Arguments for none.",
  },
];

const DUEY_QA = [
  { q: "How much do I owe?", a: "instant answer" },
  { q: "Pay my dues", a: "done in chat, receipt follows" },
  { q: "Did my payment enter?", a: "confirmed with the transaction ref" },
  {
    q: "Wetin we don spend?",
    a: "plain-language breakdown — English or Pidgin",
  },
];

const TRANSPARENCY_POINTS = [
  {
    title: "Reps are protected",
    description: "the record proves what came in and what went out.",
  },
  {
    title: "Students are respected",
    description: "verify any payment yourself, anytime.",
  },
  {
    title: "Handover is painless",
    description:
      "next set of execs inherit a complete, timestamped history, not a torn notebook.",
  },
];

const AUDIENCE = [
  {
    icon: Briefcase01Icon,
    title: "For reps",
    description:
      "Stop chasing payments. Share one link, watch the list fill up, withdraw with a clean record behind you.",
  },
  {
    icon: StudentIcon,
    title: "For students",
    description:
      "Pay in seconds, keep your receipt, and see exactly what your ₦500 funded.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <Section band="canvas" className="pt-8 pb-20 sm:pt-12 lg:pt-16">
          <div className="flex flex-col items-center text-center">
            <Badge>Built on BMONI · Powered by AI</Badge>
            <h1 className="mt-6 max-w-3xl text-[28px] font-semibold leading-[1.15] text-ink sm:text-[40px] lg:text-[56px]">
              Pay your dues. See every kobo. No stories.
            </h1>
            <p className="mt-6 max-w-xl text-[14px] leading-[1.5] text-ink-soft sm:text-[15px]">
              Duelite gives course reps a clean way to collect departmental dues
              — and gives every student proof of where the money went. Money
              moves on BMONI&apos;s regulated stablecoin rails, so the record
              isn&apos;t our word. It&apos;s the ledger&apos;s.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <a href="/signup" className={buttonVariants()}>
                Start collecting
              </a>
              <a
                href="#duey"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "group",
                )}
              >
                Chat Duey on WhatsApp
                <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4">
              {TRUST_STRIP.map((item, i) => (
                <span key={item} className="flex items-center gap-3">
                  <span className="font-sans text-[12px] leading-[1.4] text-ink-soft">
                    {item}
                  </span>
                  {i < TRUST_STRIP.length - 1 && (
                    <span className="text-ink-soft" aria-hidden>
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* Problem */}
        <Section band="cloud">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[28px] font-semibold leading-[1.2] text-ink sm:text-[42px]">
              Every semester, same gbas gbos.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.5] text-ink-soft sm:text-[18px]">
              The rep collects ₦500 from 120 people. Cash here, transfer there,
              a notebook somewhere. By exam week, someone&apos;s asking
              &ldquo;where did our money go?&rdquo; — and there&apos;s no clean
              answer. Reps get accused. Students get ignored. Trust dies before
              the semester does.
            </p>
            <p className="mt-6 text-[14px] font-semibold leading-[1.6] text-ink">
              Duelite ends the argument. Not with promises — with a ledger
              nobody can edit.
            </p>
          </div>
        </Section>

        {/* How it works */}
        <Section band="canvas" id="how-it-works">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[28px] font-semibold leading-[1.2] text-ink sm:text-[42px]">
              From &ldquo;abeg pay your dues&rdquo; to paid — in three taps.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <Card key={step.number} className="flex flex-col gap-4">
                <span className="font-sans text-[30px] font-semibold leading-[1.2] text-primary">
                  {step.number}
                </span>
                <h3 className="text-[18px] font-semibold leading-[1.3] text-ink">
                  {step.title}
                </h3>
                <p className="text-[14px] leading-[1.6] text-ink-soft">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Duey AI */}
        <Section band="cloud" id="duey">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex size-14 items-center justify-center rounded-lg bg-canvas">
                <HugeiconsIcon
                  icon={AiChat02Icon}
                  size={28}
                  color="var(--primary)"
                />
              </div>
              <h2 className="mt-6 text-[28px] font-semibold leading-[1.2] text-ink sm:text-[38px]">
                Meet Duey. Your money, explained on WhatsApp.
              </h2>
              <p className="mt-4 text-[16px] leading-[1.5] text-ink-soft">
                No dashboard-wahala for students. Just text Duey:
              </p>
              <p className="mt-6 text-[14px] leading-[1.6] text-ink-soft">
                Duey also watches the money: duplicate payments, odd amounts,
                anything unusual — flagged before it becomes a problem.
              </p>
              <a
                href="#duey"
                className={cn(buttonVariants({ variant: "secondary" }), "mt-8")}
              >
                Ask Duey something
                <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
              </a>
            </div>

            <Card className="bg-canvas p-2 sm:p-3">
              <div className="flex flex-col gap-2">
                {DUEY_QA.map((row) => (
                  <div
                    key={row.q}
                    className="flex flex-col gap-1 rounded-md border border-hairline bg-paper p-4"
                  >
                    <span className="text-[14px] font-semibold italic leading-[1.4] text-ink">
                      &ldquo;{row.q}&rdquo;
                    </span>
                    <span className="flex items-center gap-2 text-[13px] leading-[1.5] text-primary">
                      <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
                      {row.a}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* Transparency */}
        <Section band="canvas" id="transparency">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[28px] font-semibold leading-[1.2] text-ink sm:text-[42px]">
              &ldquo;Trust me&rdquo; is not a system.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.5] text-ink-soft sm:text-[18px]">
              Every payment on Duelite lands on a public cryptographic ledger
              through BMONI. That means:
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TRANSPARENCY_POINTS.map((point) => (
              <div
                key={point.title}
                className="flex flex-col items-start gap-3"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={28}
                  color="var(--accent-gold)"
                />
                <h3 className="text-[16px] font-semibold leading-[1.3] text-ink">
                  {point.title}
                </h3>
                <p className="text-[14px] leading-[1.6] text-ink-soft">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Audience split */}
        <Section band="cloud">
          <div className="grid gap-6 md:grid-cols-2">
            {AUDIENCE.map((item) => (
              <Card
                key={item.title}
                className="flex flex-col items-start gap-4 bg-canvas"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-cloud">
                  <HugeiconsIcon
                    icon={item.icon}
                    size={22}
                    color="var(--primary)"
                  />
                </div>
                <h3 className="text-[20px] font-semibold leading-[1.3] text-ink">
                  {item.title}
                </h3>
                <p className="text-[14px] leading-[1.6] text-ink-soft">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <Section band="canvas" id="start">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h2 className="text-[28px] font-semibold leading-[1.2] text-ink sm:text-[42px]">
              Campus money, minus the wahala.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.5] text-ink-soft sm:text-[18px]">
              The dues are just the start — every student who pays gets a secure
              digital wallet. Financial access, one department at a time.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <a href="/signup" className={buttonVariants()}>
                Start collecting
              </a>
              <a
                href="#duey"
                className={buttonVariants({ variant: "secondary" })}
              >
                <HugeiconsIcon icon={WhatsappIcon} size={18} />
                I&apos;m a student — chat Duey
              </a>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

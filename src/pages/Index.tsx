import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Shield,
  ArrowRight,
  CreditCard,
  Send,
  History,
  Lock,
  Smartphone,
  Clock,
  PiggyBank,
  Building2,
  Gift,
  QrCode,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      icon: Lock,
      title: "Easy card lock / unlock",
      desc: "Instantly freeze or unfreeze your OunionTrust Bank card from the app.",
    },
    {
      icon: Smartphone,
      title: "Real-time fraud alerts",
      desc: "Get instant text alerts whenever we notice unusual activity.",
    },
    {
      icon: Shield,
      title: "Bank-grade security",
      desc: "Encryption, device security checks, and advanced fraud monitoring.",
    },
  ];

  const moneyTools = [
    {
      icon: CreditCard,
      title: "Virtual & physical cards",
      desc: "Use your card online, in-store, and in-wallet with Apple Pay & Google Pay.",
    },
    {
      icon: Send,
      title: "Fast transfers",
      desc: "Send money to anyone in seconds, 24/7, with low or no fees.",
    },
    {
      icon: History,
      title: "Full history",
      desc: "Track every deposit, payment, and transfer in one clean timeline.",
    },
  ];

  const savingsBenefits = [
    {
      icon: PiggyBank,
      title: "High-yield savings",
      desc: "Grow your money faster with a competitive APY on balances up to a set limit.",
    },
    {
      icon: Gift,
      title: "Automatic round-ups",
      desc: "Turn everyday purchases into savings with automatic round-ups.",
    },
    {
      icon: Clock,
      title: "Quarterly interest payouts",
      desc: "See your interest land in your savings on a predictable schedule.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Promo Banner */}
      <div className="w-full bg-primary/5 border-b border-primary/10 px-4 py-3 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
        <span className="font-medium">
          EARLY REFUND: Get your tax refund up to 5 days early when you direct deposit it.
        </span>
        <button className="text-primary underline underline-offset-2 font-medium">
          Learn more
        </button>
      </div>

      {/* Hero + Header */}
      <div className="relative bank-card-gradient text-white overflow-hidden">
        {/* Background circles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/20" />
          <div className="absolute -left-16 bottom-0 w-60 h-60 rounded-full bg-white/10" />
        </div>

        <div className="relative px-6 pt-10 pb-16 max-w-5xl mx-auto">
          {/* Top nav / logo row */}
          <header className="flex items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold font-display">OunionTrust Bank</span>
                <span className="text-[11px] text-white/70">
                  The everyday digital banking app
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs">
              <button
                onClick={() => navigate("/login")}
                className="text-white/80 hover:text-white transition"
              >
                Log in
              </button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 text-xs font-semibold"
                onClick={() => navigate("/register")}
              >
                Open an account
              </Button>
            </div>
          </header>

          {/* Main hero content */}
          <div className="grid md:grid-cols-[1.4fr,1fr] gap-8 items-center">
            <div>
              <p className="uppercase tracking-[0.2em] text-xs font-semibold text-white/70 mb-2">
                The banking app built for everyday people
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold font-display leading-tight mb-3">
                Overdraft protection
                <br />
                <span className="text-white/80">up to $300</span>
              </h1>
              <p className="text-sm sm:text-base text-white/80 mb-6 max-w-md">
                With eligible direct deposits and opt-in, OunionTrust Bank helps you stay ahead of
                bills, not behind them. No complicated hoops, just a mobile bank that has your back.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button
                  onClick={() => navigate("/register")}
                  className="h-12 px-6 bg-white text-primary hover:bg-white/90 text-sm font-semibold w-full sm:w-auto"
                >
                  Open an account
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="h-12 px-6 border-white/40 text-white hover:bg-white/10 text-sm w-full sm:w-auto"
                >
                  Activate your card
                </Button>
              </div>

              <p className="text-[11px] text-white/70 max-w-sm">
                Overdraft protection requires eligible direct deposits and opt-in. Limits and terms
                apply. Portfolio demo only — not a real banking service.
              </p>
            </div>

            {/* App mockup / image placeholder */}
            <div className="relative">
              <div className="rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 p-4 shadow-xl max-w-xs ml-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-white/70">OunionTrust Balance</span>
                    <span className="text-xl font-bold font-display">$3,245.19</span>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-100">
                    Up to $300 backup
                  </span>
                </div>

                <div className="space-y-3 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Paycheck</span>
                    <span className="text-emerald-200 font-medium">+ $1,200.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Groceries</span>
                    <span className="text-white/85">- $86.40</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Phone bill</span>
                    <span className="text-white/85">- $35.00</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-white/70">
                  <Shield className="w-3 h-3" />
                  <span>FDIC-style protection for demo purposes only.</span>
                </div>
              </div>

              {/* QR image placeholder */}
              <div className="absolute -bottom-4 -left-2 bg-white/95 rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-900">
                    Scan to get the app
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Download on iOS or Android
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* App Store / Play Store buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-black/80 px-3 py-2 text-white text-[11px]">
                <Smartphone className="w-4 h-4" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] uppercase tracking-wide text-white/60">
                    Download on the
                  </span>
                  <span className="text-xs font-semibold">App Store</span>
                </div>
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-black/80 px-3 py-2 text-white text-[11px]">
                <Smartphone className="w-4 h-4" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] uppercase tracking-wide text-white/60">
                    Get it on
                  </span>
                  <span className="text-xs font-semibold">Google Play</span>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-white/70 max-w-xs">
              App store badges shown for demo purposes. Replace with official assets for production.
            </p>
          </div>
        </div>
      </div>

      {/* Main content sections */}
      <main className="px-6 py-10 max-w-5xl mx-auto space-y-10">
        {/* No monthly fees */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              SAY NO TO MONTHLY FEES
            </p>
            <h2 className="text-xl font-semibold font-display">
              Say no to monthly fees. Say yes to keeping more of your money.
            </h2>
            <p className="text-sm text-muted-foreground">
              With OunionTrust Bank, there are no hidden surprises. Get no monthly fees after
              qualifying direct deposits. Otherwise, a simple, transparent low monthly fee that you
              always see up front.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• No minimum balance required</li>
              <li>• No overdraft fees on eligible transactions</li>
              <li>• No hidden maintenance fees or “gotchas”</li>
            </ul>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/register")}
            >
              No surprise fees here
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Get your money fast */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              GET YOUR MONEY FAST
            </p>
            <h2 className="text-xl font-semibold font-display">
              Get your pay up to 2 days early. Benefits up to 4 days early.
            </h2>
            <p className="text-sm text-muted-foreground">
              Direct deposit your paycheck, benefits, or tax refund into your OunionTrust Bank
              account and stop waiting for paper checks. Early access depends on your payer and
              their deposit schedule.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/50 rounded-2xl p-4">
              <Clock className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Pay up to 2 days early*</h3>
              <p className="text-xs text-muted-foreground">
                Many employers send direct deposit instructions early. We credit them as soon as we
                receive them.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <Building2 className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Benefits up to 4 days early*</h3>
              <p className="text-xs text-muted-foreground">
                Eligible government benefits may arrive earlier than your scheduled payment date.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <History className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Tax refunds up to 5 days early*</h3>
              <p className="text-xs text-muted-foreground">
                Direct deposit your refund and get your money as soon as the IRS releases it.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              Early paydays, please
            </Button>
          </div>
        </section>

        {/* Overdraft / backup */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              BACKUP WHEN YOU NEED IT
            </p>
            <h2 className="text-xl font-semibold font-display">
              Stay covered with up to $300 of backup for the “uh-oh” moments.
            </h2>
            <p className="text-sm text-muted-foreground">
              We’ve all been there — that moment at the register wondering if your card will go
              through. With overdraft protection up to $300 (when you qualify and opt in), OunionTrust
              can help cover eligible purchases and payments when your balance runs short.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/50 rounded-2xl p-4">
              <Shield className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Up to $300 overdraft protection*</h3>
              <p className="text-xs text-muted-foreground">
                Once you qualify, we may approve eligible purchases and payments that overdraw your
                account, up to your limit.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <History className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Clear activity & alerts</h3>
              <p className="text-xs text-muted-foreground">
                See exactly when overdraft protection kicked in and manage it right from the app.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              Backup your balance
            </Button>
          </div>
        </section>

        {/* Security section */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              KEEP YOUR MONEY SAFE
            </p>
            <h2 className="text-xl font-semibold font-display">
              It&apos;s your money — only you should have access to it.
            </h2>
            <p className="text-sm text-muted-foreground">
              OunionTrust Bank layers modern security controls to help keep your money and personal
              information safe from the moment you open your account.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {safetyFeatures.map((item) => (
              <div key={item.title} className="bg-muted/50 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              Stay protected
            </Button>
          </div>
        </section>

        {/* Build credit */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-4">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              BUILD YOUR CREDIT
            </p>
            <h2 className="text-xl font-semibold font-display">
              Climb to better credit with no annual fee.
            </h2>
            <p className="text-sm text-muted-foreground">
              Start your credit-building journey with the OunionTrust Secured Visa®-style Credit
              Card. No annual fee, no credit check for this demo experience, and no impact to your
              real credit when you apply here — because this is a portfolio project, not a real
              bank.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/50 rounded-2xl p-4">
              <CreditCard className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Build credit with everyday use</h3>
              <p className="text-xs text-muted-foreground">
                Pay on time and build positive payment history the simple way.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <PiggyBank className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">No annual fee*</h3>
              <p className="text-xs text-muted-foreground">
                Keep more of your money while you work on your credit journey.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              Ready, set, credit
            </Button>
          </div>
        </section>

        {/* Free ATMs */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-4">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              ACCESS TO CASH
            </p>
            <h2 className="text-xl font-semibold font-display">
              Free ATMs here, there, everywhere.
            </h2>
            <p className="text-sm text-muted-foreground">
              Withdraw cash fee-free at participating ATMs nationwide. Use the in-app ATM finder to
              locate your nearest free withdrawal spot.
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Store className="w-5 h-5 mt-1 text-primary" />
            <p className="text-xs text-muted-foreground">
              Exact ATM networks, locations, and availability would depend on real-world partners in
              a production bank. In this portfolio project, the feature is shown as a realistic
              concept.
            </p>
          </div>
        </section>

        {/* High-yield savings */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              SAVE SMARTER
            </p>
            <h2 className="text-xl font-semibold font-display">
              A high-yield savings account to save the day.
            </h2>
            <p className="text-sm text-muted-foreground">
              Make quick work of your savings goals with a high-yield savings account and interest
              paid regularly on eligible balances. Create separate goals, automate contributions,
              and track your progress in the app.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {savingsBenefits.map((item) => (
              <div key={item.title} className="bg-muted/50 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Deposit / Cash checks / Cash back */}
        <section className="bg-card rounded-3xl p-6 card-shadow space-y-6">
          <div className="space-y-2">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              EVERYDAY MONEY MOVES
            </p>
            <h2 className="text-xl font-semibold font-display">
              Your everyday money, managed in one app.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/50 rounded-2xl p-4">
              <Store className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Deposit cash at nearby stores</h3>
              <p className="text-xs text-muted-foreground">
                In a real deployment, partner retailers would let you deposit cash at the register.
                Here, the flow is represented as a realistic portfolio interaction.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <History className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Cash checks fast or for free</h3>
              <p className="text-xs text-muted-foreground">
                Snap a photo of your check and choose instant access for a fee, or standard access
                at no extra cost.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <Gift className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Earn instant cash back</h3>
              <p className="text-xs text-muted-foreground">
                Buy eGift cards from popular merchants inside the app to earn instant cash back to
                your account.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary rounded-3xl p-6 text-primary-foreground text-center space-y-3">
          <p className="uppercase text-[11px] tracking-[0.18em] text-primary-foreground/80">
            THIS WAY TO EARLY PAYDAY
          </p>
          <h2 className="text-2xl font-semibold font-display">
            Get your pay up to 2 days early with direct deposit.
          </h2>
          <p className="text-sm max-w-xl mx-auto text-primary-foreground/90">
            Open your OunionTrust Bank account in minutes, set up direct deposit, and experience a
            modern way to manage your everyday money. Designed as a realistic digital banking
            experience for your portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-3">
            <Button
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate("/register")}
            >
              Open an account
            </Button>
            <Button variant="outline" className="border-primary-foreground/30">
              Learn about direct deposit
            </Button>
          </div>
        </section>
      </main>

      {/* Footer with legal */}
      <footer className="border-t border-muted mt-8">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <div className="grid sm:grid-cols-4 gap-6 text-xs">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">Account</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Open an account</li>
                <li>Activate your card</li>
                <li>Get the app</li>
                <li>Direct deposit</li>
                <li>Build credit</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">Resources</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Help Center</li>
                <li>Quick help guides</li>
                <li>Contact support</li>
                <li>Blog</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">About</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>About OunionTrust Bank</li>
                <li>Careers (demo)</li>
                <li>Security</li>
                <li>Site map</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">Legal</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Account agreements</li>
                <li>Privacy statement</li>
                <li>Site terms of use</li>
                <li>Overdraft protection notice</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
            <p>
              * Features such as overdraft protection, early direct deposit, credit-building cards,
              and ATM access are shown here as part of a realistic portfolio design. In a real bank,
              these would depend on eligibility, partner networks, and applicable terms and
              conditions.
            </p>
            <p>
              Online access, identity verification, and device checks would typically be required to
              open and use an account. The content and flows here are for demonstration purposes
              only and do not represent a real financial product.
            </p>
            <p>
              All third-party names and logos (such as Visa, Apple, and Google) would be trademarks
              of their respective owners in a production environment. This portfolio project is not
              affiliated with, sponsored by, or endorsed by any real bank or financial institution.
            </p>
            <p className="mt-2">
              © 2026 OunionTrust Bank — Portfolio Demo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

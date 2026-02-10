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
      desc: "Use your card online, in-store, and in-wallet with Apple Pay & Google Play.",
    },
    {
      icon: Send,
      title: "Fast transfers",
      desc: "Send money to anyone in seconds, 24/7.",
    },
    {
      icon: History,
      title: "Full transaction history",
      desc: "Track every deposit, payment and transfer in one clean timeline.",
    },
  ];

  const savingsBenefits = [
    {
      icon: PiggyBank,
      title: "High-yield savings",
      desc: "Grow your money faster with a competitive APY on eligible balances.",
    },
    {
      icon: Gift,
      title: "Automatic round-ups",
      desc: "Turn everyday purchases into savings with automatic round-ups.",
    },
    {
      icon: Clock,
      title: "Regular interest payouts",
      desc: "See your interest credited to your savings on a predictable schedule.",
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
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/20" />
          <div className="absolute -left-16 bottom-0 w-60 h-60 rounded-full bg-white/10" />
        </div>

        <div className="relative px-6 pt-10 pb-16 max-w-5xl mx-auto">
          {/* Logo / Nav */}
          <header className="flex items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <img
                src="/logo-ouniontrust.png"
                alt="OunionTrust Bank logo"
                className="h-10 w-auto rounded-md bg-white/10 px-2 py-1 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold font-display">OunionTrust Bank</span>
                <span className="text-[11px] text-white/70">
                  Digital banking for everyday people
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

          {/* Hero content */}
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
                bills, not behind them. Simple banking designed to support your daily life.
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
                Overdraft protection requires eligible deposits and opt-in. Limits and terms apply.
              </p>
            </div>

            {/* Hero image */}
            <div className="relative">
              <img
                src="/hero-early-deposit.jpg"
                alt="Customer excited about early paycheck deposit from OunionTrust Bank"
                className="w-full max-w-sm ml-auto rounded-3xl object-cover shadow-xl"
              />
            </div>
          </div>

          {/* App Store buttons */}
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
              App store badges are placeholders — replace with official assets when ready.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <main className="px-6 py-10 max-w-5xl mx-auto space-y-10">
        {/* No Monthly Fees + image */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="space-y-3 mb-5">
                <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
                  NO MONTHLY FEES
                </p>
                <h2 className="text-xl font-semibold font-display">
                  Say no to monthly fees. Say yes to keeping more money.
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enjoy no monthly fees after qualifying direct deposits. Otherwise, a simple,
                  transparent monthly fee — no hidden charges or surprises.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No minimum balance</li>
                  <li>• No hidden maintenance fees</li>
                  <li>• No overdraft fees on eligible transactions</li>
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
            </div>

            <div>
              <img
                src="/hero-monthly-fee.jpg"
                alt="Customer happy about OunionTrust Bank monthly fee waived"
                className="w-full rounded-3xl object-cover shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Get Your Money Fast */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              GET YOUR MONEY FAST
            </p>
            <h2 className="text-xl font-semibold font-display">
              Get your pay up to 2 days early. Benefits up to 4 days early.
            </h2>
            <p className="text-sm text-muted-foreground">
              Direct deposit your paycheck, benefits or tax refund and access your money faster.
              Early access depends on your payer’s deposit schedule.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/50 rounded-2xl p-4">
              <Clock className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Pay up to 2 days early*</h3>
              <p className="text-xs text-muted-foreground">
                Many employers submit direct deposits ahead of schedule — receive them as soon as we
                get them.
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
                Get your tax refund as soon as it’s released — no waiting for paper checks.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm">
              Early paydays, please
            </Button>
          </div>
        </section>

        {/* Overdraft Protection */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              BACKUP WHEN YOU NEED IT
            </p>
            <h2 className="text-xl font-semibold font-display">
              Stay covered with up to $300 of overdraft backup.
            </h2>
            <p className="text-sm text-muted-foreground">
              Whether it’s the register, the gas pump or an unexpected subscription renewal,
              overdraft protection helps cover eligible purchases when your balance runs short.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/50 rounded-2xl p-4">
              <Shield className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Up to $300 overdraft protection*</h3>
              <p className="text-xs text-muted-foreground">
                Once you qualify, eligible card purchases and payments may be approved up to your
                assigned limit.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <History className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Real-time alerts & insights</h3>
              <p className="text-xs text-muted-foreground">
                Stay informed whenever overdraft protection is used.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm">
              Backup your balance
            </Button>
          </div>
        </section>

        {/* Security + Card Locked image */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="space-y-3 mb-5">
                <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
                  KEEP YOUR MONEY SAFE
                </p>
                <h2 className="text-xl font-semibold font-display">
                  It&apos;s your money — only you should have access to it.
                </h2>
                <p className="text-sm text-muted-foreground">
                  OunionTrust Bank provides multiple layers of security to help keep your account
                  and financial information safe.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
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

              <Button variant="outline" size="sm">
                Stay protected
              </Button>
            </div>

            <div className="relative">
              <img
                src="/hero-card-locked.jpg"
                alt="Customer locking their OunionTrust Bank card from the app"
                className="w-full rounded-3xl object-cover shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Build Credit */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-4">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              BUILD CREDIT
            </p>
            <h2 className="text-xl font-semibold font-display">
              Build credit with responsible everyday use — no annual fee.
            </h2>
            <p className="text-sm text-muted-foreground">
              Take the next step in your financial journey with the OunionTrust Secured Credit Card.
              No annual fee and straightforward tools to help build positive payment history.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/50 rounded-2xl p-4">
              <CreditCard className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Build credit with consistent payments</h3>
              <p className="text-xs text-muted-foreground">
                Payments are reported to major credit bureaus to help build your score over time.
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <PiggyBank className="w-5 h-5 mb-2 text-primary" />
              <h3 className="font-medium mb-1">No annual fee</h3>
              <p className="text-xs text-muted-foreground">
                Access credit-building tools without annual costs.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm">
              Start building credit
            </Button>
          </div>
        </section>

        {/* Free ATMs */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-4">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              NATIONWIDE ACCESS
            </p>
            <h2 className="text-xl font-semibold font-display">
              Free ATMs here, there, everywhere.
            </h2>
            <p className="text-sm text-muted-foreground">
              Withdraw cash free at eligible ATMs nationwide. Use the ATM locator in the app to find
              your nearest free cash withdrawal point.
            </p>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Store className="w-5 h-5 mt-1 text-primary" />
            <p className="text-xs text-muted-foreground">
              ATM availability depends on participating networks and retailer partnerships.
            </p>
          </div>
        </section>

        {/* Savings */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="space-y-3 mb-5">
            <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground">
              SAVE SMARTER
            </p>
            <h2 className="text-xl font-semibold font-display">
              A high-yield savings account to supercharge your goals.
            </h2>
            <p className="text-sm text-muted-foreground">
              Track progress on savings goals, automate contributions and earn a competitive APY
              with interest credited regularly.
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

        {/* Everyday money tools + App image */}
        <section className="bg-card rounded-3xl p-6 card-shadow">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="order-2 md:order-1">
              <p className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground mb-2">
                EVERYDAY MONEY
              </p>
              <h2 className="text-xl font-semibold font-display mb-3">
                All your day-to-day money tools in one app.
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your balance, move money, control your card and keep an eye on spending from
                a single, powerful app experience.
              </p>

              <div className="space-y-3">
                {moneyTools.map((tool) => (
                  <div key={tool.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <tool.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 md:order-2">
              <img
                src="/hero-app-card.jpg"
                alt="OunionTrust Bank mobile app and debit card"
                className="w-full rounded-3xl object-cover shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary rounded-3xl p-6 text-primary-foreground text-center space-y-3">
          <p className="uppercase text-[11px] tracking-[0.18em] text-primary-foreground/80">
            EARLY DIRECT DEPOSIT
          </p>
          <h2 className="text-2xl font-semibold font-display">
            Get your pay up to 2 days early with direct deposit.
          </h2>
          <p className="text-sm max-w-xl mx-auto text-primary-foreground/90">
            Open your OunionTrust Bank account in minutes and get faster access to your money.
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

      {/* Footer */}
      <footer className="border-t border-muted mt-8">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <div className="grid sm:grid-cols-4 gap-6 text-xs">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">Account</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Open an account</li>
                <li>Activate your card</li>
                <li>Get the app</li>
                <li>Find ATMs</li>
                <li>Build credit</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">Resources</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Help Center</li>
                <li>FAQs</li>
                <li>Support</li>
                <li>Guides</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">About</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>About OunionTrust Bank</li>
                <li>Security</li>
                <li>News</li>
                <li>Careers</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide">Legal</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Account agreements</li>
                <li>Privacy statement</li>
                <li>Terms of use</li>
                <li>Overdraft policy</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
            <p>
              Features like overdraft protection, early direct deposit and ATM access depend on
              eligibility and applicable terms. See account documents for full details.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} OunionTrust Bank. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

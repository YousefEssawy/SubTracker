import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import {
  HiOutlineCreditCard,
  HiOutlineChartPie,
  HiOutlineBell,
  HiOutlineSparkles,
  HiOutlinePlusCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import lightLogo from "@/assets/logo/light-mode.png";
import darkLogo from "@/assets/logo/dark-mode.png";
import RenewalDial from "@/components/ui/RenewalDial";
import { formatCurrency } from "@/utils/currencies";

// Sample subscriptions for the hero demo card — illustrative only, not live data.
interface DemoSub {
  name: string;
  icon: string;
  color: string;
  price: number;
  daysUntil: number;
}

const DEMO_SUBS: DemoSub[] = [
  { name: "Netflix", icon: "🎬", color: "#EF4444", price: 250, daysUntil: 3 },
  { name: "ChatGPT Plus", icon: "🤖", color: "#10B981", price: 380, daysUntil: 12 },
  { name: "iCloud+", icon: "☁️", color: "#06B6D4", price: 45, daysUntil: 20 },
  { name: "Adobe CC", icon: "💻", color: "#6366F1", price: 620, daysUntil: 1 },
];

// Animation variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── NavBar ──────────────────────────────────────────────────────────
const LandingNav = ({
  theme,
  onToggleTheme,
}: {
  theme: string;
  onToggleTheme: () => void;
}) => {
  const { t, i18n } = useTranslation();
  return (
    <header className="fixed top-0 start-0 end-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        <img
          src={theme === "light" ? lightLogo : darkLogo}
          alt="SubTracker"
          className="h-14"
        />
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
            }
            className="px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
            title="Toggle Language"
          >
            {i18n.language === "ar" ? "EN" : "عربي"}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
          >
            {t("landing.nav.signIn")}
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors"
          >
            {t("landing.nav.signUp")}
          </Link>
        </div>
      </div>
    </header>
  );
};

// ─── Hero demo card — the product's signature dial, shown doing its job ──
const HeroDemoCard = () => {
  const { t } = useTranslation();
  const total = DEMO_SUBS.reduce((sum, s) => sum + s.price, 0);

  return (
    <motion.div
      variants={fadeUp}
      custom={2}
      className="glass-card p-5 sm:p-6 w-full max-w-sm mx-auto lg:mx-0"
    >
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t("landing.hero.demoTitle")}
          </p>
          <p className="figure text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(total, "EGP")}
          </p>
        </div>
        <span className="text-[11px] text-gray-400">
          {t("landing.hero.demoSub")}
        </span>
      </div>

      <div className="space-y-1">
        {DEMO_SUBS.map((sub, i) => (
          <motion.div
            key={sub.name}
            variants={fadeUp}
            custom={3 + i * 0.4}
            className="flex items-center gap-3 py-2"
          >
            <RenewalDial
              icon={sub.icon}
              iconColor={sub.color}
              daysUntil={sub.daysUntil}
              billingCycle="monthly"
              size={38}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {sub.name}
              </p>
              <p className="text-xs text-gray-500">
                {sub.daysUntil === 0
                  ? t("dashboard.today")
                  : t("dashboard.days", { count: sub.daysUntil })}
              </p>
            </div>
            <p className="figure text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(sub.price, "EGP")}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────
const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Radial wash, contained behind the demo card rather than floating across the viewport */}
      <div className="absolute top-1/2 end-0 -translate-y-1/2 w-[36rem] h-[36rem] bg-gradient-to-br from-primary/15 via-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6 text-center lg:text-start"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <HiOutlineSparkles className="w-4 h-4" />
              {t("landing.hero.tag")}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-dark to-accent">
              {t("landing.hero.title1")}
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              {t("landing.hero.title2")}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            {t("landing.hero.desc")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              {t("landing.hero.startBtn")}
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-primary hover:text-primary-dark border-2 border-primary/30 hover:border-primary rounded-2xl transition-all duration-200"
            >
              {t("landing.hero.loginBtn")}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <HeroDemoCard />
        </motion.div>
      </div>
    </section>
  );
};

// ─── About ───────────────────────────────────────────────────────────
const AboutSection = () => {
  const { t } = useTranslation();

  const FEATURES = [
    {
      icon: HiOutlineCreditCard,
      title: t("landing.features.1.title"),
      desc: t("landing.features.1.desc"),
    },
    {
      icon: HiOutlineChartPie,
      title: t("landing.features.2.title"),
      desc: t("landing.features.2.desc"),
    },
    {
      icon: HiOutlineBell,
      title: t("landing.features.3.title"),
      desc: t("landing.features.3.desc"),
    },
    {
      icon: HiOutlineSparkles,
      title: t("landing.features.4.title"),
      desc: t("landing.features.4.desc"),
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-surface-dark/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={fadeUp} custom={0} className="space-y-5">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              {t("landing.about.tag")}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
              {t("landing.about.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              {t("landing.about.desc1")}
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("landing.about.desc2")}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            className="grid grid-cols-2 gap-4"
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── How to Use ──────────────────────────────────────────────────────
const HowToSection = () => {
  const { t } = useTranslation();

  const HOW_TO_STEPS = [
    {
      icon: HiOutlinePlusCircle,
      title: t("landing.howTo.1.title"),
      desc: t("landing.howTo.1.desc"),
      color: "from-primary to-indigo-400",
    },
    {
      icon: HiOutlineChartPie,
      title: t("landing.howTo.2.title"),
      desc: t("landing.howTo.2.desc"),
      color: "from-accent to-pink-400",
    },
    {
      icon: HiOutlineBell,
      title: t("landing.howTo.3.title"),
      desc: t("landing.howTo.3.desc"),
      color: "from-warning to-amber-400",
    },
    {
      icon: HiOutlineClock,
      title: t("landing.howTo.4.title"),
      desc: t("landing.howTo.4.desc"),
      color: "from-success to-emerald-400",
    },
  ];

  return (
    <section id="how-to" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 space-y-3"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            {t("landing.howTo.tag")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("landing.howTo.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {t("landing.howTo.desc")}
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {HOW_TO_STEPS.map((step, idx) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              custom={idx}
              className="relative bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black text-gray-100 dark:text-gray-700 select-none">
                  {idx + 1}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Coming Soon ─────────────────────────────────────────────────────
const ComingSoonSection = () => {
  const { t } = useTranslation();
  return (
    <section
      id="coming-soon"
      className="py-20 bg-gray-50 dark:bg-surface-dark/30"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto">
            <HiOutlineSparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("landing.comingSoon.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {t("landing.comingSoon.desc")}
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {[
            {
              icon: "📊",
              title: t("landing.comingSoon.1.title"),
              desc: t("landing.comingSoon.1.desc"),
            },
            {
              icon: "🏷️",
              title: t("landing.comingSoon.2.title"),
              desc: t("landing.comingSoon.2.desc"),
            },
            {
              icon: "📤",
              title: t("landing.comingSoon.3.title"),
              desc: t("landing.comingSoon.3.desc"),
            },
            {
              icon: "🤝",
              title: t("landing.comingSoon.4.title"),
              desc: t("landing.comingSoon.4.desc"),
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              custom={i}
              className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-card flex gap-4 items-start"
            >
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── CTA ─────────────────────────────────────────────────────────────
const CtaSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-primary to-accent rounded-3xl p-10 sm:p-14 overflow-hidden shadow-glass"
        >
          <div className="absolute inset-0 bg-white/5 rounded-3xl" />
          <div className="relative space-y-5">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t("landing.cta.title")}
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              {t("landing.cta.desc")}
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              {t("landing.cta.btn")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Footer ──────────────────────────────────────────────────────────
const LandingFooter = () => {
  const { t } = useTranslation();
  return (
    <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{t("landing.footer.copyright")}</span>
        <div className="flex items-center gap-6">
          <Link to="/about" className="hover:text-primary transition-colors">
            {t("landing.footer.about")}
          </Link>
          <Link to="/how-to" className="hover:text-primary transition-colors">
            {t("landing.footer.howTo")}
          </Link>
          <Link
            to="/coming-soon"
            className="hover:text-primary transition-colors"
          >
            {t("landing.footer.comingSoon")}
          </Link>
        </div>
      </div>
    </footer>
  );
};

// ─── Main Component ───────────────────────────────────────────────────
const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white overflow-x-hidden"
    >
      <LandingNav theme={theme} onToggleTheme={toggleTheme} />
      <HeroSection />
      <AboutSection />
      <HowToSection />
      <ComingSoonSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;

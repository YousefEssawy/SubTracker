import { motion } from "framer-motion";
import {
  HiOutlinePlusCircle,
  HiOutlineClock,
  HiOutlineChartPie,
  HiOutlineBell,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const HowToPage = () => {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("howTo.step1Title"),
      description: t("howTo.step1Desc"),
      icon: HiOutlinePlusCircle,
    },
    {
      title: t("howTo.step2Title"),
      description: t("howTo.step2Desc"),
      icon: HiOutlineChartPie,
    },
    {
      title: t("howTo.step3Title"),
      description: t("howTo.step3Desc"),
      icon: HiOutlineBell,
    },
    {
      title: t("howTo.step4Title"),
      description: t("howTo.step4Desc"),
      icon: HiOutlineClock,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          {t("howTo.title")}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t("howTo.subtitle")}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="glass-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary">
                <step.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card mt-12 text-center p-8"
      >
        <h2 className="font-display text-2xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">{t("howTo.ctaTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t("howTo.ctaText")}
        </p>
      </motion.div>
    </div>
  );
};

export default HowToPage;

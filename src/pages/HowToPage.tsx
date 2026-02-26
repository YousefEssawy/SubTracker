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
      color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: t("howTo.step2Title"),
      description: t("howTo.step2Desc"),
      icon: HiOutlineChartPie,
      color: "text-green-500 bg-green-50 dark:bg-green-500/10",
    },
    {
      title: t("howTo.step3Title"),
      description: t("howTo.step3Desc"),
      icon: HiOutlineBell,
      color: "text-red-500 bg-red-50 dark:bg-red-500/10",
    },
    {
      title: t("howTo.step4Title"),
      description: t("howTo.step4Desc"),
      icon: HiOutlineClock,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
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
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
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
            className="card p-6 border-l-4 border-primary"
          >
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl flex-shrink-0 ${step.color}`}>
                <step.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
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
        className="mt-12 text-center p-8 bg-primary/5 rounded-2xl border border-primary/20"
      >
        <h2 className="text-2xl font-bold mb-4">{t("howTo.ctaTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t("howTo.ctaText")}
        </p>
      </motion.div>
    </div>
  );
};

export default HowToPage;

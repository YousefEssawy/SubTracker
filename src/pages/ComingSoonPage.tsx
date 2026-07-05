import { motion } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineTag,
  HiOutlinePlus,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const ComingSoonPage = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const upcomingFeatures = [
    {
      title: t("comingSoon.expenseTracking", "Comprehensive Expense Tracking"),
      description: t(
        "comingSoon.expenseTrackingDesc",
        "Go beyond subscriptions. Soon, you'll be able to track all your daily expenses, bills, and one-off purchases in one unified dashboard.",
      ),
      icon: HiOutlineChartBar,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: t(
        "comingSoon.customCategories",
        "Custom Categories & Subcategories",
      ),
      description: t(
        "comingSoon.customCategoriesDesc",
        "Organize your spending exactly how you want. Create infinite custom categories and granular subcategories to see exactly where your money goes.",
      ),
      icon: HiOutlineTag,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 relative">
          <HiOutlineSparkles className="w-10 h-10 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6">
          {t("comingSoon.title", "More Power is Coming Soon!")}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t(
            "comingSoon.subtitle",
            "We are working hard behind the scenes to bring you the ultimate financial tracking experience. Here is a sneak peek at what's next.",
          )}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-8"
      >
        {upcomingFeatures.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="card p-8 group hover:-translate-y-2 transition-transform duration-300"
          >
            <div
              className={`p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 ${feature.color}`}
            >
              <feature.icon className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}

        {/* Decorative coming soon block */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 card p-8 border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-center min-h-[200px]"
        >
          <HiOutlinePlus className="w-12 h-12 text-primary/40 mb-4" />
          <h3 className="font-display text-xl font-semibold tracking-tight text-gray-500 dark:text-gray-400">
            {t("comingSoon.muchMore", "And much more...")}
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            {t("comingSoon.stayTuned", "Stay tuned for updates!")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoonPage;

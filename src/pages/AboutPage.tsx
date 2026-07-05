import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaInstagram, FaCode } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/YousefEssawy",
      icon: FaGithub,
      color: "hover:text-[#333] dark:hover:text-white",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/yousefessawy/",
      icon: FaLinkedin,
      color: "hover:text-[#0077b5]",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/joessawy/",
      icon: FaInstagram,
      color: "hover:text-[#e1306c]",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
            <FaCode className="w-8 h-8" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("about.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("about.subtitle")}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">{t("about.missionTitle")}</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            {t("about.missionText")}
          </p>
          <div className="rounded-xl p-6 bg-primary/5 border border-primary/10">
            <h3 className="font-display font-semibold tracking-tight text-lg mb-2 text-primary">
              {t("about.keyFeatures")}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>{t("about.feature1")}</li>
              <li>{t("about.feature2")}</li>
              <li>{t("about.feature3")}</li>
              <li>{t("about.feature4")}</li>
            </ul>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
            {t("about.meetDeveloper")}
          </h2>
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">YE</span>
          </div>
          <h3 className="font-display text-xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">Yousef Essawy</h3>
          <p className="text-gray-500 mb-6">{t("about.developerRole")}</p>

          <div className="flex items-center justify-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-400 transition-colors duration-300 ${link.color}`}
                title={link.name}
              >
                <link.icon className="w-8 h-8" />
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutPage;

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaInstagram, FaCode } from "react-icons/fa";

const AboutPage = () => {
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
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4">
            <FaCode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            About SubTracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            A seamless way to manage all your subscriptions in one place.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            SubTracker was built with a simple goal: to give users complete
            control over their recurring expenses. In a world where everything
            is moving to a subscription model, it's easy to lose track of what
            you're paying for. SubTracker helps you monitor, manage, and
            optimize your subscriptions so you never pay for a service you don't
            use.
          </p>
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
            <h3 className="font-semibold text-lg mb-2 text-primary">
              Key Features:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Track all subscription costs automatically</li>
              <li>Get reminded of upcoming renewals</li>
              <li>Support for multiple currencies</li>
              <li>Detailed analytics and expense history</li>
            </ul>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Meet the Developer</h2>
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">YE</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Yousef Essawy</h3>
          <p className="text-gray-500 mb-6">
            Software Engineer & Creator of SubTracker
          </p>

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

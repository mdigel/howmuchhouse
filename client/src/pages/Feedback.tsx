
import React from 'react';
import { motion } from 'framer-motion';

export default function Feedback() {
  return (
    <div className="w-full py-6 min-h-screen">
      <div className="pt-24 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative space-y-4 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg"
      >
        <motion.a
          href="https://x.com/Elder_Deagle"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-col items-center gap-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3, ease: "easeInOut", delay: 0.15 }}
            className="text-foreground hover:text-primary transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" className="transition-colors duration-300">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </motion.div>
          <span className="text-lg font-medium tracking-wide text-foreground">ideas, feedback, bugs</span>
        </motion.a>
      </motion.div>
      </div>
    </div>
  );
}

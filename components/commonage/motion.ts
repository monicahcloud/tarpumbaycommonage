import { easeOut } from "framer-motion";

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOut },
};

export const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
};

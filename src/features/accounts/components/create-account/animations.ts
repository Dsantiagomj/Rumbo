import type { Variants } from 'framer-motion';

/**
 * Animation variants for the selection view
 */

// Container animation for staggered children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// Card entrance animations - más elegante y suave
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic bezier para suavidad
    },
  },
};

// Reduced motion variants (simpler)
export const cardVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Upload icon animation - muy sutil y smooth
export const uploadIconVariants: Variants = {
  idle: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -3,
    scale: 1.05,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // Ease out expo - muy suave
    },
  },
};

// Pen icon animation - rotación muy suave
export const penIconVariants: Variants = {
  idle: {
    rotate: 0,
    scale: 1,
  },
  hover: {
    rotate: -5,
    scale: 1.05,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // Ease out expo - muy suave
    },
  },
};

// Page transition between views - más suave y elegante
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.96,
    y: -20,
  },
};

export const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// Help section expand/collapse
export const helpSectionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

// Header animation - fade in from top
export const headerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

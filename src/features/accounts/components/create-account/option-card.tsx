'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { Variants } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

export interface Feature {
  icon: LucideIcon;
  text: string;
  color?: string;
}

export interface OptionCardProps {
  // Theme
  theme: {
    primary: string;
    bg: string;
    hover: string;
  };

  // Badge
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };

  // Icon
  icon: {
    component: LucideIcon;
    variants?: Variants;
    color: string;
    bgColor: string;
  };

  // Content
  title: string;
  timeEstimate?: string;
  description: string;
  features: Feature[];
  bestFor: {
    icon: LucideIcon;
    text: string;
  };
  stats?: {
    show: boolean;
    text: string;
  };

  // Interactions
  onClick: () => void;
  variants?: Variants;
  prefersReducedMotion?: boolean;
}

export function OptionCard({
  theme,
  badge,
  icon,
  title,
  timeEstimate,
  description,
  features,
  bestFor,
  stats,
  onClick,
  variants,
  prefersReducedMotion = false,
}: OptionCardProps) {
  const Icon = icon.component;
  const BestForIcon = bestFor.icon;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Create ripple effect
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    ripple.style.background = `var(--${theme.primary})`;

    card.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);

    // Call the onClick handler
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const MotionCard = motion(Card);
  const MotionIcon = motion(Icon);

  return (
    <MotionCard
      variants={variants}
      className={cn(
        'group relative cursor-pointer overflow-hidden border-2',
        'transition-shadow duration-500 ease-out',
        'hover:shadow-lg',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        `hover:border-${theme.primary} focus-visible:ring-${theme.primary}`,
      )}
      style={{
        transition: 'border-color 0.4s ease-out',
      }}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${description}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              y: -2,
              scale: 1.005,
              transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1], // Ease out expo - muy suave
              },
            }
      }
      whileTap={
        prefersReducedMotion
          ? {}
          : {
              scale: 0.995,
              transition: {
                duration: 0.15,
                ease: [0.16, 1, 0.3, 1],
              },
            }
      }
    >
      {/* Badge */}
      {badge && (
        <Badge className="absolute top-4 right-4 z-10" variant={badge.variant || 'default'}>
          {badge.text}
        </Badge>
      )}

      <div className="p-6 md:p-8 lg:p-10">
        {/* Animated Icon */}
        <div
          className={cn(
            'mb-6 flex h-16 w-16 items-center justify-center rounded-2xl',
            'transition-colors duration-500 ease-out',
            `bg-${icon.bgColor} group-hover:bg-${theme.hover}`,
            'md:h-20 md:w-20',
          )}
        >
          <MotionIcon
            className={cn('h-8 w-8 md:h-10 md:w-10', `text-${icon.color}`)}
            variants={icon.variants}
            initial="idle"
            animate="idle"
            whileHover={prefersReducedMotion ? {} : 'hover'}
          />
        </div>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
          {timeEstimate && (
            <p className="text-muted-foreground mt-2 text-sm font-medium">{timeEstimate}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 text-xs leading-relaxed md:text-sm">
          {description}
        </p>

        {/* Features List */}
        <div className="mb-6 space-y-2">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FeatureIcon className="text-muted-foreground h-4 w-4" />
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>

        {/* Best For */}
        <div className={cn('rounded-lg p-3', `bg-${theme.bg}`)}>
          <div className="flex items-start gap-2">
            <BestForIcon className={cn('mt-0.5 h-4 w-4', `text-${theme.primary}`)} />
            <p className="text-xs">{bestFor.text}</p>
          </div>
        </div>

        {/* Stats (optional) */}
        {stats?.show && (
          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-xs font-medium">{stats.text}</p>
          </div>
        )}
      </div>
    </MotionCard>
  );
}

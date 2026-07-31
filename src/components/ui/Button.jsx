import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cx } from '@/utils/helpers';

const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 shadow-soft',
  secondary: 'bg-surface text-ink border border-line hover:bg-elevated hover:border-muted/40',
  ghost: 'text-muted hover:text-ink hover:bg-ink/5',
  subtle: 'bg-accent/10 text-accent hover:bg-accent/15',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-soft',
  'danger-ghost': 'text-rose-500 hover:bg-rose-500/10',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-lg',
};

/**
 * One button to rule them all.
 * Renders <button>, <a> (when `href` is given) or <Link> (when `to` is given).
 */
const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    className,
    children,
    disabled,
    ...rest
  },
  ref
) {
  const classes = cx(
    'inline-flex items-center justify-center font-medium transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className
  );

  const content = (
    <>
      {Icon ? <Icon className="shrink-0 text-[1.1em]" aria-hidden /> : null}
      {children}
      {IconRight ? <IconRight className="shrink-0 text-[1.1em]" aria-hidden /> : null}
    </>
  );

  const motionProps = {
    whileHover: disabled ? undefined : { y: -1 },
    whileTap: disabled ? undefined : { scale: 0.97 },
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  };

  if (to) {
    return (
      <motion.div className="inline-flex" {...motionProps}>
        <Link ref={ref} to={to} className={classes} {...rest}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...motionProps}
        {...rest}
      >
        {content}
      </motion.a>
    );
  }

  const Component = as || motion.button;
  return (
    <Component ref={ref} className={classes} disabled={disabled} {...motionProps} {...rest}>
      {content}
    </Component>
  );
});

export default Button;

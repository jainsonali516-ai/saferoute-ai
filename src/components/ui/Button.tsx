import { cn } from "@/lib/utils";
import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "emergency";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "brand-gradient-bg text-white shadow-lg shadow-fuchsia-900/30 hover:brightness-110 active:brightness-95",
  secondary:
    "bg-white/8 text-foreground border border-white/15 hover:bg-white/14",
  ghost: "bg-transparent text-foreground hover:bg-white/8",
  danger: "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
  emergency:
    "bg-danger text-white shadow-lg shadow-red-900/40 hover:brightness-110 active:brightness-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3.5 rounded-2xl gap-2.5",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

interface LinkButtonProps
  extends BaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children"> {
  href: string;
  external?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none";

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  className,
  children,
  href,
  external,
  ...props
}: LinkButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className);
  if (external || href.startsWith("tel:") || href.startsWith("http")) {
    return (
      <a href={href} className={classes} {...props}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {icon}
      {children}
    </Link>
  );
}

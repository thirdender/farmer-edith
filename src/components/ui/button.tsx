import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_0_oklch(0_0_0/0.12)] hover:bg-primary-hover",
        secondary:
          "bg-card text-foreground border border-border hover:bg-card-hover",
        ghost: "bg-transparent text-foreground hover:bg-card-hover",
        danger: "bg-danger text-danger-foreground hover:bg-danger-hover",
      },
      size: {
        md: "h-11 px-4 rounded-[var(--radius-md)] text-sm",
        lg: "h-12 px-5 rounded-[var(--radius-md)] text-base",
        sm: "h-9 px-3 rounded-[var(--radius-sm)] text-xs",
        icon: "size-11 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  if (asChild) {
    return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

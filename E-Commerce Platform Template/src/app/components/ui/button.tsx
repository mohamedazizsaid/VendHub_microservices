import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 shadow-sm hover:shadow-md",
        secondary: "bg-[#2C3E50] text-white hover:bg-[#2C3E50]/90 shadow-sm hover:shadow-md",
        outline: "border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white",
        ghost: "text-[#2C3E50] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
      },
      size: {
        default: "px-4 py-2 text-base",
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant,
  size,
  children,
  className,
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Simple radio group implementation without Radix UI dependency
const RadioGroupContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    if (!context) {
      throw new Error("RadioGroupItem must be used within RadioGroup");
    }

    const isChecked = context.value === value;

    return (
      <input
        ref={ref}
        type="radio"
        id={id}
        value={value}
        checked={isChecked}
        onChange={() => context.onValueChange(value)}
        className={cn(
          "h-4 w-4 border border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-blue-500",
          className
        )}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };


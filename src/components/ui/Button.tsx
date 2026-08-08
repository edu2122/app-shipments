import type { ComponentChildren, JSX } from "preact";
import { buttonClasses, cn } from "../../lib/utils";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ComponentChildren;
}

export default function Button({ variant = "primary", class: className, children, ...rest }: ButtonProps) {
  return (
    <button class={cn(buttonClasses(variant), className as string)} {...rest}>
      {children}
    </button>
  );
}

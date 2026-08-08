import type { ComponentChildren, JSX } from "preact";
import { cardClasses, cn } from "../../lib/utils";

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ComponentChildren;
}

export default function Card({ interactive = false, class: className, children, ...rest }: CardProps) {
  return (
    <div class={cn(cardClasses(interactive), className as string)} {...rest}>
      {children}
    </div>
  );
}

// components/container.tsx
import * as React from "react";
import clsx from "clsx";

type ContainerProps<T extends React.ElementType = "div"> = {
  as?: T;
  wide?: boolean;
  className?: string;
} & React.ComponentPropsWithoutRef<T>;

export default function Container<T extends React.ElementType = "div">({
  as,
  wide = false,
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = as || "div";
  const base =
    "page-container " + (wide ? "max-w-[var(--container-2xl)]" : "max-w-[var(--container-xl)]");

  return <Tag className={clsx(base, className)} {...props} />;
}

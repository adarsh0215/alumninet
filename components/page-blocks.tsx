// components/page-blocks.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

/* ---------------------------------- */
/* Polymorphic helpers (generic)      */
/* ---------------------------------- */
type AsProp<T extends React.ElementType> = {
  as?: T;
};

type PolymorphicProps<T extends React.ElementType> = AsProp<T> &
  Omit<React.ComponentPropsWithoutRef<T>, "as">;

/* ---------------------------------- */
/* PageHeader                         */
/* ---------------------------------- */

type PageHeaderBaseProps = {
  /** Main title (can be string or custom node) */
  title?: React.ReactNode;
  /** Optional short description below the title */
  description?: React.ReactNode;
  /** Right-aligned actions (e.g., buttons) */
  actions?: React.ReactNode;
  /** Extra classes for root wrapper */
  className?: string;
};

export function PageHeader<T extends React.ElementType = "header">(
  props: PageHeaderBaseProps & PolymorphicProps<T>
) {
  const {
    as,
    title,
    description,
    actions,
    className,
    children, // in case you want to pass your own custom content
    ...rest
  } = props;
  const Tag = (as || "header") as React.ElementType;

  return (
    <Tag
      className={clsx(
        "w-full",
        "mb-6 md:mb-8",
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className
      )}
      {...rest}
    >
      <div className="min-w-0">
        {title ? (
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
        ) : null}

        {description ? (
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}

        {/* If you want to render custom nodes under the heading */}
        {children}
      </div>

      {actions ? <div className="mt-2 md:mt-0 shrink-0">{actions}</div> : null}
    </Tag>
  );
}

/* ---------------------------------- */
/* Fieldset                           */
/* ---------------------------------- */

type FieldsetBaseProps = {
  /** Section heading */
  legend?: React.ReactNode;
  /** Optional short helper/description */
  hint?: React.ReactNode;
  /** Content (typically FormFields) */
  children?: React.ReactNode;
  /** Extra classes */
  className?: string;
};

export function Fieldset<T extends React.ElementType = "section">(
  props: FieldsetBaseProps & PolymorphicProps<T>
) {
  const { as, legend, hint, children, className, ...rest } = props;
  const Tag = (as || "section") as React.ElementType;

  return (
    <Tag
      className={clsx(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...rest}
    >
      {(legend || hint) && (
        <div className="border-b p-4 md:p-5">
          {legend ? (
            <h2 className="text-base font-medium leading-none md:text-lg">
              {legend}
            </h2>
          ) : null}
          {hint ? (
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      )}

      <div className="p-4 md:p-6">{children}</div>
    </Tag>
  );
}

/* ---------------------------------- */
/* PageSection (simple wrapper)       */
/* ---------------------------------- */

type PageSectionBaseProps = {
  className?: string;
  children?: React.ReactNode;
};

export function PageSection<T extends React.ElementType = "section">(
  props: PageSectionBaseProps & PolymorphicProps<T>
) {
  const { as, className, children, ...rest } = props;
  const Tag = (as || "section") as React.ElementType;

  return (
    <Tag className={clsx("space-y-4 md:space-y-6", className)} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------------------------- */
/* PageActions (button row)           */
/* ---------------------------------- */

type PageActionsBaseProps = {
  className?: string;
  children?: React.ReactNode;
};

export function PageActions<T extends React.ElementType = "div">(
  props: PageActionsBaseProps & PolymorphicProps<T>
) {
  const { as, className, children, ...rest } = props;
  const Tag = (as || "div") as React.ElementType;

  return (
    <Tag
      className={clsx(
        "flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

"use client";

import {
  Children, cloneElement, isValidElement, useId,
  type ReactElement, type ReactNode,
} from "react";

type ControlProps = { id?: string; "aria-describedby"?: string };

/** Keep the label separate so its emphasis never becomes the input's weight. */
export function AdminField({ label, children, hint }: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const uniqueId = useId();
  const items = Children.toArray(children);
  const control = items.find(child =>
    isValidElement(child) && ["input", "select", "textarea"].includes(String(child.type)),
  ) as ReactElement<ControlProps> | undefined;
  const controlId = control?.props.id ?? `${uniqueId}-control`;
  const hintId = `${uniqueId}-hint`;
  return (
    <div className="min-w-0">
      <label htmlFor={controlId} className="block text-sm font-semibold leading-6 text-navy">
        {label}
      </label>
      {items.map(child => control && child === control ? cloneElement(control, {
        id: controlId,
        "aria-describedby": [control.props["aria-describedby"], hint ? hintId : undefined]
          .filter(Boolean).join(" ") || undefined,
      }) : child)}
      {hint ? (
        <p id={hintId} className="mt-2 text-sm font-normal leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function ManualUrduNote() {
  return (
    <p className="mt-3 text-sm font-normal leading-relaxed text-muted">
      Optional wording for a manually written Urdu version. The website’s Translate
      button translates English content automatically, so you can leave these
      fields blank. Saved Urdu text is kept separately.
    </p>
  );
}

"use client";

import { useId, useRef, useState, type ComponentPropsWithRef } from "react";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function validationMessage(field: Field) {
  if (field.validity.customError) return field.validationMessage;
  if (field.validity.valueMissing) return field instanceof HTMLInputElement && field.type === "checkbox"
    ? "Please select this option to continue." : "Please complete this required field.";
  if (field.validity.typeMismatch) return field instanceof HTMLInputElement && field.type === "email"
    ? "Please enter a valid email address." : "Please enter a valid value.";
  if (field.validity.tooShort) return "Please enter a longer value.";
  if (field.validity.rangeUnderflow || field.validity.rangeOverflow) return "Please enter a value within the allowed range.";
  if (field.validity.patternMismatch) return "Please use the requested format for this field.";
  return "Please check this field and try again.";
}

export function Form({ children, onSubmit, onInvalid, onInput, ...props }: ComponentPropsWithRef<"form">) {
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const errorId = useId();

  return <><form {...props}
    aria-describedby={[props["aria-describedby"], error ? errorId : ""].filter(Boolean).join(" ") || undefined}
    onInvalid={event => {
      onInvalid?.(event);
      const field = event.target as Field;
      setError(validationMessage(field));
    }}
    onInput={event => {
      setError("");
      onInput?.(event);
    }}
    onSubmit={async event => {
      if (submitting.current) { event.preventDefault(); return; }
      setError("");
      if (!props.noValidate) {
        const empty = Array.from(event.currentTarget.elements).find(element =>
          (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) &&
          element.required && !element.disabled && !element.value.trim()
        ) as Field | undefined;
        if (empty) {
          event.preventDefault();
          setError("Please complete all required fields.");
          empty.focus();
          return;
        }
      }
      if (!onSubmit) return;
      submitting.current = true;
      try { await onSubmit(event); }
      catch {
        setError("We couldn’t complete your request. Please try again.");
      } finally { submitting.current = false; }
    }}
  >
    {children}
  </form>
    {error && <p id={errorId} role="alert" className="mt-3 w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
  </>;
}

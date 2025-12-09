"use client";

import { FC, PropsWithChildren, useEffect, useRef } from "react";

interface FormProps {
  onSubmit?: (event?: React.FormEvent<HTMLFormElement>) => void;
  autoFocus?: boolean;
}

export const Form: FC<PropsWithChildren<FormProps>> = ({
  autoFocus = true,
  onSubmit,
  children,
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        formRef.current?.querySelector("input")?.focus();
      }, 200);
    }
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
    >
      {children}
    </form>
  );
};

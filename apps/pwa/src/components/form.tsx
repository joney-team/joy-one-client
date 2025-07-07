"use client";

import { FC, PropsWithChildren, useEffect, useRef } from "react";

interface FormProps {
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
}

export const Form: FC<PropsWithChildren<FormProps>> = (props) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setTimeout(() => {
      formRef.current?.querySelector("input")?.focus();
    }, 200);
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit?.(e);
      }}
    >
      {props.children}
    </form>
  );
};

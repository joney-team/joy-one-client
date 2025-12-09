import React, { ComponentPropsWithRef, ElementType, forwardRef, useEffect, useRef } from "react";

type AsProp<T extends ElementType> = {
  as?: T;
  enabled?: boolean;
};

type Props<T extends ElementType> = AsProp<T> & Omit<ComponentPropsWithRef<T>, keyof AsProp<T>>;

export const AutoFocus = forwardRef(
  <T extends ElementType = "input">({ as, enabled, ...rest }: Props<T>, ref: React.Ref<any>) => {
    const Component = as || "input";
    const innerRef = useRef<any>(null);

    // merge forwarded ref + internal ref
    useEffect(() => {
      if (enabled !== false && innerRef.current) {
        setTimeout(() => {
          innerRef.current?.querySelector("input")?.focus();
        }, 200);
      }
    }, [enabled, innerRef.current]);

    return (
      <Component
        ref={(node: any) => {
          innerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
        }}
        {...rest}
      />
    );
  }
);

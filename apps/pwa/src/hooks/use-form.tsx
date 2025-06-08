import { onError } from "@/utils/exceptions.utils";
import type { UseFormReturnType } from "@mantine/form";
import { AxiosError } from "axios";
import { useState } from "react";

export type _TransformValues<Values> = (values: Values) => unknown;
export function useFormSubmit<Values, TransformValues extends _TransformValues<Values>>(
  form: UseFormReturnType<Values, TransformValues>,
  handlers: {
    onSubmit: (values: ReturnType<TransformValues>) => Promise<any> | any;
    onError?: (error: any) => void;
    onSuccess?: (response: any, form: UseFormReturnType<Values, TransformValues>) => void;
  }
) {
  const [loading, setLoading] = useState(false);

  const handle = (event?: React.FormEvent<HTMLFormElement>) => {
    return new Promise((resolve) => {
      const onSubmit = form.onSubmit(async (values) => {
        setLoading(true);
        try {
          const response = await handlers.onSubmit(values as any);
          setLoading(false);
          handlers.onSuccess?.(response, form);
          resolve(response || null);
        } catch (error) {
          setLoading(false);

          if (error instanceof AxiosError) {
            form.setErrors(error.response?.data?.errors || {});
          }

          if (handlers.onError) {
            handlers.onError?.(error);
          } else {
            onError(error);
          }

          resolve(null);
        }
      });

      onSubmit(event);
      if (!form.isValid()) {
        setLoading(false);
        resolve(null);
      }
    });
  };

  return {
    handle,
    isSubmitting: loading,
  };
}

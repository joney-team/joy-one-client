import { ObjectUtils } from "./object.utils";

export type ServerResponse<T> = {
  result?: T | null;
  error?: string | null;
  statusCode: number;
};

const getErrorMessage = (error: unknown): string => {
  const restErrorMessage = ObjectUtils.getIn(error, "response.data.message");

  if (restErrorMessage) {
    return restErrorMessage;
  } else if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else {
    return "Unknown error";
  }
};

export const withServerAction = <T extends any>(
  action: (...args: any[]) => Promise<T>,
): ((...args: any[]) => Promise<ServerResponse<T>>) => {
  return async (...args) => {
    try {
      console.log("Executing server action with args:", args);
      const result = await action(...args);
      return {
        result,
        error: null,
        statusCode: 200,
      };
    } catch (error) {
      return {
        result: null,
        error: getErrorMessage(error),
        statusCode: ObjectUtils.getIn(error, "response.status", 500),
      };
    }
  };
};

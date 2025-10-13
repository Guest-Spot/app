import { ApolloError } from "@apollo/client/errors";

import { type ApolloServerError } from "src/interfaces/apollo";

const isApolloServerError = (error: unknown): error is ApolloServerError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const extensions =
    "extensions" in error && typeof (error as Record<string, unknown>).extensions === "object"
      ? (error as { extensions: unknown }).extensions
      : null;

  if (!extensions || typeof extensions !== "object" || !("error" in extensions)) {
    return false;
  }

  const nestedError = (extensions as { error?: unknown }).error;

  return Boolean(
    nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as { message: unknown }).message === "string"
  );
};

const extractServerErrorMessage = (error?: ApolloServerError): string | undefined => {
  if (!error) {
    return undefined;
  }

  return error.extensions.error.message || error.message;
};

const getMutationErrorMessage = (err: unknown, fallbackMessage: string): string => {
  if (!err) {
    return fallbackMessage;
  }

  if (isApolloServerError(err)) {
    return extractServerErrorMessage(err) ?? fallbackMessage;
  }

  if (Array.isArray(err)) {
    const serverError = err.find(isApolloServerError);
    return extractServerErrorMessage(serverError) ?? fallbackMessage;
  }

  if (err instanceof ApolloError) {
    const serverError = err.graphQLErrors.find(isApolloServerError);
    if (serverError) {
      return extractServerErrorMessage(serverError) ?? fallbackMessage;
    }

    if (err.networkError?.message) {
      return err.networkError.message;
    }

    return err.message || fallbackMessage;
  }

  if (err instanceof Error) {
    return err.message || fallbackMessage;
  }

  return fallbackMessage;
};

export default getMutationErrorMessage;

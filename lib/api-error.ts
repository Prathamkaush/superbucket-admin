export type ApiErrorDetails = {
  title: string;
  message: string;
  details: string[];
  status?: number;
  reference?: string;
};

const asStrings = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(asStrings).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
};

export function getApiErrorDetails(
  error: any,
  fallback = "Unable to save product",
): ApiErrorDetails {
  const response = error?.response;
  const data = response?.data;
  const status = Number(response?.status) || undefined;

  if (!response) {
    return {
      title: "Cannot reach the server",
      message:
        "The product was not submitted because the API did not respond. Check your connection and confirm the backend is running.",
      details: error?.message ? [String(error.message)] : [],
    };
  }

  const messages = [
    ...asStrings(data?.message),
    ...asStrings(data?.errors),
    ...asStrings(data?.details),
  ];
  const uniqueMessages = Array.from(new Set(messages));
  const genericMessages = new Set([
    "Internal server error",
    "Something went wrong",
    "Bad Request",
  ]);
  const specificMessages = uniqueMessages.filter(
    (message) => !genericMessages.has(message),
  );

  const statusTitles: Record<number, string> = {
    400: "Check the product details",
    401: "Admin session expired",
    403: "Permission denied",
    404: "Required record not found",
    409: "Duplicate product data",
    413: "Uploaded images are too large",
    422: "Product validation failed",
    429: "Too many requests",
    500: "Server could not save the product",
    502: "Backend service unavailable",
    503: "Backend service unavailable",
    504: "Backend request timed out",
  };

  let message =
    specificMessages[0] ||
    (typeof data === "string" && data.trim() && !data.trim().startsWith("<")
      ? data.trim()
      : "");

  if (!message) {
    if (status === 401) {
      message = "Sign in again, then retry the product submission.";
    } else if (status === 403) {
      message = "Your admin account is not allowed to create or edit products.";
    } else if (status === 413) {
      message = "Reduce the image file sizes and submit again.";
    } else if (status && status >= 500) {
      message =
        "The backend returned an unexpected error before the product could be saved.";
    } else {
      message = fallback;
    }
  }

  return {
    title: (status && statusTitles[status]) || "Product submission failed",
    message,
    details: specificMessages.slice(1),
    status,
    reference:
      typeof data?.reference === "string" ? data.reference : undefined,
  };
}


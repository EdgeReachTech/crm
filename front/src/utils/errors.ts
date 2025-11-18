import { ApiError } from "@/lib/api";

export function getErrorMessages(error: any): string[] {
  if (error instanceof ApiError) {
    if (Array.isArray(error.details)) {
      return error.details.map((d) => d.message || JSON.stringify(d));
    }

    return [error.message];
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ['An unknown error occurred'];
}


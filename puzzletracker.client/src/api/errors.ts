import { isAxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback: string): string {
    if (isAxiosError<{ message: string }>(err)) {
        return err.response?.data?.message ?? err.message ?? fallback;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

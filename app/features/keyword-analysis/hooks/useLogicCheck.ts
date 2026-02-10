import { useCallback, useState } from 'react';
import axios from 'axios';
import type { LogicCheckResult } from '@/entities/naver/types';

const DEFAULT_LOGIC_API_BASE_URL = 'http://localhost:5178';
const LOGIC_API_BASE_URL =
  import.meta.env.VITE_LOGIC_API_BASE_URL ?? DEFAULT_LOGIC_API_BASE_URL;
const LOGIC_ENDPOINT = `${LOGIC_API_BASE_URL}/api/check-logic`;
const DEFAULT_ERROR_MESSAGE = '로직 확인 중 오류가 발생했습니다.';

interface UseLogicCheckResult {
  data: LogicCheckResult | null;
  errorMessage: string;
  isLoading: boolean;
  run: (keyword: string) => Promise<void>;
  reset: () => void;
}

export const useLogicCheck = (): UseLogicCheckResult => {
  const [data, setData] = useState<LogicCheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(() => {
    setData(null);
    setErrorMessage('');
    setIsLoading(false);
  }, []);

  const resolveLogicErrorMessage = useCallback((err: unknown): string => {
    if (axios.isAxiosError<{ error?: string }>(err)) {
      return err.response?.data?.error || err.message || DEFAULT_ERROR_MESSAGE;
    }
    if (err instanceof Error) return err.message;
    return DEFAULT_ERROR_MESSAGE;
  }, []);

  const run = useCallback(
    async (keyword: string) => {
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) {
        reset();
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        setData(null);

        const { data: result } = await axios.post<LogicCheckResult>(
          LOGIC_ENDPOINT,
          { keyword: trimmedKeyword }
        );

        setData(result);
      } catch (err) {
        setData(null);
        setErrorMessage(resolveLogicErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [reset, resolveLogicErrorMessage]
  );

  return {
    data,
    errorMessage,
    isLoading,
    run,
    reset,
  };
};

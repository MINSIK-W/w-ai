import { useState } from 'react';
import toast from 'react-hot-toast';

export function useClipboardCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('클립보드에 복사되었습니다!');
      setTimeout(() => setCopied(false), timeout);
    } catch (err: unknown) {
      console.error('Copy failed:', err);

      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류';

      if (import.meta.env.DEV) {
        toast.error(`복사 실패: ${errorMessage}`);
      } else {
        toast.error('복사에 실패했습니다.');
      }
    }
  };

  return { copied, copyToClipboard };
}

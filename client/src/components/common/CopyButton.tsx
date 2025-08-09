import { Check, Copy } from 'lucide-react';
import { useClipboardCopy } from '@/hook/useClipboardCopy.ts';

interface CopyButtonProps {
  content: string;
  copiedText?: string; // 기본: '복사됨'
  defaultText?: string; // 기본: '복사'
  className?: string;
}

export default function CopyButton({
  content,
  copiedText = '복사됨',
  defaultText = '복사',
  className = '',
}: CopyButtonProps) {
  const { copied, copyToClipboard } = useClipboardCopy();

  return (
    <button
      onClick={() => copyToClipboard(content)}
      className={`flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? copiedText : defaultText}
    </button>
  );
}

import type { LucideIcon } from 'lucide-react';
import type { RoutePath } from '@/constants/routes.ts';

// 기본 공통 인터페이스
export type ToolKey =
  | 'writeArticle'
  | 'blogTitles'
  | 'generateImages'
  | 'removeBackground'
  | 'removeObject'
  | 'reviewResums';
export interface BaseItem {
  icon: LucideIcon;
  path: RoutePath;
}

export interface AiTool extends BaseItem {
  title: string;
  description: string;
  bg: {
    from: string;
    to: string;
  };
}

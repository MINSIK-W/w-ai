import type { AiTool, BaseItem, Sidebar, ToolKey } from '@/type/AiTool.ts';
import { Routes } from '@/constants/routes.ts';
import {
  Eraser,
  Hash,
  Image,
  Scissors,
  SquarePen,
  FileText,
  Home,
  Users,
} from 'lucide-react';

const AI_TOOLS_BASE: Record<ToolKey, BaseItem> = {
  writeArticle: { icon: SquarePen, path: Routes.AI_WRITE_ARTICLE },
  blogTitles: { icon: Hash, path: Routes.AI_BLOG_TITLES },
  generateImages: { icon: Image, path: Routes.AI_GENERATE_IMAGES },
  removeBackground: { icon: Eraser, path: Routes.AI_REMOVE_BACKGROUND },
  removeObject: { icon: Scissors, path: Routes.AI_REMOVE_OBJECT },
  reviewResums: { icon: FileText, path: Routes.AI_REVIEW_RESUMS },
};
export const AI_TOOLS_DATA: AiTool[] = [
  {
    title: 'AI 글 작성',
    description:
      '어떤 주제든 손쉽게 완성도 높은 글을 작성할 수 있도록 도와드립니다.',
    bg: { from: '#3588F2', to: '#0bb0d7' },
    ...AI_TOOLS_BASE.writeArticle,
  },
  {
    title: '블로그 제목 추천',
    description: '블로그 글에 딱 맞는 매력적인 제목을 AI가 추천해드립니다.',
    bg: { from: '#b153ea', to: '#e549a3' },
    ...AI_TOOLS_BASE.blogTitles,
  },
  {
    title: 'AI 이미지 생성',
    description: '텍스트를 입력하면 AI가 멋진 이미지를 만들어드립니다.',
    bg: { from: '#29C363', to: '#11B97E' },
    ...AI_TOOLS_BASE.blogTitles,
  },
  {
    title: '배경 지우기',
    description: '사진 속 배경을 손쉽게 제거하고 필요한 부분만 남겨보세요.',
    bg: { from: '#F76C1C', to: '#F04A3C' },
    ...AI_TOOLS_BASE.generateImages,
  },
  {
    title: '사진에서 불필요한 요소 제거',
    description: '사진 속 불필요한 물체를 깔끔하게 지워드립니다.',
    bg: { from: '#5C6AF1', to: '#427DF5' },
    ...AI_TOOLS_BASE.removeBackground,
  },
  {
    title: 'AI 이력서 피드백',
    description: 'AI가 이력서를 분석해 더 돋보이도록 개선점을 제안합니다.',
    bg: { from: '#12B7AC', to: '#08B6CE' },
    ...AI_TOOLS_BASE.removeObject,
  },
];
export const SIDEBAR_DATA: Sidebar[] = [
  { label: '대시보드', icon: Home, path: Routes.AI },
  { label: '글 작성', ...AI_TOOLS_BASE.writeArticle },
  { label: '블로그 제목 추천', ...AI_TOOLS_BASE.blogTitles },
  { label: '이미지 생성', ...AI_TOOLS_BASE.generateImages },
  { label: '배경 제거', ...AI_TOOLS_BASE.removeBackground },
  { label: '요소 제거', ...AI_TOOLS_BASE.removeObject },
  { label: '이력서 피드백', ...AI_TOOLS_BASE.reviewResums },
  { label: '커뮤니티', icon: Users, path: Routes.AI_COMMUNITY },
];

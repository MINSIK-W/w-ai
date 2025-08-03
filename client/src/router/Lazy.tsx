import { lazy } from 'react';
export const LazyHome = lazy(() => import('@/pages/Home.tsx'));
export const LazyLayout = lazy(() => import('@/pages/Layout.tsx'));
export const LazyDashboard = lazy(() => import('@/pages/Dashboard.tsx'));
export const LazyWriteArticle = lazy(() => import('@/pages/WriteArticle.tsx'));
export const LazyBlogTitles = lazy(() => import('@/pages/BlogTitles.tsx'));
export const LazyGenerateImages = lazy(
  () => import('@/pages/GenerateImages.tsx')
);

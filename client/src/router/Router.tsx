import { createBrowserRouter } from 'react-router-dom';
import {
  LazyBlogTitles,
  LazyDashboard,
  LazyGenerateImages,
  LazyHome,
  LazyLayout,
  LazyWriteArticle,
} from './Lazy.tsx';
import { Routes } from '@/constants/routes.ts';

export const Router = createBrowserRouter([
  {
    path: Routes.HOME,
    element: <LazyHome />,
  },
  {
    path: Routes.AI,
    element: <LazyLayout />,
    children: [
      { index: true, element: <LazyDashboard /> },
      { path: Routes.AI_WRITE_ARTICLE, element: <LazyWriteArticle /> },
      { path: Routes.AI_BLOG_TITLES, element: <LazyBlogTitles /> },
      { path: Routes.AI_GENERATE_IMAGES, element: <LazyGenerateImages /> },
    ],
  },
]);

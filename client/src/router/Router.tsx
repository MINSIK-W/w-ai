import { createBrowserRouter } from 'react-router-dom';
import { LazyHome } from './Lazy.tsx';
import { ROUTES } from '@/constants/ROUTES.ts';

export const Router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <LazyHome />,
  },
]);

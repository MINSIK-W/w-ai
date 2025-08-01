export const Routes = {
  HOME: '/',
  AI: '/ai',
  AI_WRITE_ARTICLE: '/ai/article',
  AI_BLOG_TITLES: '/ai/title',
  AI_GENERATE_IMAGES: '/ai/images',
  AI_REMOVE_BACKGROUND: '/ai/background',
  AI_REMOVE_OBJECT: '/ai/object',
  AI_REVIEW_RESUMS: '/ai/resums',
  AI_COMMUNITY: '/ai/community',
} as const;

export type RoutePath = (typeof Routes)[keyof typeof Routes];

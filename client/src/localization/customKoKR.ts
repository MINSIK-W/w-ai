import { koKR } from '@clerk/localizations';

export const customKoKR = {
  ...koKR,
  badge__activePlan: '활성화',
  commerce: {
    ...koKR.commerce,
    subscribe: '구독하기',
    reSubscribe: '재구독',
    month: '월',
    alwaysFree: '항상 무료',
    paymentSource: {
      ...koKR.commerce?.paymentSource,
      dev: {
        ...koKR.commerce?.paymentSource?.dev,
        testCardInfo: '테스트 카드 정보',
        developmentMode: '개발 모드',
        cardNumber: '카드 번호',
        expirationDate: '만료일',
        cvcZip: 'CVC,ZIP',
      },
    },
  },
  userProfile: {
    ...koKR.userProfile,
    navbar: {
      ...koKR.userProfile?.navbar,
      billing: '결제',
    },
    billingPage: {
      ...koKR.userProfile?.billingPage,
      title: '결제',
      subscriptionsListSection: {
        ...koKR.userProfile?.billingPage?.subscriptionsListSection,
        title: '내 플랜',
        actionLabel__switchPlan: '요금제 전환',
      },
      paymentSourcesSection: {
        ...koKR.userProfile?.billingPage?.paymentSourcesSection,
        title: '결제 방법',
        add: '새 결제 방법 추가',
        addSubtitle: '계정에 새 결제 방법을 추가하세요.',
        formButtonPrimary__add: '결제 방법 추가',
      },
    },
  },
};

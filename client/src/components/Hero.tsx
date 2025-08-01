import { useNavigate } from 'react-router-dom';
import user_group from '/images/user_group.png';
import { Routes } from '@/constants/routes.ts';
export default function Hero() {
  const navigate = useNavigate();
  return (
    <div className="bg-[url(/images/gradientBackground.png)] px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-cover bg-no-repeat min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]">
          <span className="text-primary">AI 도구로</span> <br /> 놀라운 콘텐츠를
          만들어보세요
        </h1>
        <p className="mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600">
          고급 AI 도구를 활용해 콘텐츠 제작 수준을 한 단계 높여보세요. 글을
          쓰고, 이미지를 만들고, 작업 효율까지 간편하게 향상시킬 수 있습니다.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs">
        <button
          onClick={() => navigate(Routes.AI)}
          className="bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer"
        >
          지금 바로 시작하기
        </button>
        <button className="bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer">
          데모 살펴보기
        </button>
      </div>
      <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600">
        <img className="h-8" src={user_group} alt="사용자 이미지" />
        이미 1만 명이 넘는 사용자들이 믿고 사용하고 있습니다.
      </div>
    </div>
  );
}

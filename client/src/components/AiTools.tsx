import { useClerk, useUser } from '@clerk/clerk-react';
import { AI_TOOLS_DATA } from '@/constants/aiToolsData.ts';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import * as React from 'react';

export default function AiTools() {
  const { user } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { openSignIn } = useClerk();
  const handleUnauthenticatedClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowLoginModal(true);
  };
  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          AI로 더 쉽고 똑똑하게
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          최신 AI 기술로 글쓰기부터 이미지 제작까지, 콘텐츠 제작에 필요한 모든
          것을 한곳에서 해결하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center max-w-5xl mx-auto mt-10">
        {AI_TOOLS_DATA.map(tool => {
          if (user) {
            return (
              <Link
                key={tool.path}
                className="p-8  max-w-xs rounded-lg bg-[#fdfdfe] shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                to={tool.path}
              >
                <tool.icon
                  className="w-12 h-12 p-3 text-white rounded-xl"
                  style={{
                    background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`,
                  }}
                />
                <h3 className="mt-6 mb-3 text-lg font-semibold">
                  {tool.title}
                </h3>
                <p className="text-gray-400 text-sm max-w-[95%]">
                  {tool.description}
                </p>
              </Link>
            );
          } else {
            return (
              <div
                key={tool.path}
                className="p-8 max-w-xs rounded-lg bg-[#fdfdfe] shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative group"
                onClick={e => handleUnauthenticatedClick(e)}
              >
                <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lock className="w-4 h-4" />
                    로그인 필요
                  </div>
                </div>

                <tool.icon
                  className="w-12 h-12 p-3 text-white rounded-xl opacity-75"
                  style={{
                    background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`,
                  }}
                />
                <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-600">
                  {tool.title}
                </h3>
                <p className="text-gray-400 text-sm max-w-[95%]">
                  {tool.description}
                </p>
              </div>
            );
          }
        })}
      </div>
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                로그인이 필요합니다
              </h3>
              <p className="text-gray-600 mb-6">
                AI 도구를 사용하려면 먼저 로그인해주세요.
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setShowLoginModal(false)}
                >
                  취소
                </button>
                <button
                  onClick={() => openSignIn()}
                  className="flex-1 cursor-pointer px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-center "
                >
                  로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

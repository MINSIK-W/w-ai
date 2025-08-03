import { useState } from 'react';
import * as React from 'react';
import { Hash, Image, Sparkles } from 'lucide-react';

export default function GenerateImages() {
  const imageStyle = [
    '현대적',
    '지브리',
    '애니메이션',
    '작화',
    '판타지',
    '미래적',
    '3D',
    '초상화',
  ];
  const [selectedStyle, setSelectedStyle] = useState('현대적');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/*왼쪽 col*/}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00ad25]" />
          <h1 className="text-xl font-semibold">이미지 만들기</h1>
        </div>
        <p className="mt-6 text-sm font-medium">
          상상하는 모든 것을 작성하여 이미지를 만들어 보세요.
        </p>
        <textarea
          onChange={e => setInput(e.target.value)}
          rows={4}
          value={input}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="설산에서 떠오르는 일출"
          required
        />
        <p className="mt-4 text-sm font-medium">이미지 스타일</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/12">
          {imageStyle.map(item => (
            <span
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedStyle === item ? 'bg-green-50 text-green-700' : 'text-gray-500 border-gray-300'}`}
              onClick={() => setSelectedStyle(item)}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={e => setPublish(e.target.checked)}
              checked={publish}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm">이미지 공개 여부</p>
        </div>
        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00ad25] to-[#04ff50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
          <Image className="w-5" />
          이미지 만들기
        </button>
      </form>
      {/*오른쪽 col*/}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-[#00ad25]" />
          <h1 className="text-xl font-semibold">만들어진 이미지</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <Image className="w-9 h-9" />
            <p>주제를 입력하고 '이미지 만들기'을 클릭해 시작하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

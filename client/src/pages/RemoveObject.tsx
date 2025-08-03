import { useState } from 'react';
import * as React from 'react';
import { Scissors, Sparkles } from 'lucide-react';

export default function RemoveObject() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [object, setObject] = useState('');

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
          <Sparkles className="w-6 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">요소 지우기</h1>
        </div>
        <p className="mt-6 text-sm font-medium">이미지 업로드</p>
        <input
          onChange={e => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
            }
          }}
          accept={'image/*'}
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />
        <p className="mt-6 text-sm font-medium">
          제거할 요소의 이름을 입력하세요.
        </p>
        <textarea
          onChange={e => setObject(e.target.value)}
          rows={4}
          value={object}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="'시계' 또는 '나무'처럼 단 하나의 사물 이름만 입력하세요."
          required
        />
        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#471df6] to-[#4a7aff] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
          <Scissors className="w-5" />
          요소 지우기
        </button>
      </form>
      {/*오른쪽 col*/}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-[#ff4938]" />
          <h1 className="text-xl font-semibold">요소가 제거된 이미지</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <Scissors className="w-9 h-9" />
            <p className="text-center">
              파일 선택하여 파일을 업로드 후 제거할 요소 이름을 입력한 후 '요소
              지우기'을 클릭해 시작 하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

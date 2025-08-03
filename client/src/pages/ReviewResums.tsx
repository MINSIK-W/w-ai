import { FileText, Sparkles } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

export default function ReviewResums() {
  const [file, setFile] = useState<File | undefined>(undefined);

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
          <Sparkles className="w-6 text-[#00Da83]" />
          <h1 className="text-xl font-semibold">이력서 피드백</h1>
        </div>
        <p className="mt-6 text-sm font-medium">이력서 업로드</p>
        <input
          onChange={e => {
            if (!e.target.files || e.target.files.length === 0) return;
            setFile(e.target.files[0]);
          }}
          accept={'application/pdf'}
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />
        <p className="text-xs text-gray-500 font-light mt-1">
          지원 파일 형식: PDF
        </p>
        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00da83] to-[#009bb3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
          <FileText className="w-5" />
          피드백 받기
        </button>
      </form>
      {/*오른쪽 col*/}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3 max-h-[600px]">
          <FileText className="w-5 h-5 text-[#00Da83]" />
          <h1 className="text-xl font-semibold">생성된 블로그 제목</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <FileText className="w-9 h-9" />
            <p>
              파일 선택하여 파일을 업로드하고 '지우기'을 클릭해 시작 하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

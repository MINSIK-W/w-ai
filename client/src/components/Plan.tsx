import { PricingTable } from '@clerk/clerk-react';

export default function Plan() {
  return (
    <div className="max-w-2xl mx-auto z-20 my-32">
      <div className="text-center">
        <h2 className="text-slate-700 text-[40px] font-semibold">
          나에게 맞는 요금제를 선택해보세요.
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          무료로 시작해보세요. 상황에 따라 업그레이드할 수 있고, 콘텐츠 제작에
          꼭 맞는 요금제를 선택할 수 있습니다.
        </p>
      </div>
      <div className="mt-14 max-sm:mx-8">
        <PricingTable />
      </div>
    </div>
  );
}

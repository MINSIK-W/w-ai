import { useEffect, useState } from 'react';
import { Gem, Sparkles } from 'lucide-react';
import { Protect } from '@clerk/clerk-react';
import CreationItem from '@/components/CreationItem.tsx';
import { type CreationItemData, dummyCreationData } from '@/data/dummy.ts';

export default function Dashboard() {
  const [creations, setCreations] = useState<CreationItemData[]>([]);
  const getDashboardData = async () => {
    setCreations(dummyCreationData);
  };
  useEffect(() => {
    (async () => {
      await getDashboardData();
    })();
  }, []);
  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/*총 만든 갯수*/}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl order border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">총 생성 갯수</p>
            <h2 className="text-xl font-semibold">{creations.length}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588f2] to-[#0bb0d7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>
        {/* 사용자 요금제 정보 */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl order border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">사용 중인 요금제</p>
            <h2 className="text-xl font-semibold">
              <Protect plan="premium" fallback="무료">
                프리미엄
              </Protect>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff61c5] to-[#9e53ee] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <p className="mt-6 mb-4">최근 작업물</p>
        {creations.map(item => (
          <CreationItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

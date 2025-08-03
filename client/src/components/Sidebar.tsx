import { Protect, useClerk, useUser } from '@clerk/clerk-react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { SIDEBAR_DATA } from '@/constants/aiToolsData.ts';

interface Props {
  sidebar: boolean;
  setSidebar: (value: boolean) => void;
}

export default function Sidebar({ sidebar, setSidebar }: Props) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute  top-14 bottom-0 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}
    >
      <div className="my-7 w-full">
        <img
          src={user?.imageUrl}
          alt="프로필 이미지"
          className="w-13 rounded-full mx-auto"
        />
        <h1 className="mt-1 text-center">{user?.fullName}</h1>
        <div className="px-6 mt-5 text-sm text-gray-600 font-medium">
          {SIDEBAR_DATA.map(nav => (
            <NavLink
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded ${isActive ? 'bg-gradient-to-r from-[#3c81f6] to-[#9234ea] text-white' : ''}`
              }
              to={nav.path}
              end
              key={nav.label}
              onClick={() => setSidebar(false)}
            >
              <nav.icon />
              <span>{nav.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div
          onClick={() => openUserProfile()}
          className="flex gap-2 items-center cursor-pointer"
        >
          <img
            src={user?.imageUrl}
            alt="프로필 이미지"
            className="w-8 rounded-full"
          />
          <div>
            <h1 className="text-sm font-medium">{user?.fullName}</h1>
            <p className="text-xs text-gray-500">
              <Protect plan="premium" fallback="무료">
                프리미엄
              </Protect>
            </p>
          </div>
        </div>
        <LogOut
          onClick={() => signOut()}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
}

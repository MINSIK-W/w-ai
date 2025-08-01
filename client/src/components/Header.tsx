import logo from '/images/logo.png';
import { useNavigate } from 'react-router-dom';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { ArrowRight } from 'lucide-react';
import { type RoutePath, Routes } from '@/constants/routes.ts';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const goTo = (path: RoutePath) => navigate(path);

  return (
    <header className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
      <img
        src={logo}
        alt="logo"
        className={'w-32 sm:w-32 cursor-pointer'}
        onClick={() => goTo(Routes.HOME)}
      />
      {user ? (
        <UserButton />
      ) : (
        <button
          onClick={() => openSignIn()}
          className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5 active:scale-95 hover:scale-102 transition"
        >
          시작하기 <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </header>
  );
}

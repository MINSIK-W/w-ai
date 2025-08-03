import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <section className="flex justify-center items-center w-full min-h-14 h-[100vh]">
      <div className="flex flex-col items-center ">
        <h1 className="font-black text-6xl my-5">Page not found</h1>
        <p className="text-3xl my-4">
          요청하신 페이지는 더 이상 제공되지 않습니다.
        </p>
        <button
          className="text-primary cursor-pointer underline"
          onClick={() => navigate(-1)}
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    </section>
  );
}

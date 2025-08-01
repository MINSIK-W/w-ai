import logo from '/images/logo.png';
export default function Footer() {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-gray-500 mt-20">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-6">
        <div className="md:max-w-96">
          <img className="h-9" src={logo} alt="logo" />
          <p className="mt-6 text-sm">
            W-AI와 함께 AI의 놀라운 가능성을 경험해보세요. <br /> 프리미엄 AI
            도구로 글을 쓰고, 이미지를 만들고, 작업 효율까지 높여보세요. 콘텐츠
            제작의 새로운 방식을 만나볼 시간입니다.
          </p>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20">
          <div>
            <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About us</a>
              </li>
              <li>
                <a href="#">Contact us</a>
              </li>
              <li>
                <a href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 mb-5">
              뉴스레터를 구독해보세요
            </h2>
            <div className="text-sm space-y-2">
              <p>
                최신 뉴스와 글, 다양한 자료들을 매주 이메일로 받아보실 수
                있습니다.
              </p>
              <div className="flex items-center gap-2 pt-4">
                <input
                  className="border border-gray-500/30 placeholder-gray-500 focus:ring-2 ring-primary outline-none w-full max-w-64 h-9 rounded px-2"
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                />
                <button className="bg-primary w-24 h-9 text-white rounded">
                  구독하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-xs md:text-sm pb-5">
        Copyright 2025 ©{' '}
        <a
          className="text-primary underline"
          href="https://minsik-w.github.io/"
        >
          Wang Min Sik
        </a>
        . All Right Reserved.
      </p>
    </footer>
  );
}

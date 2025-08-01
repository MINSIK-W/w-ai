import { Star } from 'lucide-react';
import { dummyTestimonialData } from '@/data/dummy.ts';

const Testimonial = () => {
  return (
    <div className="px-4 sm:px-20 xl:px-32 py-24">
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          W-AI를 추천하는 이유
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          실제 사용자들의 솔직한 후기를 만나보세요.
        </p>
      </div>
      <div className="flex flex-wrap mt-10 justify-center ">
        {dummyTestimonialData.map((testimonial, index) => (
          <div
            key={index}
            className="p-8 m-4 max-w-xs rounded-lg bg-[#FDFDFE] shadow-lg border border-gray-100 hover:-translate-y-1 transition duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-1 relative">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4  ${
                    index < testimonial.rating
                      ? 'fill-primary text-primary'
                      : 'fill-gray-300 text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-500 text-sm break-keep my-5">
              "{testimonial.content}"
            </p>
            <hr className="mb-5 border-gray-300" />
            <div className="flex items-center gap-4">
              <img
                src={testimonial.image}
                className="w-12 h-12 object-contain rounded-full"
                alt=""
              />
              <div className="text-sm text-gray-600">
                <h3 className="font-medium">{testimonial.name}</h3>
                <p className="text-xs text-gray-500">{testimonial.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;

import Header from '@/components/Header.tsx';
import Hero from '@/components/Hero.tsx';
import AiTools from '@/components/AiTools.tsx';
import Testimonial from '@/components/Testimonial.tsx';
import Plan from '@/components/Plan.tsx';
import Footer from '@/components/Footer.tsx';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <AiTools />
      <Testimonial />
      <Plan />
      <Footer />
    </>
  );
}

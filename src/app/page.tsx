import Header from '../components/Header';
import { Testimonials } from '@/components/Testimonials';
import { FAQs } from '@/components/FAQs';
import { Footer } from '@/components/Footer';
import Background from './Background';
export default function Home() {
  return (
    <>

      <main>
        <Header />
        <Background />

        {/* <div className="lg:px-8">
          <Testimonials />
        </div> */}
        <FAQs />
        {/* <div className="flex justify-center flex-col p-5">
          <h2 className=" text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center m-4">Locate Us.</h2>
          <div className="flex justify-center md:h-80 h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d435.3216076332275!2d79.4932994!3d29.2066999!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a09b1ede17394d%3A0x823b92fb077c3fb6!2sSHARDA%20ENT%20HOSPITAL%20AND%20DIAGNOSTIC%20CENTER!5e0!3m2!1sen!2sin!4v1719919363709!5m2!1sen!2sin"
              style={{ border: '0' }}
              loading="lazy"
              height="100%"
              width="100%"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div> */}
        <Footer />
      </main>
    </>
  );
}

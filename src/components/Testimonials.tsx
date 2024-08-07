import clsx from 'clsx';
import Image from "next/image";

const featuredTestimonial = {
  body: `Thanks to LoveConnect, I found my soulmate! The matching algorithm is spot-on, and the user experience is fantastic. Within weeks, I met someone special, and we've been happily together for over a year now.`,
  author: {
    name: 'Sarah Johnson',
    handle: 'SarahJ',
    imageUrl: '/images/testimonials/sarah.jpg',
  },
};

const testimonials: {
  body: string;
  author: {
    name: string;
    handle: string;
    imageUrl: string;
  };
}[][][] = [
  [
    [
      {
        body: 'I was skeptical about online dating, but LoveConnect changed my mind. The quality of matches was impressive!',
        author: {
          name: 'Michael Chen',
          handle: 'MikeC',
          imageUrl: '',
        },
      },
      {
        body: 'The video chat feature made getting to know my matches so much easier and more comfortable.',
        author: {
          name: 'Emily Rodriguez',
          handle: 'EmilyR',
          imageUrl: '',
        },
      },
    ],
    [
      {
        body: `I appreciate the focus on safety and privacy. It made me feel secure while exploring connections. I've made great friends and even found a potential partner!`,
        author: {
          name: 'Alex Thompson',
          handle: 'AlexT',
          imageUrl: '',
        },
      },
    ],
  ],
  [
    [
      {
        body: `The personality test really helped me find compatible matches. It's not just about looks here.`,
        author: {
          name: 'Priya Patel',
          handle: 'PriyaP',
          imageUrl: '',
        },
      },
      {
        body: `I love the dating tips and relationship advice section. It's helped me navigate the dating scene with confidence.`,
        author: {
          name: 'Chris Walker',
          handle: 'ChrisW',
          imageUrl: '',
        },
      },
    ],
    [
      {
        body: `The events feature is amazing! I've attended several mixers and made genuine connections. It's a great way to meet people in a relaxed setting.`,
        author: {
          name: 'Olivia Lee',
          handle: 'OliviaL',
          imageUrl: '',
        },
      },
      {
        body: `As an LGBTQ+ individual, I felt truly welcome on this platform. The inclusive environment made all the difference in my dating journey.`,
        author: {
          name: 'Jamie Rivera',
          handle: 'JamieR',
          imageUrl: '',
        },
      },
    ],
  ],
];

export function Testimonials() {
  return (
    <div className="relative isolate bg-white pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600">Hamy</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Hear From Our Partners
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
          <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1">
            <blockquote className="p-6 text-lg font-semibold leading-7 tracking-tight text-gray-900 sm:p-12 sm:text-xl sm:leading-8">
              <p>{`“${featuredTestimonial.body}”`}</p>
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
              <Image
                className="h-10 w-10 flex-none rounded-full bg-gray-50"
                src={featuredTestimonial.author.imageUrl}
                alt=""
                width={40}
                height={40}
                style={{
                  maxWidth: "100%",
                  height: "auto"
                }} />
              <div className="flex-auto">
                <div className="font-semibold">{featuredTestimonial.author.name}</div>
                <div className="text-gray-600">{`@${featuredTestimonial.author.handle}`}</div>
              </div>
              {/* <Image
                className="h-8 w-auto flex-none"
                src={featuredTestimonial.author.logoUrl}
                alt=""
                height={32}
                width={98}
                unoptimized
              /> */}
            </figcaption>
          </figure>
          {testimonials.map((columnGroup, columnGroupIdx) => (
            <div key={columnGroupIdx} className="space-y-8 xl:contents xl:space-y-0">
              {columnGroup.map((column, columnIdx) => (
                <div
                  key={columnIdx}
                  className={clsx(
                    (columnGroupIdx === 0 && columnIdx === 0) ||
                      (columnGroupIdx === testimonials.length - 1 && columnIdx === columnGroup.length - 1)
                      ? 'xl:row-span-2'
                      : 'xl:row-start-1',
                    'space-y-8'
                  )}
                >
                  {column.map((testimonial) => (
                    <figure
                      key={testimonial.author.handle}
                      className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
                    >
                      <blockquote className="text-gray-900">
                        <p>{`“${testimonial.body}”`}</p>
                      </blockquote>
                      <figcaption className="mt-6 flex items-center gap-x-4">
                        <Image
                          className="h-10 w-10 rounded-full bg-gray-50"
                          src={testimonial.author.imageUrl}
                          alt=""
                          width={40}
                          height={40}
                          style={{
                            maxWidth: "100%",
                            height: "auto"
                          }} />
                        <div>
                          <div className="font-semibold">{testimonial.author.name}</div>
                          {testimonial.author.handle ? (
                            <div className="text-gray-600">@{testimonial.author.handle}</div>
                          ) : undefined}
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: 'How do you protect my privacy?',
    answer:
      'We take your privacy seriously. Your personal information is securely stored and never shared without your consent. We use encryption and follow strict data protection protocols to ensure your dating experience remains confidential.',
  },
  {
    question: 'How do I create a profile?',
    answer: (
      <>
        Creating a profile is easy! Just visit our{' '}
        <a href="/signup" target="_blank" className="font-semibold hover:underline">
          sign-up page
        </a>
        . You ll be guided through steps to set up your profile, including uploading photos and describing your
        interests.
      </>
    ),
  },
  {
    question: 'What features does your dating site offer?',
    answer:
      'We offer a range of features to enhance your dating experience, including advanced matching algorithms, instant messaging, video chat, virtual date ideas, and personality compatibility tests.',
  },
  {
    question: 'Is your dating site free to use?',
    answer:
      'We offer both free and premium memberships. Free members can create profiles, browse, and send limited messages. Premium members enjoy additional features like unlimited messaging, seeing who liked your profile, and advanced search filters.',
  },
  {
    question: 'How does your matching system work?',
    answer:
      'Our sophisticated algorithm considers factors like your preferences, interests, location, and behavior on the site to suggest compatible matches. We continuously refine our system to improve match quality.',
  },
  {
    question: 'How can I contact customer support?',
    answer: (
      <>
        Our support team is available 24/7. You can reach us via email at{' '}
        <a href="mailto:support@datingsite.com" target="_blank" className="font-semibold underline">
          support@datingsite.com
        </a>
        , or through the Help section in your account dashboard.
      </>
    ),
  },
  {
    question: 'How can I stay safe while online dating?',
    answer:
      'We prioritize your safety. Always meet in public places for first dates, tell a friend about your plans, and use our in-app video chat feature to get to know someone before meeting in person. Report any suspicious behavior to our moderation team immediately.',
  },
];

export function FAQs() {
  return (
    <div
      className="mx-auto max-w-2xl divide-y divide-gray-900/10 px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:pb-32"
      id="faq"
    >
      <h2 className="font-cal text-2xl leading-10 text-gray-900">Frequently asked questions</h2>
      <dl className="mt-10 space-y-8 divide-y divide-gray-900/10">
        {faqs.map((faq) => (
          <div key={faq.question} className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">{faq.question}</dt>
            <dd className="mt-4 lg:col-span-7 lg:mt-0">
              <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

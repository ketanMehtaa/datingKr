import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { CSPostHogProvider } from './providers';
import { cn } from '@/lib/utils';
import { GoogleAnalytics } from '@next/third-parties/google';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

// export const metadata = {
//   metadataBase:new URL('https://shardaenthospital.com'),
//   title: 'Sharda ENT Hospital - Haldwani',
//   description:
//     'Sharda ENT Hospital - Best ENT care in Haldwani for Ear, Nose, and Throat. Providing comprehensive diagnosis, treatment, and rehabilitation services for ENT conditions.',
//   openGraph: {
//     title: "Sharda ENT Hospital - Haldwani's Best ENT Care",
//     description:
//       'Sharda ENT Hospital in Haldwani - Comprehensive Care for Ear, Nose, and Throat, including expert consultations, surgical procedures, and follow-up care.',
//     images: ['/1.jpeg'], // Correct path for static files
//     url: 'https://shardaenthospital.com', // Replace with your site URL
//     siteName: 'Sharda ENT Hospital',
//     type: 'website',
//     locale: 'en_US',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: "Sharda ENT Hospital - Haldwani's Best ENT Care",
//     description:
//       'Sharda ENT Hospital in Haldwani - Comprehensive Care for Ear, Nose, and Throat, including expert consultations and treatment.',
//     site: '@ShardaENT', // Replace with your Twitter handle
//     image: '/1.jpeg', // Correct path for static files
//     creator: '@ShardaENT', // Replace with your Twitter handle
//   },
//   icons: {
//     icon: [{ url: '/1.svg', type: 'image/svg+xml' }], // Correct path for static files
//   },
//   robots: {
//     index: true,
//     follow: true,
//     'max-image-preview': 'large',
//     'max-snippet': '-1',
//     'max-video-preview': '-1',
//   },
//   additionalMetaTags: [
//     {
//       name: 'keywords',
//       content:
//         'ENT hospital, Haldwani ENT care, ear nose throat specialist, best ENT doctor, ENT treatment Haldwani, Sharda Hospital',
//     },
//     { name: 'author', content: 'Sharda ENT Hospital' },
//     { name: 'viewport', content: 'width=device-width, initial-scale=1' },
//   ],
//   structuredData: {
//     '@context': 'https://schema.org',
//     '@type': 'Hospital',
//     name: 'Sharda ENT Hospital',
//     url: 'https://shardaenthospital.com',
//     logo: '/1.svg',
//     description:
//       'Sharda ENT Hospital provides expert care for ear, nose, and throat conditions in Haldwani, including consultations, treatments, and surgical procedures.',
//     address: {
//       '@type': 'PostalAddress',
//       streetAddress: 'Near chetriya grahmin bank', // Replace with your address
//       addressLocality: 'Gas Godam Rd, Charyal Nayawad',
//       addressRegion: 'Uttarakhand',
//       postalCode: '263139', // Replace with your postal code
//       addressCountry: 'India',
//     },
//     contactPoint: {
//       '@type': 'ContactPoint',
//       contactType: 'Customer Service',
//       telephone: '+91-9548040347', // Replace with your contact number
//     },
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar">
      <CSPostHogProvider>
        <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
          {children}
        </body>
      </CSPostHogProvider>
    </html>
  );
}

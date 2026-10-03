// Logic: Root HTML layout providing EFT Precision Dark Theme shell, header, and footer.
// Input: Child React nodes.
// Output: Hydrated HTML document tree.

import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.eft.io.vn'),
  title: {
    default: 'Eternal Flame Tech Blog | AI & Robotics THPT Chuyên Nguyễn Thị Minh Khai',
    template: '%s | Eternal Flame Tech',
  },
  description:
    'Nền tảng bài viết, chia sẻ kiến thức Trí Tuệ Nhân Tạo & Robotics từ Câu lạc bộ Eternal Flame Tech - THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ.',
  keywords: [
    'Eternal Flame Tech',
    'EFT Blog',
    'AI Club',
    'Robotics',
    'THPT Chuyên Nguyễn Thị Minh Khai',
    'Cần Thơ',
    'Trí tuệ nhân tạo',
    'Tin học trẻ',
  ],
  authors: [{ name: 'Eternal Flame Tech' }],
  creator: 'Eternal Flame Tech',
  publisher: 'Eternal Flame Tech',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://blog.eft.io.vn',
    siteName: 'Eternal Flame Tech Blog',
    title: 'Eternal Flame Tech Blog | AI & Robotics Club',
    description:
      'Nền tảng chia sẻ học thuật và nghiên cứu AI & Robotics của CLB Eternal Flame Tech.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Eternal Flame Tech Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eternal Flame Tech Blog',
    description:
      'CLB Trí Tuệ Nhân Tạo & Robotics - THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-violet-600/30 selection:text-violet-200">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

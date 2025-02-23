import localFont from 'next/font/local';
import './globals.css';
import AOSInit from '@/utils/AOSInit';
import 'aos/dist/aos.css';

export const metadata = {
  title: 'Productivity Extension',
  description: 'Stay focused and boost your productivity',
}

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.ttf",
  variable: "--font-satoshi"
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${satoshi.variable}`}>
      <AOSInit />
      <body>{children}</body>
    </html>
  )
}
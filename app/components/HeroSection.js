import Image from 'next/image';

import logo from '../assets/logo.png';

export default function HeroSection() {
    return (
      <div className="relative bg-yellow-50" data-aos="zoom-in">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center -ml-16">
                <Image src={logo} alt="Concentro Logo" width={100} height={100} className="mr-4" />
                <h1 className="text-4xl font-bold tracking-tight text-yellow-800 sm:text-6xl">
                    Concentro
                </h1>
            </div>
            <p className="mt-6 text-lg leading-8 text-yellow-600">
              Stay focused, track your time, and boost your productivity with our all-in-one browser extension.
            </p>
          </div>
        </div>
      </div>
    );
  }
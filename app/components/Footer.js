export default function Footer() {
  return (
    <footer className="bg-yellow-800 text-white py-6">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Concentro. All rights reserved.
        </p>
        <p className="text-sm font-semibold">
          Made with ❤️ at FossHack 2025
        </p>
        
      </div>
    </footer>
  );
} 
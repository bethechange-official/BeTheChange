import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-serif text-[#111111] mb-4">404</h1>
      <p className="text-lg text-[#8A8580] mb-8">The page you are looking for does not exist.</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-[#111111] text-white text-xs tracking-widest uppercase font-medium hover:bg-[#2A2A2A] transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}

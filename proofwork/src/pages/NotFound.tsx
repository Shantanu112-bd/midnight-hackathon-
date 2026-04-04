import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex flex-col text-white font-sans">
      <NavigationBar activeItem="landing" />
      <div className="flex-1 flex flex-col items-center justify-center text-center mt-12">
        <div className="text-[8rem] font-bold text-white/5 leading-none mb-0">404</div>
        <SearchX className="w-16 h-16 text-white/20 -mt-8 mb-8 mx-auto block" />
        <h1 className="text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-white/50 mb-12 font-mono text-sm">
          This proof doesn't exist on the Midnight chain.
        </p>
        <Link to="/">
          <button className="bg-blueAccent text-navy font-bold px-10 py-4 rounded-full hover:shadow-[0_0_30px_rgba(122,160,255,0.3)] transition-all">
            Return to ProofWork
          </button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}

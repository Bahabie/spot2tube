import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden mt-auto border-t border-white/[0.02] bg-[#0A0A0B]">
      {/* Ambient Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-purple-500/10 via-indigo-500/5 to-transparent pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Support CTA Section */}
        <div className="flex flex-col items-center text-center mb-24">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F3F4F6] font-['Cabinet_Grotesk',sans-serif] tracking-tighter mb-4">
            Always happy to help you
          </h2>
          <p className="text-zinc-400 text-lg mb-10 font-['Satoshi',sans-serif]">
            Feel free to ask any questions
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/faq" className="w-full sm:w-48 py-4 rounded-full bg-white/[0.03] backdrop-blur-2xl ring-1 ring-inset ring-white/10 hover:bg-white/[0.08] hover:ring-white/20 transition-all font-medium text-white font-['Satoshi',sans-serif] inline-flex justify-center items-center">
              FAQ
            </Link>
            <a href="mailto:alibahabys@gmail.com" className="w-full sm:w-48 py-4 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-2xl ring-1 ring-inset ring-purple-500/30 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all font-medium text-white font-['Satoshi',sans-serif] shadow-[0_0_30px_rgba(168,85,247,0.1)] inline-flex justify-center items-center">
              Contact us
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24 mb-16 font-['Satoshi',sans-serif]">
          {/* Column 1 */}
          <div>
            <h3 className="font-bold text-white mb-6">Spot2Tube Sync</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link href="/login" className="text-zinc-500 hover:text-white transition-colors text-sm">Login</Link></li>
              <li><Link href="/plans" className="text-zinc-500 hover:text-white transition-colors text-sm">Plans</Link></li>
            </ul>
          </div>
          
          {/* Column 2 */}
          <div>
            <h3 className="font-bold text-white mb-6">Help</h3>
            <ul className="space-y-4">
              <li><Link href="/faq" className="text-zinc-500 hover:text-white transition-colors text-sm">FAQ</Link></li>
              <li><a href="mailto:alibahabys@gmail.com" className="text-zinc-500 hover:text-white transition-colors text-sm">Contact us</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-bold text-white mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-zinc-500 hover:text-white transition-colors text-sm">Terms of use</Link></li>
              <li><Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors text-sm">Privacy policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 font-['Satoshi',sans-serif]">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </Link>
            <Link href="https://github.com/Bahabie" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </Link>
          </div>
          
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Spot2Tube Sync
          </p>
        </div>
      </div>
    </footer>
  );
}

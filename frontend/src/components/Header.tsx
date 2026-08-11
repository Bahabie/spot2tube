import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/UserMenu";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

export async function Header() {
  const session = await auth();
  
  return (
    <header className="sticky top-0 z-50 w-full flex items-center justify-between px-6 py-5 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/[0.02]">
      {/* Left Side: Brand Logo */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="p-2 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-[0_0_15px_rgba(29,185,84,0.3)]">
          <RefreshCw className="w-5 h-5 text-white" />
        </div>
        <h1 
          className="text-xl font-bold tracking-tight flex items-center" 
          style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
        >
          <span className="text-[#F3F4F6]">Spot2Tube</span>
          <span className="text-[#1DB954]">Sync</span>
        </h1>
      </Link>
      
      {/* Right Side: Nav Links + User Profile */}
      <div className="flex items-center space-x-8">
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/plans" 
            className="text-sm font-medium text-zinc-400 hover:text-[#F3F4F6] transition-colors"
            style={{ fontFamily: '"Satoshi", sans-serif' }}
          >
            Plans
          </Link>
          <Link 
            href="/help" 
            className="text-sm font-medium text-zinc-400 hover:text-[#F3F4F6] transition-colors"
            style={{ fontFamily: '"Satoshi", sans-serif' }}
          >
            Help
          </Link>
        </nav>

        {session?.user ? (
          <UserMenu
            name={session.user.name || session.user.email || "User"}
            image={session.user.image ?? null}
          />
        ) : (
          <div className="w-[36px] h-[36px]"></div>
        )}
      </div>
    </header>
  );
}

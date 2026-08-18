export default function PrivacyPolicyPage() {
  const lastUpdated = "August 18, 2026";

  return (
    <div className="min-h-screen pb-32">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Subtle ambient glow */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        {/* Eyebrow badge */}
        <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] ring-1 ring-white/10 text-xs font-medium text-zinc-400 font-['Satoshi',sans-serif]">
          Legal Information
        </div>

        <h1
          className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gray-100 max-w-3xl"
          style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
        >
          Privacy&nbsp;
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Policy
          </span>
        </h1>

        <p className="mt-5 text-zinc-400 text-lg max-w-xl leading-relaxed font-['Satoshi',sans-serif]">
          How we collect, use, and protect your data. Last updated: {lastUpdated}.
        </p>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-white/[0.02] backdrop-blur-2xl ring-1 ring-white/10 rounded-3xl p-8 md:p-12 text-zinc-300 font-['Satoshi',sans-serif] space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              At Spot2Tube-sync, we take your privacy seriously. This Privacy Policy explains what information we collect when you use our service, how we use it, and how we protect it. We are committed to the principle of data minimization—we only collect what is strictly necessary to provide our Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              2. Information We Collect
            </h2>
            <p className="leading-relaxed mb-4">
              When you use Spot2Tube-sync, we may collect the following types of information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-4">
              <li><strong className="text-gray-200">Account Information:</strong> Your basic profile information (email address, display name) provided by Spotify and Google when you log in via OAuth.</li>
              <li><strong className="text-gray-200">Authentication Tokens:</strong> Secure OAuth access and refresh tokens used to interact with third-party APIs on your behalf.</li>
              <li><strong className="text-gray-200">Music Metadata:</strong> Playlist names, track titles, artist names, and album data retrieved temporarily during the syncing process.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              3. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              The information we collect is used solely to provide and improve the Service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-4">
              <li>To authenticate you and maintain your active session.</li>
              <li>To read your source playlists and create matching playlists on your destination platform.</li>
              <li>To process background synchronization tasks if you enable auto-sync (Premium users).</li>
              <li>To provide customer support and respond to your inquiries.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              4. Data Sharing and Disclosure
            </h2>
            <p className="leading-relaxed">
              We do <strong>not</strong> sell, rent, or share your personal data with third parties for marketing purposes. Your data is only shared with essential service providers necessary to operate Spot2Tube-sync (such as Supabase for database hosting and secure token encryption, and third-party APIs like Spotify and YouTube to perform the actual transfers).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              5. Data Security and Retention
            </h2>
            <p className="leading-relaxed mb-4">
              We implement robust security measures to protect your data. All OAuth tokens are encrypted at rest using Supabase&apos;s secure infrastructure. 
            </p>
            <p className="leading-relaxed">
              We retain your account information and encrypted tokens only as long as you maintain an active account with us. If you delete your account, all associated tokens and personal data are permanently removed from our databases.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              6. Your Rights
            </h2>
            <p className="leading-relaxed">
              You have the right to access, correct, or delete your personal information at any time. You can instantly revoke Spot2Tube-sync&apos;s access to your Spotify or Google accounts by visiting the respective third-party security settings pages. You may also permanently delete your Spot2Tube-sync account directly from your user dashboard.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              7. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer at <a href="mailto:privacy@spot2tube.com" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">privacy@spot2tube.com</a>.
            </p>
          </div>
          
        </div>
      </section>
    </div>
  );
}

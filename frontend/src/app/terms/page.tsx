export default function TermsOfUsePage() {
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/10 blur-[120px] rounded-full" />
        </div>

        {/* Eyebrow badge */}
        <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] ring-1 ring-white/10 text-xs font-medium text-zinc-400 font-['Satoshi',sans-serif]">
          Legal Information
        </div>

        <h1
          className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gray-100 max-w-3xl"
          style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
        >
          Terms of&nbsp;
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Use
          </span>
        </h1>

        <p className="mt-5 text-zinc-400 text-lg max-w-xl leading-relaxed font-['Satoshi',sans-serif]">
          Please read these terms carefully before using Spot2Tube-sync. Last updated: {lastUpdated}.
        </p>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-white/[0.02] backdrop-blur-2xl ring-1 ring-white/10 rounded-3xl p-8 md:p-12 text-zinc-300 font-['Satoshi',sans-serif] space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using Spot2Tube-sync (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use our Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              2. Description of Service
            </h2>
            <p className="leading-relaxed mb-4">
              Spot2Tube-sync is a software application designed to facilitate the transfer and synchronization of musical metadata (including playlists, liked songs, and library structure) between third-party platforms such as Spotify and YouTube Music.
            </p>
            <p className="leading-relaxed">
              We do not host, store, or distribute any audio or media files. Our Service acts solely as a bridge for your metadata using the official APIs provided by the respective third-party platforms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              3. User Accounts and Authentication
            </h2>
            <p className="leading-relaxed mb-4">
              To use the Service, you must authenticate using your existing accounts on the supported platforms (e.g., Spotify, Google/YouTube). By doing so, you grant us permission to access specific data via OAuth as described in our Privacy Policy.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-4">
              <li>You are responsible for maintaining the security of your third-party accounts.</li>
              <li>You must be the legitimate owner of the accounts you connect to Spot2Tube-sync.</li>
              <li>You agree not to use the Service for any unauthorized or illegal purposes.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              4. API Usage and Limitations
            </h2>
            <p className="leading-relaxed">
              Spot2Tube-sync relies on third-party APIs (Spotify Web API, YouTube Data API, etc.). Your use of our Service is also subject to the Terms of Service of these platforms. We cannot guarantee the uninterrupted availability of these APIs, and we are not liable for any limits, quotas, or disruptions imposed by these third-party providers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              5. Subscriptions and Payments
            </h2>
            <p className="leading-relaxed">
              Certain features of Spot2Tube-sync are available under a Premium subscription model. By purchasing a subscription, you agree to our recurring billing terms. Payments are processed securely via Stripe. You may cancel your subscription at any time, but we do not offer refunds for partial billing periods unless required by law.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              6. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              In no event shall Spot2Tube-sync, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              7. Contact Information
            </h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at <a href="mailto:support@spot2tube.com" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors">support@spot2tube.com</a>.
            </p>
          </div>
          
        </div>
      </section>
    </div>
  );
}

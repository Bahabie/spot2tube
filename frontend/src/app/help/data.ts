export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  icon: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    title: "General",
    icon: "💬",
    items: [
      {
        question: "What is Spot2Tube-sync?",
        answer:
          "Spot2Tube-sync is a multi-platform music transfer and synchronization service. It lets you move your playlists, liked songs, and library between Spotify and YouTube Music in just a few clicks — without losing a single track.",
      },
      {
        question: "Which music platforms does Spot2Tube-sync support?",
        answer:
          "Currently Spot2Tube-sync supports Spotify and YouTube Music as source and destination platforms. Additional platforms are on our roadmap and will be announced through our newsletter.",
      },
      {
        question: "How does Spot2Tube-sync work?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Spot2Tube-sync connects to your accounts via secure OAuth, reads your playlists, and intelligently matches tracks on the destination platform using track metadata such as title, artist, and album.",
      },
      {
        question: "Is Spot2Tube-sync free?",
        answer:
          "Yes — Spot2Tube-sync offers a generous free tier that lets you transfer up to 500 songs and share music across platforms at no cost. For unlimited transfers, daily auto-syncs, and cloud backups, check out our Premium plan.",
      },
      {
        question: "Do I need to create an account?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. You sign in with your existing Spotify or Google account — no separate registration needed.",
      },
      {
        question: "Is my music data safe?",
        answer:
          "Absolutely. Spot2Tube-sync never stores your music files. We only read metadata (titles, artists, playlist names) needed for matching. All connections are encrypted, and we adhere to strict data-minimization principles.",
      },
      {
        question: "Can I transfer playlists that contain explicit tracks?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Explicit content filtering depends on your individual account settings on each platform. Spot2Tube-sync transfers tracks as-is and does not apply its own content filters.",
      },
      {
        question: "How accurate is the track matching?",
        answer:
          "Our matching engine uses a weighted combination of track title, artist name, album name, and duration to find the best result on the destination platform. Accuracy is typically above 95% for mainstream music.",
      },
    ],
  },
  {
    id: "premium",
    title: "Premium Plan",
    icon: "💎",
    items: [
      {
        question: "How do I purchase Spot2Tube-sync Premium?",
        answer:
          "Navigate to the Plans page, choose Monthly or Annual billing, and click 'Get Premium'. You'll be taken through our secure Stripe checkout. Your plan activates instantly upon payment confirmation.",
      },
      {
        question: "Can I cancel my Spot2Tube-sync Premium subscription at any time?",
        answer:
          "Yes. You can cancel at any time from your account settings. You'll retain full Premium access until the end of your current billing period, after which your account reverts to the free tier.",
      },
      {
        question: "What payment methods does Spot2Tube-sync accept?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as Apple Pay and Google Pay through our Stripe payment provider.",
      },
      {
        question: "Is there a free trial for Premium?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt. New users automatically start on our Free tier which includes a meaningful set of features — no credit card required to try Spot2Tube-sync.",
      },
      {
        question: "What happens to my playlists if I downgrade from Premium?",
        answer:
          "All playlists and transfers you've already completed remain intact on the destination platform. Auto-sync jobs will be paused when the Premium plan ends, and you'll return to the 500-song transfer limit on the free tier.",
      },
      {
        question: "Does Premium include priority support?",
        answer:
          "Yes. Premium subscribers receive prioritized email support with a guaranteed response within 24 hours on business days. Free-tier users are also supported, though response times may vary.",
      },
    ],
  },
];

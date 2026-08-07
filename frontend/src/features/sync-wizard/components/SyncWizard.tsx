"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceGrid } from "./ServiceGrid";
import { StepSourceAuth } from "./StepSourceAuth";
import { StepSelectPlaylists, MappedPlaylist } from "./StepSelectPlaylists";
import { StepReview } from "./StepReview";
import { YouTubeAuthForm } from "../../youtube/components/YouTubeAuthForm";

interface SyncWizardProps {
  spotifyLinked: boolean;
  googleLinked: boolean;
}

function SyncWizardInner({ spotifyLinked, googleLinked }: SyncWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const step = stepParam ? parseInt(stepParam, 10) : 1;

  const [selectedPlaylists, setSelectedPlaylists] = useState<MappedPlaylist[]>([]);
  const [showYouTubeAuth, setShowYouTubeAuth] = useState(false);

  useEffect(() => {
    if (step !== 4) {
      setShowYouTubeAuth(false);
    }
  }, [step]);

  useEffect(() => {
    // Hydrate playlists from localStorage if they exist
    const saved = localStorage.getItem("sync_wizard_playlists");
    if (saved) {
      try {
        setSelectedPlaylists(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved playlists", e);
      }
    }
  }, []);

  const setStep = (newStep: number) => {
    router.push(`/?step=${newStep}`);
  };

  const handleSourceSelect = (serviceId: string) => {
    if (serviceId === "spotify") {
      setStep(2);
    }
  };

  const handleSourceAuthNext = () => {
    setStep(3);
  };

  const handlePlaylistsNext = (playlists: MappedPlaylist[]) => {
    setSelectedPlaylists(playlists);
    localStorage.setItem("sync_wizard_playlists", JSON.stringify(playlists));
    setStep(4);
  };

  const handleDestinationSelect = (serviceId: string) => {
    if (serviceId === "youtube") {
      setShowYouTubeAuth(true);
    }
  };

  const handleComplete = () => {
    // Clear local storage and reset wizard or redirect to a dashboard
    localStorage.removeItem("sync_wizard_playlists");
    setSelectedPlaylists([]);
    setStep(1); // or stay on step 5, or show the progress bar page
    router.push("/");
  };

  switch (step) {
    case 1:
      return (
        <ServiceGrid
          title="Transfer Playlists Between Music Services"
          stepText="STEP 1/5 • SELECT SOURCE"
          onSelectService={handleSourceSelect}
          activeServiceId="spotify"
        />
      );
    case 2:
      return (
        <StepSourceAuth
          isAuthenticated={spotifyLinked}
          onNext={handleSourceAuthNext}
        />
      );
    case 3:
      return (
        <StepSelectPlaylists
          onNext={handlePlaylistsNext}
          initialSelected={selectedPlaylists.map((p) => p.id)}
        />
      );
    case 4:
      if (showYouTubeAuth) {
        return <YouTubeAuthForm />;
      }
      return (
        <ServiceGrid
          title="Choose Destination"
          stepText="STEP 4/5 • SELECT DESTINATION"
          onSelectService={handleDestinationSelect}
          activeServiceId="youtube"
        />
      );
    case 5:
      return (
        <StepReview
          selectedPlaylists={selectedPlaylists}
          onComplete={handleComplete}
        />
      );
    default:
      return null;
  }
}

export function SyncWizard(props: SyncWizardProps) {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-white">Loading...</div>}>
      <SyncWizardInner {...props} />
    </Suspense>
  );
}

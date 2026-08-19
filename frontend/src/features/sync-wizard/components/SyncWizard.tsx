"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceGrid } from "./ServiceGrid";
import { StepSourceAuth } from "./StepSourceAuth";
import { StepSelectPlaylists } from "./StepSelectPlaylists";
import { MappedPlaylist } from "../types";

import { StepReview } from "./StepReview";
import { YouTubeAuthForm } from "../../youtube/components/YouTubeAuthForm";
import { SpotifyAuthForm } from "../../spotify/components/SpotifyAuthForm";

interface SyncWizardProps {
  spotifyLinked: boolean;
  googleLinked: boolean;
}

export type SyncService = "spotify" | "youtube";

function SyncWizardInner({ spotifyLinked, googleLinked }: SyncWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const step = stepParam ? parseInt(stepParam, 10) : 1;

  const [selectedPlaylists, setSelectedPlaylists] = useState<MappedPlaylist[]>([]);
  const [sourceService, setSourceService] = useState<SyncService>("spotify");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("sync_wizard_playlists");
    if (saved) {
      try {
        setSelectedPlaylists(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved playlists", e);
      }
    }
    const savedSource = sessionStorage.getItem("sync_wizard_source") as SyncService;
    if (savedSource) {
      setSourceService(savedSource);
    }
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <div className="h-96 flex items-center justify-center text-[#A1A1AA]">Loading...</div>;
  }

  const setStep = (newStep: number) => {
    router.push(`/?step=${newStep}`);
  };

  const handleSourceSelect = (serviceId: string) => {
    const svc = serviceId as SyncService;
    setSourceService(svc);
    sessionStorage.setItem("sync_wizard_source", svc);
    setStep(2);
  };

  const handleSourceAuthNext = () => {
    setStep(3);
  };

  const handlePlaylistsNext = (playlists: MappedPlaylist[]) => {
    setSelectedPlaylists(playlists);
    sessionStorage.setItem("sync_wizard_playlists", JSON.stringify(playlists));
    setStep(4);
  };

  const handleDestinationSelect = (serviceId: string) => {
    // We can auto-advance if it's the correct opposite service
    if (sourceService === "spotify" && serviceId === "youtube") {
      setStep(5);
    } else if (sourceService === "youtube" && serviceId === "spotify") {
      setStep(5);
    }
  };

  const handleComplete = () => {
    sessionStorage.removeItem("sync_wizard_playlists");
    sessionStorage.removeItem("sync_wizard_source");
    setSelectedPlaylists([]);
    setSourceService("spotify");
    router.push("/");
  };

  switch (step) {
    case 1:
      return (
        <ServiceGrid
          title="Transfer Playlists Between Music Services"
          stepText="STEP 1/5 • SELECT SOURCE"
          onSelectService={handleSourceSelect}
        />
      );
    case 2:
      return (
        <StepSourceAuth
          isAuthenticated={sourceService === "youtube" ? googleLinked : spotifyLinked}
          onNext={handleSourceAuthNext}
          sourceService={sourceService}
        />
      );
    case 3:
      return (
        <StepSelectPlaylists
          onNext={handlePlaylistsNext}
          initialSelected={selectedPlaylists.map((p) => p.id)}
          sourceService={sourceService}
        />
      );
    case 4:
      // Destination auth
      if (sourceService === "spotify") {
        return <YouTubeAuthForm isConnected={googleLinked} onNext={() => setStep(5)} />;
      } else {
        return <SpotifyAuthForm isConnected={spotifyLinked} onNext={() => setStep(5)} />;
      }
    case 5:
      return (
        <StepReview
          selectedPlaylists={selectedPlaylists}
          onComplete={handleComplete}
          sourceService={sourceService}
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

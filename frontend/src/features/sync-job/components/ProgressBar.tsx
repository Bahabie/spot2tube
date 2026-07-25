"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";

interface SyncJob {
  id: string;
  spotify_playlist_id: string;
  playlist_name: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress_percentage: number;
}

export function ProgressBar({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<SyncJob[]>([]);

  useEffect(() => {
    // Fetch initial pending or processing jobs
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("sync_jobs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5); // Show last 5 jobs for UI purposes

      if (data) {
        setJobs(data as SyncJob[]);
      }
    };

    fetchJobs();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sync_jobs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setJobs((currentJobs) => {
            const updatedJob = payload.new as SyncJob;
            const jobExists = currentJobs.some((j) => j.id === updatedJob.id);

            if (jobExists) {
              return currentJobs.map((j) => (j.id === updatedJob.id ? updatedJob : j));
            } else {
              // Add new job to the top
              return [updatedJob, ...currentJobs].slice(0, 5);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (jobs.length === 0) {
    return null; // Don't show anything if no jobs
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recent Sync Jobs</h2>
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="p-4 rounded-xl glass-panel bg-white/5 border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-white">{job.playlist_name}</span>
              <div className="flex items-center gap-2">
                {job.status === "PENDING" && <Clock className="w-4 h-4 text-yellow-400" />}
                {job.status === "PROCESSING" && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                {job.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {job.status === "FAILED" && <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-sm text-gray-300 capitalize">{job.status.toLowerCase()}</span>
              </div>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  job.status === "COMPLETED" ? "bg-green-500" :
                  job.status === "FAILED" ? "bg-red-500" :
                  "bg-gradient-to-r from-blue-500 to-purple-500"
                }`}
                style={{ width: `${job.progress_percentage}%` }}
              />
            </div>
            
            {job.status === "PROCESSING" && (
              <p className="text-xs text-gray-400 mt-2 text-right">{job.progress_percentage}% completed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

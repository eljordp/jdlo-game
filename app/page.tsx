"use client";

import dynamic from "next/dynamic";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="text-white font-mono text-sm animate-pulse">Loading...</div>
    </div>
  ),
});

export default function Home() {
  return <GameCanvas />;
}

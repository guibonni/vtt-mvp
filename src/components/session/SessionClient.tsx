"use client";

import SessionHeader from "./SessionHeader";
import MapArea from "./MapArea";
import SidePanel from "./SidePanel";

export default function SessionClient({ sessionId }: { sessionId: string }) {
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SessionHeader sessionId={sessionId} />

      <div className="flex-1 grid grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px] overflow-hidden">
        <MapArea mapUrl="https://i0.wp.com/2minutetabletop.com/wp-content/uploads/2018/11/Wei-Continent-RPG-World-Map-spring.jpg"/>
        <SidePanel />
      </div>
    </div>
  );
}

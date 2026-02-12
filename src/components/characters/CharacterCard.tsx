"use client";

import { Character } from "@/src/models/character";

type Props = {
  character: Character;
  onClick: () => void;
};

export default function CharacterCard({
  character,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer
        bg-[var(--bg-card)]
        border border-[var(--border-subtle)]
        rounded-xl
        p-4
        shadow-[0_0_20px_rgba(0,0,0,0.4)]
        transition
        hover:border-[var(--accent)]/40
        hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]
      "
    >
      <div className="font-medium">
        {character.name}
      </div>

      <div className="text-xs opacity-60">
        {character.owner}
      </div>
    </div>
  );
}

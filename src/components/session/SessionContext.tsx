"use client";

import { createContext, useContext } from "react";
import { Character } from "@/src/models/character";
import { DiceResult } from "@/src/utils/dice";
import { CharacterTemplate } from "@/src/models/template";
import { Message } from "@/src/models/chat";

type SessionContextType = {
    characters: Character[];
    templates: CharacterTemplate[];
    messages: Message[];
    sessionCreatedById: string | null;
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    saveCharacter: (character: Character) => void;
    deleteCharacter: (id: string) => void;
    sendRoll: (result: DiceResult) => void;
    sendMessage: (message: string) => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error("useSession must be used inside provider");
    return ctx;
}

export default SessionContext;

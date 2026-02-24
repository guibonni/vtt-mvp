import { Character } from "@/src/models/character";
import { CharacterTemplate } from "@/src/models/template";
import { DiceResult } from "@/src/utils/dice";

export type WindowComponentPropsMap = {
    character: {
        character?: Character | null;
        templates: CharacterTemplate[];
        onSave: (character: Character) => void;
        onDelete: (id: string) => void;
        onRoll: (result: DiceResult) => void;
        onSendMessage: (content: string) => void;
    };
};

export type WindowKind = keyof WindowComponentPropsMap;

export type WindowData<K extends WindowKind = WindowKind> = {
    type: K;
    props: WindowComponentPropsMap[K];
};

export type ManagedWindow = {
    id: string;
    zIndex: number;
    data: WindowData;
};
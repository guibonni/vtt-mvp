import CharacterModal from "@/src/components/characters/CharacterModal";
import { WindowComponentPropsMap } from "./windowTypes";

type WindowRegistry = {
    [K in keyof WindowComponentPropsMap]:
    React.ComponentType<
        WindowComponentPropsMap[K] & {
            isOpen: boolean;
            zIndex?: number;
            isActive?: boolean;
            onFocus?: () => void;
            onClose: () => void;
        }
    >;
};

export const windowRegistry: WindowRegistry = {
    character: CharacterModal,
};
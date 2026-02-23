import { useEffect, useState } from "react";
import { Character } from "@/src/models/character";
import { CharacterTemplate } from "@/src/models/template";

type Params = {
    isOpen: boolean;
    character?: Character | null;
    templates: CharacterTemplate[];
    onSave: (character: Character) => void;
    onClose: () => void;
};

export function useCharacterForm({
    isOpen,
    character,
    templates,
    onSave,
    onClose,
}: Params) {
    const isEditMode = !!character;

    const [name, setName] = useState("");
    const [nameError, setNameError] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [values, setValues] = useState<Record<string, any>>({});

    // Preencher ao abrir
    useEffect(() => {
        if (isOpen && character) {
            setName(character.name);
            setSelectedTemplateId(character.templateId);
            setValues(character.values || {});
        }

        if (isOpen && !character) {
            const defaultTemplate = templates[0];
            if (defaultTemplate) {
                setSelectedTemplateId(defaultTemplate.id);
            }
            setName("");
            setValues({});
        }

        if (!isOpen) {
            reset();
        }
    }, [isOpen, character, templates]);

    function reset() {
        setName("");
        setNameError(false);
        setSelectedTemplateId("");
        setValues({});
    }

    function submit() {
        if (!name.trim()) {
            setNameError(true);
            return;
        }

        const selectedTemplate = templates.find(
            (t) => t.id === selectedTemplateId
        );

        if (!selectedTemplate) return;

        const updatedCharacter: Character = {
            id: character?.id || crypto.randomUUID(),
            name: name.trim(),
            templateId: selectedTemplate.id,
            values,
            owner: "Você",
            createdAt: character?.createdAt || new Date(),
        };

        onSave(updatedCharacter);
        onClose();
    }

    return {
        isEditMode,
        name,
        setName,
        nameError,
        clearNameError: () => setNameError(false),
        selectedTemplateId,
        setSelectedTemplateId,
        values,
        setValues,
        submit,
    };
}
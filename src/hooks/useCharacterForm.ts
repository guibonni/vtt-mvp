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
  const [templateError, setTemplateError] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [values, setValues] = useState<Record<string, unknown>>({});

  function reset() {
    setName("");
    setNameError(false);
    setTemplateError(false);
    setSelectedTemplateId("");
    setValues({});
  }

  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  function submit() {
    if (!name.trim()) {
      setNameError(true);
    }

    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
    if (!selectedTemplate) {
      setTemplateError(true);
    }

    if (!name.trim() || !selectedTemplate) return;

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
    templateError,
    clearTemplateError: () => setTemplateError(false),
    selectedTemplateId,
    setSelectedTemplateId,
    values,
    setValues,
    submit,
  };
}

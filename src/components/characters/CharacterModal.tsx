"use client";

import { useEffect, useState } from "react";
import { Character } from "@/src/models/character";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";
import { CharacterTemplate } from "@/src/models/template";
import { DiceResult } from "@/src/utils/dice";
import CharacterWindow from "./CharacterWindow";
import CharacterFooter from "./CharacterFooter";
import CharacterForm from "./CharacterForm";

type Props = {
  isOpen: boolean;
  character?: Character | null;
  templates: CharacterTemplate[];
  onRoll: (result: DiceResult) => void;
  onClose: () => void;
  onSave: (character: Character) => void;
  onDelete: (id: string) => void;
  onSendMessage: (content: string) => void;
};

export default function CharacterModal({
  isOpen,
  character,
  templates,
  onClose,
  onSave,
  onDelete,
  onRoll,
  onSendMessage
}: Props) {
  const isEditMode = !!character;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [values, setValues] = useState<Record<string, any>>({});
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const [form, setForm] = useState({
    name: "",
    owner: "Você",
  });

  useEscapeKey(isOpen, onClose);

  // Preenche quando abre
  useEffect(() => {
    if (isOpen && character) {
      setName(character.name);
      setSelectedTemplateId(character.templateId);
      setValues(character.values || {});
    }

    if (isOpen && !character) {
      const defaultTemplate = templates[0];

      setSelectedTemplateId(defaultTemplate.id);
      setName("");
      setValues({});
    }

    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen, character, templates]);

  function resetModalState() {
    setName("");
    setNameError(false);
    setValues({});
    setSelectedTemplateId("");
  }

  function handleSubmit() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

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

  if (!isOpen) return null;

  return (
    <>
      <CharacterWindow
        title={isEditMode ? "Editar Personagem" : "Criar Personagem"}
        footer={
          <CharacterFooter
            isEditMode={isEditMode}
            onClose={onClose}
            onSubmit={handleSubmit}
            onDeleteClick={() => setConfirmDelete(true)}
          />
        }
      >
        <CharacterForm
          isEditMode={isEditMode}
          name={name}
          setName={setName}
          nameError={nameError}
          clearNameError={() => setNameError(false)}
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          values={values}
          setValues={setValues}
          onRoll={onRoll}
          onSendMessage={onSendMessage}
        />
      </CharacterWindow>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Excluir Personagem"
        description="Tem certeza que deseja excluir este personagem?"
        confirmLabel="Excluir"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (character) {
            onDelete(character.id);
          }
          setConfirmDelete(false);
          onClose();
        }}
      />
    </>
  );
}

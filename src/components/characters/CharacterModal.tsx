"use client";

import { useState } from "react";
import { Character } from "@/src/models/character";
import { CharacterTemplate } from "@/src/models/template";
import { DiceResult } from "@/src/utils/dice";

import CharacterWindow from "./CharacterWindow";
import CharacterForm from "./CharacterForm";
import CharacterFooter from "./CharacterFooter";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";
import { useCharacterForm } from "@/src/hooks/useCharacterForm";

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
  onSendMessage,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEscapeKey(isOpen, onClose);

  const {
    isEditMode,
    name,
    setName,
    nameError,
    clearNameError,
    selectedTemplateId,
    setSelectedTemplateId,
    values,
    setValues,
    submit,
  } = useCharacterForm({
    isOpen,
    character,
    templates,
    onSave,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <>
      <CharacterWindow
        title={isEditMode ? name : "Criar Personagem"}
        footer={
          <CharacterFooter
            isEditMode={isEditMode}
            onClose={onClose}
            onSubmit={submit}
            onDeleteClick={() => setConfirmDelete(true)}
          />
        }
      >
        <CharacterForm
          isEditMode={isEditMode}
          name={name}
          setName={setName}
          nameError={nameError}
          clearNameError={clearNameError}
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
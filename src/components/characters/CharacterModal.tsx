"use client";

import { useEffect, useState } from "react";
import { Character } from "@/src/models/character";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";
import { CharacterTemplate } from "@/src/models/template";
import { DiceResult, rollExpression } from "@/src/utils/dice";

type Props = {
  isOpen: boolean;
  character?: Character | null;
  templates: CharacterTemplate[];
  onRoll: (result: DiceResult) => void;
  onClose: () => void;
  onSave: (character: Character) => void;
  onDelete: (id: string) => void;
};

export default function CharacterModal({
  isOpen,
  character,
  templates,
  onClose,
  onSave,
  onDelete,
  onRoll,
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

  function handleMouseDown(e: React.MouseEvent) {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    function handleMouseMove(e: MouseEvent) {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

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
      <div
        style={{
          top: position.y,
          left: position.x,
        }}
        className={`
          fixed
          w-[800px]
          bg-[var(--bg-card)]
          border border-[var(--border-subtle)]
          rounded-xl
          shadow-[0_0_40px_rgba(0,0,0,0.7)]
          flex flex-col
          z-50
          transition-all duration-200
          ${isMinimized ? "h-auto" : "max-h-[90vh]"}
        `}
      >
        <div
          className="
            bg-[var(--bg-card)]
            rounded-xl
            max-h-[90vh]
            flex flex-col
          "
        >
          {/* HEADER */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setIsMinimized((prev) => !prev)}
            className="
              p-4
              border-b border-[var(--border-subtle)]
              cursor-move
              select-none
              flex justify-between items-center
            "
                    >
            <div className="text-lg font-medium">
              {isEditMode ? "Editar Personagem" : "Criar Personagem"}
            </div>
          </div>

          {/* BODY COM SCROLL */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium opacity-70">
                  Nome do Personagem
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  className={`
                    w-full px-3 py-2
                    bg-[var(--bg-surface)]
                    border
                    rounded-md
                    text-sm
                    outline-none
                    transition
                    ${
                      nameError
                        ? "border-red-500"
                        : "border-[var(--border-subtle)] focus:border-[var(--accent)]/50"
                    }
                  `}
                />

                {nameError && (
                  <span className="text-xs text-red-400">
                    O nome é obrigatório.
                  </span>
                )}
              </div>

              {!character && (
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              )}

              {selectedTemplate?.sections.map((section) => (
                <div key={section.id} className="space-y-4 pt-6">
                  <div className="text-sm font-medium opacity-70 border-b border-[var(--border-subtle)] pb-1">
                    {section.title}
                  </div>

                  <div className="grid grid-cols-12 gap-4">
                    {section.fields.map((field) => {
                      const safeSpan = Math.min(field.columnSpan || 12, 12);

                      return (
                        <div
                          key={field.id}
                          style={{
                            gridColumn: `span ${safeSpan} / span ${safeSpan}`,
                          }}
                          className="space-y-1"
                        >
                          <label className="text-xs font-medium opacity-70">
                            {field.label}
                          </label>

                          {field.type === "text" && (
                            <input
                              type="text"
                              value={values[field.id] || ""}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  [field.id]: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm focus:border-[var(--accent)]/50 outline-none transition"
                            />
                          )}

                          {field.type === "number" && (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="number"
                                value={values[field.id] || 0}
                                onChange={(e) =>
                                  setValues({
                                    ...values,
                                    [field.id]: Number(e.target.value),
                                  })
                                }
                                className="
                                  flex-1
                                  min-w-0
                                  px-3 py-2
                                  bg-[var(--bg-surface)]
                                  border border-[var(--border-subtle)]
                                  rounded-md
                                  text-sm
                                  text-center
                                  focus:border-[var(--accent)]/50
                                  outline-none
                                  transition
                                "
                              />

                              {field.dice && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const baseValue = values[field.id] || 0;
                                    const result = rollExpression(
                                      field.dice!,
                                      baseValue,
                                    );
                                    if (!result) return;
                                    onRoll(result);
                                  }}
                                  className="
                                    shrink-0
                                    w-8 h-8
                                    flex items-center justify-center
                                    rounded-md
                                    bg-[var(--bg-surface)]
                                    border border-[var(--border-subtle)]
                                    hover:border-[var(--accent)]/40
                                    transition
                                  "
                                >
                                  <svg
                                    className="w-4 h-4 opacity-70 hover:opacity-100"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.7 7 12 9.7 5.3 7 12 4.3z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}

                          {field.type === "textarea" && (
                            <textarea
                              value={values[field.id] || ""}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  [field.id]: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm focus:border-[var(--accent)]/50 outline-none transition resize-none"
                              rows={3}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}  

          {/* Botões */}
          {!isMinimized && (
            <div className="p-6 border-t border-[var(--border-subtle)] flex justify-between">

              {isEditMode && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-400 hover:text-red-500"
                >
                  Excluir Personagem
                </button>
              )}

              <div className="flex gap-3 ml-auto">
                <button
                  onClick={onClose}
                  className="px-3 py-1 text-sm bg-[var(--bg-surface)] rounded-md"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-3 py-1 text-sm bg-[var(--accent)] rounded-md"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

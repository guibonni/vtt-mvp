import { CharacterTemplate } from "../models/template";

export const defaultTemplate: CharacterTemplate = {
  id: "default",
  name: "Template Básico",
  description: "Ficha básica para testes",
  createdAt: new Date(),
  sections: [
    {
      id: "identity",
      title: "Identidade",
      fields: [
        { id: "race", label: "Raça", type: "text", columnSpan: 6 },
        { id: "class", label: "Classe", type: "text", columnSpan: 6 },
      ],
    },
    {
      id: "attributes",
      title: "Atributos",
      fields: [
        { id: "strength", label: "Força", type: "number", columnSpan: 4, dice: "1d20" },
        { id: "dexterity", label: "Destreza", type: "number", columnSpan: 4, dice: "1d20" },
        { id: "constitution", label: "Constituição", type: "number", columnSpan: 4, dice: "1d20" },
      ],
    },
    {
      id: "story",
      title: "História",
      fields: [
        { id: "biography", label: "Biografia", type: "textarea", columnSpan: 12 },
      ],
    },
  ],
};

export const daggerheartTemplate: CharacterTemplate = {
  id: "daggerheart",
  name: "Daggerheart",
  description: "Ficha básica para testes",
  createdAt: new Date(),
  sections: [
    {
      id: "identity",
      title: "Identidade",
      fields: [
        { id: "gender", label: "Gênero", type: "text", columnSpan: 6 },
        { id: "heritage", label: "Herança", type: "text", columnSpan: 6 },
        { id: "class", label: "Classe", type: "text", columnSpan: 6 },
        { id: "subclass", label: "Subclasse", type: "text", columnSpan: 6 },
      ],
    },
    {
      id: "attributes",
      title: "Atributos",
      fields: [
        { id: "agility", label: "Agilidade", type: "number", columnSpan: 4, dice: "2d12" },
        { id: "strength", label: "Força", type: "number", columnSpan: 4, dice: "2d12" },
        { id: "acuity", label: "Acuidade", type: "number", columnSpan: 4, dice: "2d12" },
        { id: "instinct", label: "Instinto", type: "number", columnSpan: 4, dice: "2d12" },
        { id: "presence", label: "Presença", type: "number", columnSpan: 4, dice: "2d12" },
        { id: "knowledge", label: "Conhecimento", type: "number", columnSpan: 4, dice: "2d12" }
      ],
    },
    {
      id: "skills",
      title: "Habilidades",
      fields: [ 
        { id: "skill1", label: "Habilidade 1", type: "textarea", columnSpan: 6 },
        { id: "skill2", label: "Habilidade 2", type: "textarea", columnSpan: 6 },
        { id: "skill3", label: "Habilidade 3", type: "textarea", columnSpan: 6 },
        { id: "skill4", label: "Habilidade 4", type: "textarea", columnSpan: 6 }
      ]
    },
    {
      id: "story",
      title: "História",
      fields: [
        { id: "originQuestions", label: "Perguntas de Origem", type: "textarea", columnSpan: 12 },
        { id: "bonds", label: "Vínculos", type: "textarea", columnSpan: 12 },
      ],
    },
  ],
};

export const templates: CharacterTemplate[] = [
  defaultTemplate,
  daggerheartTemplate
];

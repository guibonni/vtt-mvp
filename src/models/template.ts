export type FieldType =
  | "text"
  | "number"
  | "textarea";

export type TemplateField = {
  id: string;
  label: string;
  type: FieldType;
  columnSpan: number; // 1 - 12,
  dice?: string;
};

export type TemplateSection = {
  id: string;
  title: string;
  fields: TemplateField[];
};

export type CharacterTemplate = {
  id: string;
  name: string;
  description?: string;
  sections: TemplateSection[];
  createdAt: Date;
};

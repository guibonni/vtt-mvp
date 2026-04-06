import { CharacterTemplate } from "./template";

export type Character = {
  id: string;
  name: string;
  templateId: string;
  template?: CharacterTemplate;
  values: Record<string, unknown>;
  owner: string;
  createdAt: Date;
};

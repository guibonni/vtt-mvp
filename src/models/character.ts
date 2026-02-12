export type Character = {
  id: string;
  name: string; // obrigatório
  templateId: string;
  values: Record<string, any>;
  owner: string;
  createdAt: Date;
};

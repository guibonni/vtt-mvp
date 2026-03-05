export type Character = {
  id: string;
  name: string;
  templateId: string;
  values: Record<string, unknown>;
  owner: string;
  createdAt: Date;
};

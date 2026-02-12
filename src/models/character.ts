export type Attribute = {
  name: string;
  value: number;
};

export type Equipment = {
  id: string;
  name: string;
  description?: string;
};

export type Action = {
  id: string;
  name: string;
  description?: string;
};

export type Character = {
  id: string;
  name: string;
  race?: string;
  class?: string;
  owner: string; // nome do jogador por enquanto
  attributes: Attribute[];
  equipment: Equipment[];
  actions: Action[];
  biography?: string;
  createdAt: Date;
};

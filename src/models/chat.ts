export type RollData = {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
};

export type Message = {
  id: string;
  author: string;
  content: string;
  type: "text" | "roll";
  rollData?: RollData;
  createdAt: Date;
};
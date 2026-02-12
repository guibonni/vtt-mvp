import { DiceResult } from "../utils/dice";

export type RollData = {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
};

export type Message = {
  id: string;
  author: string;
  type: "text" | "roll";
  content?: string;
  rollData?: DiceResult;
  createdAt: Date;
};

export type DiceResult = {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
};

export function rollExpression(
  expression: string,
  modifier: number = 0
): DiceResult | null {
  const match = expression.match(/^(\d+)d(\d+)$/);

  if (!match) return null;

  const quantity = Number(match[1]);
  const sides = Number(match[2]);

  let total = 0;
  const rolls: number[] = [];

  for (let i = 0; i < quantity; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  const finalTotal = total + modifier;

  return {
    expression: `${expression}${modifier ? `+${modifier}` : ""}`,
    rolls,
    modifier,
    total: finalTotal,
  };
}

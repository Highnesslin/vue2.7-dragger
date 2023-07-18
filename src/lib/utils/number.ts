export function divide(num1: number, num2: number) {
  return Number((num1/num2).toFixed(4))
}

export function multiply(num1: number, num2: number) {
  return Number((num1 * num2).toFixed(4))
}

export function subtract(...numbers: number[]) {  
  const [first, ...rest] = numbers

  const result = rest.reduce((acc, num) => acc - num, first)
  
  return Number(result.toFixed(4));
}


// TODO: When upgraded to Typescript 5.6 or later,
// do better typings for this function. ChatGPT suggests the following:
/*
// Typdefinition för en asynkron generatorfunktion
type AsyncGeneratorFunction<Input, Output> = (input: AsyncGenerator<Input>) => AsyncGenerator<Output>;

// Generisk pipeline-funktion
async function pipeline<Input, Output>(
  ...stages: AsyncGeneratorFunction<any, any>[]
): Promise<void> 
*/
export async function asyncIterablePipeline(...stages: any[]) { 
  // Kedja generatorerna genom att skicka utdata från en till nästa
  let result = stages[0](); // Starta med den första generatorn

  for (let i = 1; i < stages.length; i++) {
    result = stages[i](result); // Skicka vidare resultatet till nästa generator
  }

  // Returnera det sista resultatet
  for await (const chunk of result) {}
}

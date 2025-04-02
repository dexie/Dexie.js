
// TODO: When upgraded to Typescript 5.6 or later,
// do better typings for this function. ChatGPT suggests the following:
/*
// Typdefinition för en asynkron generatorfunktion
type AsyncGeneratorFunction<Input, Output> = (input: AsyncGenerator<Input>) => AsyncGenerator<Output>;

// Typdefinition för pipelinen
type Pipeline<T> = {
  [K in keyof T]: AsyncGeneratorFunction<T[K], T[K + 1]>;
};

// Generisk pipeline-funktion
async function pipeline<Input, Output>(
  ...stages: AsyncGeneratorFunction<Input, Output>[]
): Promise<void>
*/
type AsyncSourceGeneratorFn<Output> = () => AsyncGenerator<Output>;
type AsyncGeneratorFn<Input, Output> = (input: AsyncGenerator<Input>) => AsyncGenerator<Output>;
export async function asyncIterablePipeline(source: AsyncSourceGeneratorFn<any>, ...stages: AsyncGeneratorFn<any,any>[]) { 
  // Chain generators by sending outdata from one to another
  let result = source(); // Start with the source generator

  for (let i = 0; i < stages.length; i++) {
    result = stages[i](result); // Pass on the result to next generator
  }

  // Start running the machine. If the last stage is a sink, it will consume the data and never emit anything
  // to us here...
  for await (const chunk of result) {}
}

import Typeson from 'typeson';
import StructuredCloning from 'typeson-registry/dist/presets/structured-cloning';
import typedArray from './tson-typed-array';
import arrayBuffer from './tson-arraybuffer';

export const TSON = new Typeson().register([
  StructuredCloning,
  arrayBuffer,
  typedArray
]);

import Typeson from 'typeson';
import StructuredCloning from 'typeson-registry/dist/presets/structured-cloning';

export const TSON = new Typeson().register(StructuredCloning);


export interface IndexSpec {
  name: string;
  keyPath: string | Array<string>;
  unique: boolean;
  multi: boolean;
  auto: boolean;
  compound: boolean;
  src: string;
}

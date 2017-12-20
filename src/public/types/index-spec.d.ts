export interface IndexSpec {
  name: string;
  keyPath: string | Array<string> | undefined;
  unique: boolean | undefined;
  multi: boolean | undefined;
  auto: boolean | undefined;
  compound: boolean | undefined;
  src: string;
}

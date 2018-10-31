import clarinet from 'clarinet';

function readBlob(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.onload = ev => resolve((ev.target as any).result);
    reader.readAsText(blob);
  });
}

export interface JsonStream<T> {
  pull(numBytes: number): Promise<Partial<T>>;
  done(): boolean;
  eof(): boolean;
  result: Partial<T>;
}

export function JsonStream<T>(blob: Blob):  JsonStream<T> {
  let pos = 0;
  const parser = JsonParser();

  const rv = {
    async pull(numBytes: number): Promise<Partial<T>> {
      const slize = blob.slice(pos, pos + numBytes);
      pos += numBytes;
      const jsonPart = await readBlob(slize);
      const result = parser.write(jsonPart);
      rv.result = result || {};
      return result;
    },
    done() {
      return parser.done();
    },
    eof() {
      return pos >= blob.size;
    },
    result: {}
  }

  return rv;
}


export function JsonParser () {
  const parser = (clarinet as any).parser();
  let level = 0;
  let result: any;
  const stack: any[][] = [];
  let obj: any;
  let key: string | null;
  let done = false;
  let array = false;

  parser.onopenobject = newKey => {
    const newObj = {};
    if (!result) result = newObj;
    if (obj) stack.push([key,obj,array])
    obj = newObj;
    key = newKey;
    array = false;
    ++level;
  }
  parser.onkey = newKey => key = newKey;
  parser.onvalue = value => array ? obj.push(value) : obj[key!] = value;
  parser.oncloseobject = ()=>{
    key = null;
    if (--level === 0) {
      done = true;
    } else {
      const completedObj = obj;
      [key, obj, array] = stack.pop()!;
      if (array) {
        obj.push(completedObj);
      } else {
        obj[key!] = completedObj;
      }
    }
  }
  parser.onopenarray = () => {
    const newObj = [];
    (newObj as any).complete = false;
    if (!result) result = newObj;
    if (obj) stack.push([key, obj, array]);
    obj = newObj;
    array = true;
    key = null;
    ++level;
  }
  parser.onclosearray = () => {
    obj.complete = true;
    key = null;
    if (--level === 0) {
      done = true;
    } else {
      const completedObj = obj;
      [key, obj, array] = stack.pop()!;
      if (array) {
        obj.push(completedObj);
      } else {
        obj[key!] = completedObj;
      }
    }
  }

  return {
    write(jsonPart: string) {
      parser.write(jsonPart);
      return result;
    },
    done() {
      return done;
    }
  }
}

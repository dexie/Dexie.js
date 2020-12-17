
export class BinarySemaphore {
  constructor() {
    this.init();
  }
  post: ()=>void;
  then: (onSuccess: (val: any) => void, onError: (err: any) => void)=>void;
  reset() {
    this.post();
    this.init();
  }
  private init() {
    const promise = new Promise(resolve => this.post = resolve);
    this.then = promise.then.bind(promise);
  }
}

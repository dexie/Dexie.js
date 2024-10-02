
export function getFetchResponseBodyGenerator(res: Response) {
  return async function* () {
    if (!res.body) throw new Error("Response body is not readable");
    const reader = res.body.getReader();  
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) return
        yield value
      }
    }
    finally {
      reader.releaseLock()
    }
  }
}

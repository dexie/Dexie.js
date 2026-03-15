/**
 * Deduplicates in-flight blob downloads.
 *
 * Both the blob-resolve middleware and the eager blob downloader may
 * try to fetch the same blob concurrently. This tracker ensures each
 * unique blob ref is only downloaded once — subsequent requests for
 * the same ref piggyback on the existing promise.
 *
 * Instantiate once per DexieCloudDB.
 */
export class BlobDownloadTracker {
  private inFlight = new Map<string, Promise<Uint8Array>>();

  /**
   * Download a blob, deduplicating concurrent requests for the same ref.
   *
   * @param ref   - Blob ref string (e.g. '1:blobId')
   * @param doFetch - The actual fetch function to call if no download is in progress
   */
  download(ref: string, doFetch: () => Promise<Uint8Array>): Promise<Uint8Array> {
    let promise = this.inFlight.get(ref);
    if (!promise) {
      promise = doFetch().finally(() => this.inFlight.delete(ref));
      this.inFlight.set(ref, promise);
    }
    return promise;
  }
}

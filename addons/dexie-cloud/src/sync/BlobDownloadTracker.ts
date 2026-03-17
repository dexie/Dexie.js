import type { DexieCloudDB } from "../db/DexieCloudDB";
import { BlobRef } from "./blobResolve";
import { loadCachedAccessToken } from "./loadCachedAccessToken";

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
  private db: DexieCloudDB;

  constructor (db: DexieCloudDB) {
    this.db = db;
  }

  /**
   * Download a blob, deduplicating concurrent requests for the same ref.
   *
   * @param blobRef - The BlobRef to download
   * @param dbUrl - Base URL for the database (e.g., 'https://mydb.dexie.cloud')
   */
  download(blobRef: BlobRef, dbUrl: string): Promise<Uint8Array> {
    let promise = this.inFlight.get(blobRef.ref);
    if (!promise) {
      console.debug(`[dexie-cloud:BlobDownloadTracker] Starting download: ${blobRef.ref} (${blobRef.size || '?'} bytes)`);
      promise = loadCachedAccessToken(this.db).then(accessToken => {
        if (!accessToken) throw new Error("No access token available for blob download");
        console.debug(`[dexie-cloud:BlobDownloadTracker] Got access token, fetching: ${blobRef.ref}`);
        return downloadBlob(blobRef, dbUrl, accessToken);
      }).then(data => {
        console.debug(`[dexie-cloud:BlobDownloadTracker] Downloaded: ${blobRef.ref} (${data.length} bytes)`);
        return data;
      }).finally(() => this.inFlight.delete(blobRef.ref));
      this.inFlight.set(blobRef.ref, promise);
    } else {
      console.debug(`[dexie-cloud:BlobDownloadTracker] Deduped: ${blobRef.ref} (already in-flight)`);
    }
    return promise;
  }
}
/**
 * Download blob data from server via proxy endpoint.
 * Uses auth header for authentication (same as sync).
 *
 * @param blobRef - The BlobRef to download
 * @param dbUrl - Base URL for the database (e.g., 'https://mydb.dexie.cloud')
 * @param accessToken - Access token for authentication
 */

export async function downloadBlob(
  blobRef: BlobRef,
  dbUrl: string,
  accessToken: string
): Promise<Uint8Array> {
  const downloadUrl = `${dbUrl}/blob/${blobRef.ref}`;
  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download blob ${blobRef.ref}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}


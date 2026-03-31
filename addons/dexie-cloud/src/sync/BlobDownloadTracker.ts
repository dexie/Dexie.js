import type { DexieCloudDB } from '../db/DexieCloudDB';
import { BlobRef } from './blobResolve';
import { loadCachedAccessToken } from './loadCachedAccessToken';

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

  constructor(db: DexieCloudDB) {
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
      promise = loadCachedAccessToken(this.db)
        .then((accessToken) => {
          // accessToken may be null for anonymous/unauthenticated users.
          // Public realm blobs (rlm-public) are accessible without auth.
          // downloadBlob will omit the Authorization header when token is null.
          return downloadBlob(blobRef, dbUrl, accessToken);
        })
        .finally(() => this.inFlight.delete(blobRef.ref));
      // When the promise settles (either fulfilled or rejected), remove it from the in-flight map
      this.inFlight.set(blobRef.ref, promise);
    }
    return promise;
  }
}
/**
 * Download blob data from server via proxy endpoint.
 * Uses auth header for authentication (same as sync).
 * When accessToken is null, the request is made without Authorization header —
 * this allows downloading blobs from public realms (rlm-public) for
 * unauthenticated users.
 *
 * @param blobRef - The BlobRef to download
 * @param dbUrl - Base URL for the database (e.g., 'https://mydb.dexie.cloud')
 * @param accessToken - Access token for authentication, or null for anonymous access
 */

export async function downloadBlob(
  blobRef: BlobRef,
  dbUrl: string,
  accessToken: string | null
): Promise<Uint8Array> {
  const downloadUrl = `${dbUrl}/blob/${blobRef.ref}`;
  const headers: HeadersInit = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const response = await fetch(downloadUrl, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to download blob ${blobRef.ref}: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

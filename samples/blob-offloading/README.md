# Blob Offloading Example

A minimal example showing Dexie Cloud's blob offloading feature.

## What It Shows

- Storing images/files with automatic blob offloading
- Lazy blob resolution (thumbnails load on demand)
- Upload/download progress tracking
- Offline-first: images cached locally, synced when online

## Setup

```bash
npm install
npx dexie-cloud create  # Create a database
# Copy the URL to src/db.ts
npm run dev
```

## Key Code

### Database Setup (`src/db.ts`)

```ts
import Dexie from 'dexie';
import dexieCloud from 'dexie-cloud-addon';

const db = new Dexie('photo-gallery', { addons: [dexieCloud] });

db.version(1).stores({
  photos: '@id, title, date, albumId',
  albums: '@id, name'
});

db.cloud.configure({
  databaseUrl: 'YOUR_DATABASE_URL',
  requireAuth: true
});

export { db };
```

### Storing a Photo

```ts
async function addPhoto(file: File, title: string) {
  await db.photos.add({
    title,
    date: new Date(),
    image: file,          // Blob — automatically offloaded on sync
    thumbnail: await createThumbnail(file)  // Small preview kept inline
  });
}
```

### Reading Photos (Lazy Resolution)

```ts
// BlobRefs are resolved automatically when accessed
const photos = await db.photos.toArray();
for (const photo of photos) {
  // photo.image is resolved from blob storage on access
  const url = URL.createObjectURL(photo.image);
  img.src = url;
}
```

### Progress Tracking

```ts
import { blobProgress } from 'dexie-cloud-addon';

blobProgress.subscribe(progress => {
  if (progress) {
    const pct = Math.round((progress.loaded / progress.total) * 100);
    statusBar.textContent = `${progress.phase}: ${pct}%`;
  } else {
    statusBar.textContent = 'Ready';
  }
});
```

## Architecture

```
User drops image
      │
      ▼
  IndexedDB (local)
  [Blob stored inline]
      │
      ▼ sync
  Dexie Cloud Server
      │
      ├─▶ Object data → PostgreSQL
      │     (with BlobRef instead of Blob)
      │
      └─▶ Binary data → Blob Storage
            (PostgreSQL or S3)
```

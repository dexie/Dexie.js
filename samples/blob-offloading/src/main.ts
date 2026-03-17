import Dexie, { type EntityTable } from 'dexie';
import dexieCloud from 'dexie-cloud-addon';
import { blobProgress } from 'dexie-cloud-addon';

// --- Database Setup ---

interface Photo {
  id: string;
  title: string;
  date: Date;
  image: Blob;
  size: number;
}

const db = new Dexie('photo-gallery', { addons: [dexieCloud] }) as Dexie & {
  photos: EntityTable<Photo, 'id'>;
};

db.version(1).stores({
  photos: '@id, title, date'
});

db.cloud.configure({
  databaseUrl: 'https://YOUR_DB_URL.dexie.cloud', // Replace with your DB URL
  requireAuth: true
});

// --- UI References ---

const gallery = document.getElementById('gallery')!;
const dropZone = document.getElementById('dropZone')!;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const statusEl = document.getElementById('status')!;
const progressBar = document.getElementById('progress')!;
const progressFill = document.getElementById('progress-fill')!;
const authSection = document.getElementById('auth')!;

// --- Auth ---

(window as any).login = async () => {
  await db.cloud.login();
};

// Update auth UI
db.cloud.currentUser.subscribe(user => {
  if (user?.isLoggedIn) {
    authSection.innerHTML = `<span class="user-info">👤 ${user.email}</span>`;
  } else {
    authSection.innerHTML = `<button onclick="login()">Sign In</button>`;
  }
});

// --- Progress Tracking ---

blobProgress.subscribe(progress => {
  if (progress) {
    const pct = Math.round((progress.loaded / progress.total) * 100);
    progressBar.classList.add('active');
    progressFill.style.width = `${pct}%`;
    statusEl.textContent = `${progress.phase === 'upload' ? '⬆️' : '⬇️'} ${progress.phase}: ${pct}%`;
  } else {
    progressBar.classList.remove('active');
    progressFill.style.width = '0%';
    statusEl.textContent = 'Ready';
  }
});

// --- File Upload ---

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = Array.from(e.dataTransfer?.files || []);
  await addPhotos(files.filter(f => f.type.startsWith('image/')));
});

fileInput.addEventListener('change', async () => {
  const files = Array.from(fileInput.files || []);
  await addPhotos(files);
  fileInput.value = '';
});

async function addPhotos(files: File[]) {
  statusEl.textContent = `Adding ${files.length} photo(s)...`;
  for (const file of files) {
    await db.photos.add({
      title: file.name.replace(/\.[^/.]+$/, ''),
      date: new Date(),
      image: file,  // Blob — automatically offloaded to blob storage on sync!
      size: file.size
    });
  }
  statusEl.textContent = `Added ${files.length} photo(s)`;
}

// --- Gallery Rendering ---

// Live query — automatically updates when data changes
import { liveQuery } from 'dexie';

liveQuery(() => db.photos.orderBy('date').reverse().toArray()).subscribe(photos => {
  renderGallery(photos);
});

function renderGallery(photos: Photo[]) {
  gallery.innerHTML = photos.map(photo => {
    // Create object URL for display
    // If the image is a BlobRef (not yet resolved), show placeholder
    const isBlob = photo.image instanceof Blob;
    return `
      <div class="photo-card">
        ${isBlob
          ? `<img src="${URL.createObjectURL(photo.image)}" alt="${photo.title}" loading="lazy">`
          : `<div style="height:200px;display:flex;align-items:center;justify-content:center;background:#0f3460">⏳ Loading...</div>`
        }
        <div class="info">
          <div class="title">${photo.title}</div>
          <div class="meta">${formatDate(photo.date)} · ${formatSize(photo.size)}</div>
          <button class="delete" onclick="deletePhoto('${photo.id}')">🗑️ Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

(window as any).deletePhoto = async (id: string) => {
  await db.photos.delete(id);
};

// --- Helpers ---

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

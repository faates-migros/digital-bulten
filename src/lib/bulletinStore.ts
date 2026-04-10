export interface StoredBulletin {
  id: string;
  fileName: string;
  uploadedAt: string;
  pageCount: number;
  pdfBlob: Blob;
}

export async function saveBulletin(bulletin: StoredBulletin): Promise<void> {
  const base64 = await blobToBase64(bulletin.pdfBlob);
  await fetch('/api/bulletins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: bulletin.id,
      fileName: bulletin.fileName,
      uploadedAt: bulletin.uploadedAt,
      pageCount: bulletin.pageCount,
      pdfBase64: base64,
    }),
  });
}

export async function getAllBulletins(): Promise<Omit<StoredBulletin, 'pdfBlob'>[]> {
  const res = await fetch('/api/bulletins');
  return await res.json();
}

export async function getBulletinById(id: string): Promise<StoredBulletin | undefined> {
  const res = await fetch(`/api/bulletins/${encodeURIComponent(id)}/file`);
  if (!res.ok) return undefined;
  const pdfBlob = await res.blob();
  // Get metadata
  const allRes = await fetch('/api/bulletins');
  const all: any[] = await allRes.json();
  const meta = all.find((b: any) => b.id === id);
  if (!meta) return undefined;
  return { ...meta, pdfBlob };
}

export async function deleteBulletin(id: string): Promise<void> {
  await fetch(`/api/bulletins/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:application/pdf;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

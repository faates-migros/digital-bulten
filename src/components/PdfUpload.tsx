import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfUploadProps {
  onPdfLoaded: (
    pageBlobUrls: string[],
    fileName: string,
    editorNotes: Record<number, string[]>,
    pageTexts: string[],
    pageTextPositions: TextItemPosition[][],
    rawFile: File
  ) => void;
}

export interface TextItemPosition {
  str: string;
  left: number;   // % of page width
  top: number;    // % of page height (from top)
  width: number;  // % of page width
  height: number; // % of page height
}

// Patterns that indicate editor/footnote text
const NOTE_PATTERNS = [
  /^\*/,
  /^not\s*:/i,
  /^kaynak/i,
  /tarih/i,
  /incelenmiştir/i,
  /hesaplanmıştır/i,
  /baz alınmıştır/i,
  /analiz edilmiştir/i,
  /dönem/i,
  /KDV/,
  /kayıp müşteri/i,
  /yeni müşteri/i,
  /LFL müşteri/i,
  /ciro bilgileri/i,
];

const NOTE_STRIP_PATTERNS = [
  /veri\s+analiti[ğg]i\s+ve\s+m[üu][şs]teri\s+kanal\s+deneyimi\s*©?\s*\d{0,4}/gi,
  /©\s*\d{4}/g,
];

function isNoteText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 15) return false;
  return NOTE_PATTERNS.some(p => p.test(trimmed));
}

function cleanNoteText(text: string): string {
  let cleaned = text;
  for (const pattern of NOTE_STRIP_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.replace(/\s{2,}/g, ' ').trim();
}

export function PdfUpload({ onPdfLoaded }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processPdf = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') return;

    setIsLoading(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      // Use pdfjs to extract editor notes
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      const totalPages = pdf.numPages;
      const allNotes: Record<number, string[]> = {};
      const pageTexts: string[] = [];
      const pageTextPositions: TextItemPosition[][] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();
        const pageHeight = viewport.height;
        const noteItems: { text: string; y: number; x: number }[] = [];

        // Extract full page text for search + positions for highlight
        const fullTextItems: string[] = [];
        const posItems: TextItemPosition[] = [];
        const pageWidth = viewport.width;
        for (const item of textContent.items) {
          if ('str' in item && item.str.trim()) {
            fullTextItems.push(item.str.trim());
            const tx = (item as any).transform;
            if (tx) {
              const fontSize = Math.abs(tx[3]) || 12;
              const x = tx[4];
              const y = tx[5];
              const w = (item as any).width || item.str.length * fontSize * 0.5;
              posItems.push({
                str: item.str,
                left: (x / pageWidth) * 100,
                top: (1 - (y + fontSize) / pageHeight) * 100,
                width: (w / pageWidth) * 100,
                height: (fontSize / pageHeight) * 100,
              });
            }
          }
        }
        pageTexts.push(fullTextItems.join(' '));
        pageTextPositions.push(posItems);

        for (const item of textContent.items) {
          if (!('str' in item) || !item.str.trim()) continue;
          const tx = (item as any).transform;
          if (!tx) continue;
          if (tx[5] < pageHeight * 0.15) {
            noteItems.push({ text: item.str.trim(), y: tx[5], x: tx[4] });
          }
        }

        if (noteItems.length > 0) {
          noteItems.sort((a, b) => b.y - a.y || a.x - b.x);
          const lines: string[] = [];
          let currentLine = { text: noteItems[0].text, y: noteItems[0].y };
          for (let j = 1; j < noteItems.length; j++) {
            const item = noteItems[j];
            if (Math.abs(item.y - currentLine.y) < 5) {
              currentLine.text += ' ' + item.text;
            } else {
              lines.push(currentLine.text);
              currentLine = { text: item.text, y: item.y };
            }
          }
          lines.push(currentLine.text);

          const pageNotes: string[] = [];
          for (const line of lines) {
            if (isNoteText(line)) {
              const cleaned = cleanNoteText(line);
              if (cleaned.length > 10) pageNotes.push(cleaned);
            }
          }
          if (pageNotes.length > 0) allNotes[i] = pageNotes;
        }

        setProgress(Math.round((i / totalPages) * 70));
      }

      // Use pdf-lib to split into individual page PDFs
      const srcDoc = await PDFDocument.load(pdfBytes);
      const pageBlobUrls: string[] = [];

      for (let i = 0; i < totalPages; i++) {
        const singlePageDoc = await PDFDocument.create();
        const [copiedPage] = await singlePageDoc.copyPages(srcDoc, [i]);
        singlePageDoc.addPage(copiedPage);
        const singlePageBytes = await singlePageDoc.save();
        const blob = new Blob([singlePageBytes as unknown as BlobPart], { type: 'application/pdf' });
        pageBlobUrls.push(URL.createObjectURL(blob));
        setProgress(70 + Math.round(((i + 1) / totalPages) * 30));
      }

      onPdfLoaded(pageBlobUrls, file.name, allNotes, pageTexts, pageTextPositions, file);
    } catch (err) {
      console.error('PDF yüklenirken hata oluştu:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onPdfLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processPdf(file);
  }, [processPdf]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processPdf(file);
  }, [processPdf]);

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full max-w-2xl aspect-[4/3] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-6 cursor-pointer group ${
          isDragging
            ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
            : 'border-white/20 bg-white/5 hover:border-orange-500/50 hover:bg-white/10'
        }`}
        onClick={() => !isLoading && document.getElementById('pdf-file-input')?.click()}
      >
        <input
          id="pdf-file-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-black text-white tracking-tight">PDF Yükleniyor...</p>
              <p className="text-sm font-bold text-zinc-500 mt-1">Sayfalar işleniyor</p>
            </div>
            <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-black text-orange-500 tabular-nums">{progress}%</p>
          </div>
        ) : (
          <>
            <div className={`p-6 rounded-2xl transition-all duration-300 ${isDragging ? 'bg-orange-500' : 'bg-white/10 group-hover:bg-orange-500/20'}`}>
              {isDragging ? (
                <FileText className="w-16 h-16 text-white" />
              ) : (
                <Upload className="w-16 h-16 text-zinc-400 group-hover:text-orange-500 transition-colors" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-white tracking-tight">
                {isDragging ? 'Bırakın!' : 'PDF Dosyası Yükleyin'}
              </p>
              <p className="text-sm font-bold text-zinc-500 mt-2">
                Sürükleyip bırakın veya tıklayarak seçin
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <FileText className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-bold text-zinc-500">.PDF dosyaları desteklenir</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

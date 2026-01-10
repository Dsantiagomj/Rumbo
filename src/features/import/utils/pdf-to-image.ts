/**
 * PDF to Image Converter (Client-side)
 * Converts PDF files to PNG images using pdf.js in the browser
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for Next.js
if (typeof window !== 'undefined') {
  // Use the worker from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';
}

export interface PDFToImageOptions {
  scale?: number; // Rendering scale (default: 2.0 for high quality)
  maxPages?: number; // Maximum number of pages to convert (default: 10)
  password?: string; // Optional password for encrypted PDFs
}

export interface ConvertedPage {
  pageNumber: number;
  imageData: string; // base64 PNG data (without data:image/png;base64, prefix)
  width: number;
  height: number;
}

/**
 * Convert PDF to PNG images
 * @param base64PDF - Base64 encoded PDF content
 * @param options - Conversion options
 * @returns Array of converted pages as base64 PNG images
 */
export async function convertPDFToImages(
  base64PDF: string,
  options: PDFToImageOptions = {},
): Promise<ConvertedPage[]> {
  const { scale = 2.0, maxPages = 10, password } = options;

  try {
    // Decode base64 to binary
    const binaryString = atob(base64PDF);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Load PDF document (with optional password)
    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      password: password || '',
    });
    const pdf = await loadingTask.promise;

    const numPages = Math.min(pdf.numPages, maxPages);
    const convertedPages: ConvertedPage[] = [];

    // Convert each page to PNG
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      // Convert canvas to PNG base64
      const imageDataURL = canvas.toDataURL('image/png');
      const base64PNG = imageDataURL.split(',')[1]; // Remove "data:image/png;base64," prefix

      convertedPages.push({
        pageNumber: pageNum,
        imageData: base64PNG,
        width: viewport.width,
        height: viewport.height,
      });

      // Clean up
      page.cleanup();
    }

    return convertedPages;
  } catch (error: unknown) {
    console.error('PDF to Image conversion error:', error);

    // Check for password-related errors
    const errorObj = error as { name?: string; message?: string };
    if (
      errorObj.name === 'PasswordException' ||
      errorObj.message?.includes('password') ||
      errorObj.message?.includes('encrypted') ||
      errorObj.message?.includes('PasswordException')
    ) {
      throw new Error(
        password
          ? 'Contraseña incorrecta. El PDF no se pudo desencriptar.'
          : 'El PDF está protegido con contraseña. Por favor ingresa tu número de identificación.',
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('El archivo PDF está corrupto o no es válido');
      }
      if (error.message.includes('worker')) {
        throw new Error('Error al cargar el procesador de PDF. Por favor recarga la página.');
      }
    }

    throw new Error('No se pudo convertir el PDF a imagen. Verifica que sea un PDF válido.');
  }
}

/**
 * Estimate the size of converted images
 * Useful for showing progress or validating file size limits
 */
export function estimateConvertedSize(
  originalPDFSize: number,
  numPages: number,
  scale = 2.0,
): number {
  // Rough estimation: PNG images are typically 2-4x larger than PDF per page
  // at scale 2.0. This is a conservative estimate.
  const avgPageSize = (originalPDFSize / numPages) * 3 * scale;
  return avgPageSize * numPages;
}

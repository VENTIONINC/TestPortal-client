// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export interface BrowserDownloadOptions {
  file: Blob | string;
  fileName: string;
  mimeType?: string;
}

export const sanitizeDownloadFilename = (value: string) =>
  Array.from(value)
    .map((character) => {
      const code = character.charCodeAt(0);

      if (code <= 31 || '<>:"/\\|?*'.includes(character)) {
        return '-';
      }

      return character;
    })
    .join('');

export const getDownloadFilename = (headers: Headers | undefined, fallbackName: string) => {
  const contentDisposition = headers?.get('content-disposition');

  if (!contentDisposition) {
    return sanitizeDownloadFilename(fallbackName);
  }

  const utfMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  const basicMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  const fileName = utfMatch?.[1] ?? basicMatch?.[1];

  if (!fileName) {
    return sanitizeDownloadFilename(fallbackName);
  }

  try {
    return sanitizeDownloadFilename(decodeURIComponent(fileName));
  } catch {
    return sanitizeDownloadFilename(fileName);
  }
};

export const triggerBrowserDownload = ({ file, fileName, mimeType }: BrowserDownloadOptions) => {
  const blob =
    typeof file === 'string'
      ? new Blob([file], { type: mimeType ?? 'application/octet-stream' })
      : file.type || !mimeType
        ? file
        : new Blob([file], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = sanitizeDownloadFilename(fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export type ClipboardResult = 'success' | 'denied' | 'unsupported';

export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'success';
    }
  } catch {
    return 'denied';
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok ? 'success' : 'denied';
  } catch {
    return 'unsupported';
  }
}
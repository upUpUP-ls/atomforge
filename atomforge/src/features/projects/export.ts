import JSZip from 'jszip';
import {
  buildCodeRepositoryFiles,
  sanitizeRepoDirName,
  type CodeRepositoryInput,
} from './code-repository';

/**
 * 触发浏览器下载 Blob 文件。
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * 打包并下载完整代码仓库（zip）。
 */
export async function downloadCodeRepository(
  input: CodeRepositoryInput,
): Promise<void> {
  const files = buildCodeRepositoryFiles(input);
  const rootDir = sanitizeRepoDirName(input.projectTitle);
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    zip.file(`${rootDir}/${path}`, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${rootDir}.zip`);
}

/**
 * @deprecated 仅保留兼容；请使用 downloadCodeRepository。
 */
export function downloadHtml(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, filename.endsWith('.html') ? filename : `${filename}.html`);
}

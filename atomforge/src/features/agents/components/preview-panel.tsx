'use client';

import { useState } from 'react';
import { Monitor, Smartphone, Maximize2, Minimize2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadCodeRepository } from '@/features/projects/export';
import { fetchLatestArtifacts } from '@/features/projects/artifacts-client';
import type { CodeVersion } from '../lib/editor-state';

type ViewportMode = 'desktop' | 'mobile';

interface PreviewPanelProps {
  projectId: string;
  projectPrompt: string;
  html: string | null;
  running: boolean;
  projectTitle: string;
  codeVersions: CodeVersion[];
  selectedVersion: number | 'latest';
  onSelectVersion: (version: number | 'latest') => void;
}

/**
 * 右侧 Preview 面板：iframe 预览、视口切换、版本选择、代码仓库导出。
 */
export function PreviewPanel({
  projectId,
  projectPrompt,
  html,
  running,
  projectTitle,
  codeVersions,
  selectedVersion,
  onSelectVersion,
}: PreviewPanelProps) {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [fullscreen, setFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const iframeWidth = viewport === 'mobile' ? '375px' : '100%';

  /**
   * 下载 zip 代码仓库（含 public/ 与 docs/），而非单个 HTML。
   */
  const handleExport = async () => {
    if (!html || exporting) return;

    setExporting(true);
    try {
      const artifacts = await fetchLatestArtifacts(projectId);
      const codeFromVersion =
        selectedVersion === 'latest'
          ? html
          : codeVersions.find((v) => v.version === selectedVersion)?.content ?? html;

      await downloadCodeRepository({
        projectTitle,
        projectPrompt,
        artifacts: { ...artifacts, code: codeFromVersion },
        version: selectedVersion,
      });
      toast.success('代码仓库已下载');
    } catch (err) {
      const message = err instanceof Error ? err.message : '导出失败';
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className={`flex h-full flex-col bg-muted/20 ${
        fullscreen ? 'fixed inset-0 z-50 bg-background' : ''
      }`}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
        <span className="text-sm font-medium">Preview</span>
        <div className="flex flex-wrap items-center gap-1">
          {codeVersions.length > 1 && (
            <select
              value={selectedVersion === 'latest' ? 'latest' : selectedVersion}
              onChange={(e) => {
                const val = e.target.value;
                onSelectVersion(
                  val === 'latest' ? 'latest' : Number(val),
                );
              }}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs outline-none"
            >
              <option value="latest">最新版本</option>
              {codeVersions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} ·{' '}
                  {new Date(v.createdAt).toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </option>
              ))}
            </select>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleExport}
            disabled={!html || exporting}
            title="下载代码仓库（zip）"
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
          </Button>
          <Button
            variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => setViewport('desktop')}
            title="Desktop"
          >
            <Monitor className="size-3.5" />
          </Button>
          <Button
            variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => setViewport('mobile')}
            title="Mobile"
          >
            <Smartphone className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setFullscreen((f) => !f)}
            title={fullscreen ? '退出全屏' : '全屏预览'}
          >
            {fullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-4">
        {html ? (
          <div
            className="transition-all duration-300"
            style={{ width: iframeWidth, maxWidth: '100%' }}
          >
            <iframe
              title="App Preview"
              srcDoc={html}
              sandbox="allow-scripts allow-forms allow-modals"
              className={`w-full rounded-lg border bg-white shadow-sm ${
                viewport === 'mobile'
                  ? 'h-[667px]'
                  : 'min-h-[480px] h-[calc(100vh-12rem)]'
              }`}
            />
          </div>
        ) : (
          <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            {running ? (
              <>
                <div className="mb-2 size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Agent 正在生成应用...
              </>
            ) : (
              '流水线完成后在此预览生成的应用'
            )}
          </div>
        )}
      </div>
    </div>
  );
}

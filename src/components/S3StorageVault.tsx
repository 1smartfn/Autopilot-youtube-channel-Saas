import React, { useState } from 'react';
import { 
  HardDrive, 
  Lock, 
  Folder, 
  FileVideo, 
  FileImage, 
  FileText, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Search,
  RefreshCw,
  Database
} from 'lucide-react';
import { S3File } from '../types';
import { ComponentTag } from './ComponentTag';

interface S3StorageVaultProps {
  userId: string;
  files: S3File[];
  onPreviewFile: (file: S3File) => void;
}

export const S3StorageVault: React.FC<S3StorageVaultProps> = ({
  userId,
  files,
  onPreviewFile
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const bucketName = `tubepilot-vault-${userId}`;

  const folders = [
    { id: 'all', name: 'All Objects', count: files.length },
    { id: 'master_1080p', name: 'master_1080p/', count: files.filter(f => f.key.includes('master_1080p')).length },
    { id: 'thumbnails', name: 'thumbnails/', count: files.filter(f => f.key.includes('thumbnails')).length },
    { id: 'transcripts', name: 'transcripts/', count: 2 }
  ];

  const filteredFiles = files.filter((f) => {
    const matchesFolder = selectedFolder === 'all' || f.key.includes(selectedFolder);
    const matchesSearch = f.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(`s3://${bucketName}/${key}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* S3 Bucket Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <ComponentTag id="SEC-S3-HEADER" name="S3 Storage Vault Header Banner" category="section" size="xs" />
              <h1 className="text-base font-bold text-white tracking-tight">
                s3://{bucketName}
              </h1>
              <span className="rounded bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300 border border-violet-500/30">
                Encrypted: AWS-KMS
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              Dedicated isolated tenant bucket. Video renders, audio stems, and thumbnails are stored securely with IAM policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs">
            <span className="text-zinc-500">Region: </span>
            <span className="font-mono font-semibold text-zinc-200">us-east-1 (N. Virginia)</span>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 text-xs text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>Per-User ACL Enforced</span>
          </div>
        </div>
      </div>

      {/* Storage Capacity & Encryption Summary */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <ComponentTag id="CARD-S3-METRICS" name="S3 Storage Capacity & Encryption Policy Cards" category="metric" size="xs" />
          <span className="text-[11px] font-mono text-zinc-400">Bucket Capacity</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>S3 Storage Quota</span>
            <Database className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">4.82 GB</span>
            <span className="text-xs text-zinc-500">/ 100.00 GB Tier Limit</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: '4.82%' }} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Bucket Encryption</span>
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-base font-bold text-emerald-400">
            AES-256 (SSE-S3 + KMS)
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">All video chunks encrypted at rest and in transit (TLS 1.3)</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Presigned URL Policy</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-base font-bold text-cyan-400">
            60-Minute Expiry Window
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Automated YouTube upload worker fetches video via signed HTTP request</p>
        </div>
      </div>
      </div>

      {/* S3 Objects Browser */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        
        {/* Sub-toolbar */}
        <div className="p-3 sm:p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <ComponentTag id="CARD-S3-TABLE" name="S3 Bucket Asset Files Table" category="card" size="xs" />
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition ${
                  selectedFolder === folder.id
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/60'
                }`}
              >
                <Folder className="h-3.5 w-3.5 shrink-0" />
                <span>{folder.name}</span>
                <span className="rounded-full bg-zinc-900/80 px-1.5 text-[10px]">
                  {folder.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search S3 keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Objects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Object Key (S3 URI)</th>
                <th className="px-4 py-3">MIME Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Server-Side Encryption</th>
                <th className="px-4 py-3">Uploaded Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
              {filteredFiles.map((file) => {
                const isVideo = file.type.includes('video');
                const isImage = file.type.includes('image');

                return (
                  <tr key={file.key} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-200 font-medium">
                      <div className="flex items-center gap-2">
                        {isVideo && <FileVideo className="h-4 w-4 text-violet-400 shrink-0" />}
                        {isImage && <FileImage className="h-4 w-4 text-pink-400 shrink-0" />}
                        {!isVideo && !isImage && <FileText className="h-4 w-4 text-zinc-400 shrink-0" />}
                        <span className="truncate max-w-xs">{file.key}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-400">
                      {file.type}
                    </td>

                    <td className="px-4 py-3 text-zinc-300">
                      {formatBytes(file.sizeBytes)}
                    </td>

                    <td className="px-4 py-3 text-emerald-400">
                      {file.encryption}
                    </td>

                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(file.uploadedAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(file.key)}
                          className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
                          title="Copy s3:// URI"
                        >
                          {copiedKey === file.key ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onPreviewFile(file)}
                          className="rounded bg-violet-600/20 px-2 py-1 text-[10px] font-semibold text-violet-300 hover:bg-violet-600/30 border border-violet-500/30"
                        >
                          Preview
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      </div>
    </div>
  );
};

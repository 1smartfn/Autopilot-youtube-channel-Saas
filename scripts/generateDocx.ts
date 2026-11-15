import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  convertInchesToTwip
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createRoadmapDocxBuffer(): Promise<Buffer> {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' }
  };

  const doc = new Document({
    creator: 'TubePilot Creator Studio',
    title: 'TubePilot Roadmap Tree & Autopilot Pipelines Presentation',
    description: 'Executive Architecture Roadmap Tree and 5-Stage Content Automation Pipeline Presentation',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1)
            }
          }
        },
        children: [
          // TITLE / HEADER BLOCK
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: 'TubePilot AI Studio',
                bold: true,
                size: 44,
                color: 'DC2626',
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({
                text: 'Autonomous YouTube Shorts Production & Multi-Channel Distribution',
                bold: true,
                size: 26,
                color: '1F2937',
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
            children: [
              new TextRun({
                text: 'EXECUTIVE ROADMAP TREE & 5-STAGE AUTOPILOT PIPELINE SPECIFICATION',
                italics: true,
                size: 20,
                color: '4B5563',
                font: 'Calibri'
              })
            ]
          }),

          // METADATA BOX
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Author: ', bold: true, size: 19 }),
                          new TextRun({ text: 'TubePilot Core Architecture Group  |  ', size: 19 }),
                          new TextRun({ text: 'Target Audience: ', bold: true, size: 19 }),
                          new TextRun({ text: 'Founders, Creators, & Lead Engineers\n', size: 19 }),
                          new TextRun({ text: 'Core Video Model: ', bold: true, size: 19 }),
                          new TextRun({ text: 'Wan 2.1 Open-Source AI (Zero API Billing)  |  ', size: 19 }),
                          new TextRun({ text: 'Version: ', bold: true, size: 19 }),
                          new TextRun({ text: '3.4.0 Production Build', size: 19 })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // SECTION 1: EXECUTIVE SUMMARY
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 140 },
            children: [
              new TextRun({
                text: '1. Executive Summary & Core Value Proposition',
                bold: true,
                size: 28,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 140 },
            children: [
              new TextRun({
                text: 'TubePilot is an enterprise-grade autonomous operating system for faceless and programmatic YouTube content creation. Unlike traditional generation suites that rely on expensive proprietary video APIs charging $0.50-$2.00 per short, TubePilot routes workloads through dedicated decentralized GPU nodes hosting the open-source Wan 2.1 neural video diffusion model, achieving ',
                size: 22
              }),
              new TextRun({
                text: '100% Free Video Generations with Zero Per-Minute API Billing.',
                bold: true,
                color: '047857',
                size: 22
              })
            ]
          }),

          // SECTION 2: ARCHITECTURE ROADMAP TREE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 140 },
            children: [
              new TextRun({
                text: '2. The 5-Level Architecture Roadmap Tree',
                bold: true,
                size: 28,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 160 },
            children: [
              new TextRun({
                text: 'The architecture is organized hierarchically into five modular tiers from raw internet trend intelligence down to automated multi-channel revenue generation:',
                size: 22
              })
            ]
          }),

          // TABLE: 5 ROADMAP LEVELS
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '1E293B' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Tier / Level', bold: true, color: 'FFFFFF', size: 20 })] })]
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '1E293B' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'System Module', bold: true, color: 'FFFFFF', size: 20 })] })]
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '1E293B' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Capabilities & Technological Role', bold: true, color: 'FFFFFF', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'FEF2F2' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Level 1', bold: true, color: 'B91C1C', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Trend Radar & Intelligence Ingestion', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Real-time YouTube trend scraper, Target Competitor Channel Cloner, high-velocity topic discovery, virality score ranking (0-99).', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'FFFBEB' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Level 2', bold: true, color: 'B45309', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Creative AI Generation Engine', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Hypnotic hook synthesis, 5-scene viral scripting engine, Wan 2.1 cinematic prompt constructor, dynamic SVG/PNG thumbnail designer.', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Level 3', bold: true, color: '15803D', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Distributed GPU Worker Render Farm', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Decentralized GPU nodes running Wan 2.1 neural video inference, ElevenLabs/TTS voice narration, FFmpeg rendering, and direct upload to isolated AWS S3 KMS buckets.', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F0F9FF' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Level 4', bold: true, color: '0369A1', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Orchestration & Sheet Sync Stream', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Two-way live Google Sheets sync (TubePilot_Autopilot_Queue), FIFO queue manager, cluster heartbeat telemetry, and searchable activity audit stream.', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'FAF5FF' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Level 5', bold: true, color: '7E22CE', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Multi-Channel Distribution & Analytics', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '7-Day interactive drag-and-drop calendar matrix, automated YouTube API dispatcher, Pioneer multi-tenant payment gateway, and audience retention metrics.', size: 20 })] })]
                  })
                ]
              })
            ]
          }),

          // SECTION 3: 5-STAGE AUTOPILOT PIPELINE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 140 },
            children: [
              new TextRun({
                text: '3. End-to-End 5-Stage Autopilot Content Pipeline',
                bold: true,
                size: 28,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 140 },
            children: [
              new TextRun({
                text: 'When the 24/7 Autopilot loop is active, every video production cycle flows autonomously through the following 5 continuous stages:',
                size: 22
              })
            ]
          }),

          // STAGE 1 DETAIL
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Stage 1: Trend Radar Intelligence (Discovery & Cloner)',
                bold: true,
                size: 24,
                color: 'DC2626'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({
                text: '• Mechanism: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'The engine queries real-time algorithmic signals and parses any connected YouTube competitor channel (via Channel Cloner). It extracts viral hooks, view velocities, and trending themes.\n',
                size: 21
              }),
              new TextRun({
                text: '• Output: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'A structured trend object with topic, hook, viral score (0-100%), and competitor angle.',
                size: 21
              })
            ]
          }),

          // STAGE 2 DETAIL
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Stage 2: Google Sheets Live Sync (Production Ledger)',
                bold: true,
                size: 24,
                color: '059669'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({
                text: '• Mechanism: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'The newly formulated video concept is dispatched immediately to the Google Drive spreadsheet "TubePilot_Autopilot_Queue".\n',
                size: 21
              }),
              new TextRun({
                text: '• Output: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'A permanent row with status "idea_logged", guaranteeing full auditability and collaborative tracking across creators and editors.',
                size: 21
              })
            ]
          }),

          // STAGE 3 DETAIL
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Stage 3: Wan 2.1 Free Open Video AI (Neural Prompt Synthesis)',
                bold: true,
                size: 24,
                color: 'D97706'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({
                text: '• Mechanism: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'The creative engine synthesizes ultra-detailed prompts tailored specifically for the Wan 2.1 video diffusion architecture, including cinematic lighting, 9:16 vertical framing, camera motions (pan, zoom, macro tilt), and physical realism tokens.\n',
                size: 21
              }),
              new TextRun({
                text: '• Output: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'Full 5-scene prompt sequence and optimized script narration.',
                size: 21
              })
            ]
          }),

          // STAGE 4 DETAIL
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Stage 4: GPU Worker Node Render Farm (Assembly & S3 Staging)',
                bold: true,
                size: 24,
                color: '2563EB'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({
                text: '• Mechanism: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'A distributed GPU cluster node accepts the render job. It generates neural video frames using Wan 2.1, runs voice narration synthesis, mixes ambient audio stems, and encodes a 1080x1920 MP4 via FFmpeg. Once rendered, the file is deposited into tenant-isolated AWS S3.\n',
                size: 21
              }),
              new TextRun({
                text: '• Output: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'Secure MP4 asset in s3://tubepilot-storage-vault with status upgraded to "s3_uploaded".',
                size: 21
              })
            ]
          }),

          // STAGE 5 DETAIL
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Stage 5: YouTube Auto-Post & 7-Day Calendar Dispatch',
                bold: true,
                size: 24,
                color: '7C3AED'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 160 },
            children: [
              new TextRun({
                text: '• Mechanism: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'The scheduler evaluates the channel\'s daily publishing quota. The video is either uploaded immediately with high-CTR tags, SEO descriptions, and thumbnail, or slotted into the 7-day interactive dispatch calendar at peak engagement hours.\n',
                size: 21
              }),
              new TextRun({
                text: '• Output: ',
                bold: true,
                size: 21
              }),
              new TextRun({
                text: 'Live public YouTube Short, synchronized Google Sheet status ("youtube_uploaded"), and real-time dashboard analytics tracking.',
                size: 21
              })
            ]
          }),

          // SECTION 4: PLATFORM COCKPIT & UI MODULES
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 140 },
            children: [
              new TextRun({
                text: '4. Platform Workspaces & Cockpit Modules',
                bold: true,
                size: 28,
                color: '1E3A8A'
              })
            ]
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '1E293B' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Cockpit View', bold: true, color: 'FFFFFF', size: 20 })] })]
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '1E293B' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Core Functionality & User Controls', bold: true, color: 'FFFFFF', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '📊 Dashboard', bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'High-density metrics, subscriber trajectory charts, audience niche donut breakdown, top viral leaderboards, and audit activity stream.', size: 20 })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '⚡ Autopilot Studio', bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Launch full automation loop, monitor 5-stage progress ribbons, clone competitor YouTube URLs, and review viral surge notifications.', size: 20 })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '📅 Content Calendar', bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '7-day visual grid with drag-and-drop video slots, backlog priority queue, and batch rerender/delete controls.', size: 20 })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '📑 Google Sheets', bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Live spreadsheet view synced directly with Google Drive, inline editing, column filtering, and one-click CSV export.', size: 20 })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '🖥️ GPU Worker Farm', bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Multi-node telemetry monitor with live CPU/VRAM temperatures, queue depths, memory utilization, and zero-cost worker nodes.', size: 20 })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '🗄️ S3 Storage Vault', bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'AWS-KMS encrypted bucket browser for rendered MP4 files, audio stems, prompts, and thumbnail image assets.', size: 20 })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '💳 Pioneer Billing', bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Multi-tier subscription billing with concurrency limit sliders, invoices, and PCI-DSS compliant checkout integration.', size: 20 })] })] })
                ]
              })
            ]
          }),

          // SECTION 5: CONCLUSION & SIGN-OFF
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 140 },
            children: [
              new TextRun({
                text: '5. Summary & Operational Roadmap',
                bold: true,
                size: 28,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 200 },
            children: [
              new TextRun({
                text: 'By coupling open-source video AI (Wan 2.1) with two-way Google Sheets orchestration and automated YouTube dispatch, TubePilot reduces production overhead from hours of manual editing to completely hands-off execution. The resulting architecture scales seamlessly from a single solo creator to multi-channel media holding companies.',
                size: 22
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({
                text: '— Generated by TubePilot Engineering System',
                italics: true,
                color: '6B7280',
                size: 20
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

// Generate the docx file to public directory
async function main() {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Generating TubePilot Roadmap and Pipelines Presentation .docx...');
  const buffer = await createRoadmapDocxBuffer();
  const filePath = path.join(publicDir, 'TubePilot_Roadmap_and_Pipelines_Presentation.docx');
  fs.writeFileSync(filePath, buffer);
  console.log(`Successfully generated DOCX at: ${filePath} (${buffer.length} bytes)`);
}

main().catch(console.error);

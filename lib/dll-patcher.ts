/**
 * dll-patcher.ts
 * TypeScript port of patcher.js - patches the base_loader.exe binary with project config
 */

import { Project } from './dll-supabase';

const OBFC_KEY = 13;

function shiftString(str: string): string {
  return str.split('').map(c => String.fromCharCode(c.charCodeAt(0) + OBFC_KEY)).join('');
}

function strBuf(str: string, maxLen: number): Buffer {
  const buf = Buffer.alloc(maxLen, 0);
  Buffer.from(str, 'binary').copy(buf, 0, 0, Math.min(str.length, maxLen - 1));
  return buf;
}

function findPattern(haystack: Buffer, needle: Buffer): number {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

function patchString(buf: Buffer, oldStr: string, newStr: string): number {
  const marker = Buffer.from(oldStr, 'binary');
  const maxLen = oldStr.length;
  const replacement = strBuf(newStr, maxLen + 1).slice(0, maxLen);
  let count = 0;
  let idx = findPattern(buf, marker);
  while (idx !== -1) {
    replacement.copy(buf, idx);
    count++;
    idx = findPattern(buf, marker);
  }
  return count;
}

export interface PatchResult {
  ok: boolean;
  buffer?: Buffer;
  error?: string;
}

export function patchExe(baseExeBuf: Buffer, project: Project, apiUrl: string, iconBuf: Buffer | null): PatchResult {
  let buf = Buffer.from(baseExeBuf);

  const patches: { old: string; val: string }[] = [
    { old: '__PROJECT_NAME__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',    val: project.name },
    { old: '__TARGET_PROCESS__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',    val: project.process },
    { old: '__API_URL__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', val: shiftString(apiUrl) },
    { old: '__COLOR__xxxxxxx',                                                   val: project.color || '#00a0ff' },
    { old: '__KA_NAME__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',    val: project.keyAuthName  || 'LOUDER' },
    { old: '__KA_OWNER__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',   val: project.keyAuthOwner || 'DqsBm5lI0dtaUwfV65Dvt1rGdfzMPpw3' },
    { old: '__KA_VER__xxxxxx',                                                   val: project.keyAuthVer   || '1.0' },
    { old: '__KA_SECRET__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', val: project.keyAuthSecret || 'mqyA0yJr1m7Mzgi96nRlzOGlUnm1WWoxNCrnO3oHGqdgSIKb' },
  ];

  for (const p of patches) {
    const n = patchString(buf, p.old, p.val);
    if (n === 0) {
      const isOptional = p.old.includes('__COLOR__') || p.old.includes('__KA_');
      if (!isOptional) {
        return { ok: false, error: `Marker '${p.old.substring(0, 20)}' not found in base_loader.exe` };
      }
    }
  }

  // Try to inject icon using resedit (optional)
  if (iconBuf && iconBuf.length > 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ResEdit = require('resedit');
      const lf = ResEdit.NtExecutable.fromBuffer(buf);
      const resources = ResEdit.NtExecutableResource.from(lf);
      const iconFile = ResEdit.IconFile.fromBuffer(iconBuf);
      const iconGroupEntries = ResEdit.Resource.IconGroupEntry.fromEntries(resources.entries);
      if (iconGroupEntries.length > 0) {
        iconGroupEntries[0].replaceIcons(iconFile.icons);
        iconGroupEntries[0].outputToResourceEntries(resources.entries);
      } else {
        const entry = new ResEdit.Resource.IconGroupEntry();
        entry.id = 101;
        entry.replaceIcons(iconFile.icons);
        entry.outputToResourceEntries(resources.entries);
      }
      resources.outputResource(lf);
      buf = Buffer.from(lf.generate());
    } catch (iconErr) {
      console.warn('[Patcher] Icon injection failed (non-fatal):', (iconErr as Error).message);
    }
  }

  return { ok: true, buffer: buf };
}

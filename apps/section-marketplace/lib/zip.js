import { inflateRawSync } from "node:zlib";

const LOCAL_FILE_HEADER = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const STORE_ONLY = 0;
const DEFLATE = 8;

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function normalizeZipPath(path) {
  return String(path)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");
}

function assertSafeZipPath(path) {
  const normalized = normalizeZipPath(path);
  const parts = normalized.endsWith("/") ? normalized.slice(0, -1).split("/") : normalized.split("/");
  if (!normalized || parts.some((part) => part === ".." || part === "." || !part)) {
    throw new Error("Unsafe zip path.");
  }
  return normalized;
}

export function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const [rawPath, rawContent] of Object.entries(files)) {
    const fileName = Buffer.from(assertSafeZipPath(rawPath), "utf8");
    const content = Buffer.isBuffer(rawContent) ? rawContent : Buffer.from(String(rawContent), "utf8");
    const checksum = crc32(content);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(LOCAL_FILE_HEADER, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(STORE_ONLY, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, fileName, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(CENTRAL_DIRECTORY_HEADER, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(STORE_ONLY, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, fileName);

    offset += localHeader.length + fileName.length + content.length;
  }

  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const end = Buffer.alloc(22);
  const fileCount = Object.keys(files).length;
  end.writeUInt32LE(END_OF_CENTRAL_DIRECTORY, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(fileCount, 8);
  end.writeUInt16LE(fileCount, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

export function isZipBuffer(buffer) {
  return buffer.length >= 4 && buffer.readUInt32LE(0) === LOCAL_FILE_HEADER;
}

export function extractStoredZip(buffer) {
  const files = {};
  let offset = 0;

  while (offset + 30 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature === CENTRAL_DIRECTORY_HEADER || signature === END_OF_CENTRAL_DIRECTORY) break;
    if (signature !== LOCAL_FILE_HEADER) throw new Error("Unsupported zip structure.");

    const flags = buffer.readUInt16LE(offset + 6);
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);

    if (flags & 0x0008) throw new Error("Zip data descriptors are not supported.");
    if (method !== STORE_ONLY && method !== DEFLATE) throw new Error("Unsupported zip compression method.");

    const nameStart = offset + 30;
    const nameEnd = nameStart + nameLength;
    const contentStart = nameEnd + extraLength;
    const contentEnd = contentStart + compressedSize;
    if (contentEnd > buffer.length) throw new Error("Zip entry is truncated.");

    const path = assertSafeZipPath(buffer.subarray(nameStart, nameEnd).toString("utf8"));
    if (!path.endsWith("/")) {
      const rawContent = buffer.subarray(contentStart, contentEnd);
      const content = method === DEFLATE ? inflateRawSync(rawContent) : rawContent;
      if (content.length !== uncompressedSize) throw new Error("Zip entry size mismatch.");
      files[path] = content.toString("utf8");
    }
    offset = contentEnd;
  }

  return files;
}

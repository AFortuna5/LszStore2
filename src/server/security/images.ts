import "server-only";

import sharp from "sharp";

export type AllowedImageType = "image/jpeg" | "image/png" | "image/webp";

export function hasValidImageSignature(bytes: Uint8Array, mimeType: AllowedImageType) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
  }
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

export async function sanitizeUploadedImage(bytes: Uint8Array, mimeType: AllowedImageType) {
  if (!hasValidImageSignature(bytes, mimeType)) throw new Error("INVALID_IMAGE_SIGNATURE");

  const image = sharp(bytes, { failOn: "error", limitInputPixels: 67_108_864 })
    .rotate()
    .resize({ width: 4096, height: 4096, fit: "inside", withoutEnlargement: true });

  if (mimeType === "image/jpeg") return new Uint8Array(await image.jpeg({ quality: 90 }).toBuffer());
  if (mimeType === "image/png") return new Uint8Array(await image.png({ compressionLevel: 9 }).toBuffer());
  return new Uint8Array(await image.webp({ quality: 90 }).toBuffer());
}

export interface VCardFixedFields {
  name: boolean;
  website: boolean;
  bio: boolean;
}

export interface VCardSocialEntry {
  name: string;
  url: string;
}

function encodeQuotedPrintableUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);

  return Array.from(bytes, (byte) => {
    const char = String.fromCharCode(byte);
    const isSafeAscii = byte >= 0x20 && byte <= 0x7e && char !== "=";

    return isSafeAscii
      ? char
      : `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  }).join("");
}

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildVCard(
  fixed: VCardFixedFields,
  emails: string[],
  phones: string[],
  socials: VCardSocialEntry[],
): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  if (fixed.name) {
    lines.push(
      `N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encodeQuotedPrintableUtf8("Schäfer")};${encodeQuotedPrintableUtf8("Ulrich-Matthias")};;;`,
    );
    lines.push(
      `FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encodeQuotedPrintableUtf8("Ulrich-Matthias Schäfer")}`,
    );
  }

  if (fixed.website) {
    lines.push("URL:https://fuzzyma.de");
  }

  if (fixed.bio) {
    lines.push(
      `NOTE:${escapeVCardValue("Freelance Frontend Developer & Consultant")}`,
    );
  }

  for (const email of emails) {
    lines.push(`EMAIL:${escapeVCardValue(email)}`);
  }

  for (const phone of phones) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(phone)}`);
  }

  for (const social of socials) {
    lines.push(
      `X-SOCIALPROFILE;TYPE=${escapeVCardValue(social.name)}:${social.url}`,
    );
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

"use client";

import { SignatureBlockProps } from "../../app/types/signature.types";

export function SignatureBlock({
  name,
  title,
  company,
  email,
  phone,
  signedAt,
  signatureUrl,
}: SignatureBlockProps) {
    
  const url = signatureUrl.startsWith("http")
    ? signatureUrl
    : `http://localhost:8000/${signatureUrl}`;

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex gap-4 items-center">
      <img src={url} alt="Signature" className="h-12 object-contain" />
      <div className="text-xs text-gray-700">
        <p className="font-semibold">{name}</p>
        <p>{title} | {company}</p>
        {email && <p>{email}</p>}
        {phone && <p>{phone}</p>}
        {signedAt && (
          <p className="text-gray-500 text-[10px] mt-1">
            Signé le {new Date(signedAt).toLocaleDateString()} {/* format lisible */}
          </p>
        )}
      </div>
    </div>
  );
}
"use client";

import { QRCodeSVG } from "qrcode.react";

type QRCodeProps = {
  tokenId: number;
};

export default function QRCode({ tokenId }: QRCodeProps) {
  const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const verificationUrl = `${baseUrl}/verify/${tokenId}`;

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "30px",
        padding: "25px",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>Scan to Verify</h2>

      <QRCodeSVG
        value={verificationUrl}
        size={180}
        bgColor="#ffffff"
        fgColor="#000000"
      />

      <p
  style={{
    marginTop: "15px",
    color: "#4b5563",
    fontSize: "14px",
    textAlign: "center",
    wordBreak: "break-word",
    maxWidth: "100%",
  }}
>
  Scan this QR code to verify this craft batch.
</p>
    </div>
  );
}
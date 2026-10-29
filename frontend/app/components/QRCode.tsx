"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";

type QRCodeProps = {
  tokenId: number;
};

export default function QRCode({ tokenId }: QRCodeProps) {
  // Start with default or env
  const initialBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://10.120.16.33:3000";

  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [customHost, setCustomHost] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // If user opened page via an IP or custom domain, use that origin directly
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setBaseUrl(window.location.origin);
      return;
    }

    // Otherwise, dynamically fetch the active LAN IP from the server
    fetch("/api/network-info")
      .then((r) => r.json())
      .then((data) => {
        if (data?.url) {
          setBaseUrl(data.url);
        }
      })
      .catch(() => {
        // Fallback to initialBaseUrl
      });
  }, []);

  const verificationUrl = `${baseUrl.replace(/\/$/, "")}/verify/${tokenId}`;

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
        backgroundColor: "#ffffff",
      }}
    >
      <h2 style={{ margin: "0 0 16px", color: "#111827", fontSize: "1.25rem" }}>
        Scan to Verify
      </h2>

      <div
        style={{
          padding: "12px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <QRCodeSVG
          value={verificationUrl}
          size={190}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
        />
      </div>

      <p
        style={{
          marginTop: "14px",
          color: "#4b5563",
          fontSize: "13px",
          textAlign: "center",
          marginBottom: "4px",
        }}
      >
        Scan this QR code with your phone to verify this craft batch.
      </p>

      <p
        style={{
          margin: "4px 0 10px",
          color: "#059669",
          fontSize: "12px",
          wordBreak: "break-all",
          maxWidth: "320px",
          fontFamily: "monospace",
          fontWeight: 600,
        }}
      >
        {verificationUrl}
      </p>

      {/* Helper to switch host if on restricted Wi-Fi / Tunnel */}
      <div style={{ marginTop: "6px", fontSize: "11px", color: "#6b7280" }}>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => {
              setCustomHost(baseUrl);
              setIsEditing(true);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            Change QR URL / IP
          </button>
        ) : (
          <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
            <input
              type="text"
              value={customHost}
              onChange={(e) => setCustomHost(e.target.value)}
              placeholder="e.g. http://10.120.16.33:3000"
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "11px",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (customHost.trim()) setBaseUrl(customHost.trim());
                setIsEditing(false);
              }}
              style={{
                backgroundColor: "#059669",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "2px 8px",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Set
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

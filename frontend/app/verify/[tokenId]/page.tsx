import Link from "next/link";
import { getBlockchainBatch } from "../../lib/getBlockchainBatch";
import QRCode from "../../components/QRCode";

type PageProps = {
  params: Promise<{
    tokenId: string;
  }>;
};

export default async function VerifyPage({ params }: PageProps) {
  const { tokenId } = await params;

  const requestedTokenId = Number(tokenId);

if (!Number.isInteger(requestedTokenId) || requestedTokenId <= 0) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        backgroundColor: "#e5e7eb",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid #d1d5db",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            margin: "0 auto 15px",
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            fontWeight: "bold",
          }}
        >
          ✕
        </div>

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
          }}
        >
          Invalid Batch Number
        </h1>

        <p
          style={{
            color: "#4b5563",
            fontSize: "18px",
          }}
        >
          Please enter a valid batch number.
        </p>

        <Link
          href="/verify"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 18px",
            backgroundColor: "#111827",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Back to Verification
        </Link>
      </div>
    </main>
  );
}

const batch = await getBlockchainBatch(requestedTokenId);
  if (!batch) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "50px 20px",
          backgroundColor: "#e5e7eb",
          fontFamily: "Arial, sans-serif",
          color: "#111827",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "18px",
            border: "1px solid #d1d5db",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: "bold",
            }}
          >
            ✕
          </div>

          <h1
            style={{
              fontSize: "32px",
              marginBottom: "10px",
            }}
          >
            Batch Not Found
          </h1>

          <p
            style={{
              color: "#4b5563",
              fontSize: "18px",
            }}
          >
            No craft product was found for Batch #{requestedTokenId}.
          </p>

          <p
            style={{
              color: "#6b7280",
            }}
          >
            Please check the QR code or batch number and try again.
          </p>

          <Link
            href="/verify"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 18px",
              backgroundColor: "#111827",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            Back to Verification
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        backgroundColor: "#e5e7eb",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div
  className="verification-card"
  style={{
    maxWidth: "700px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  }}
><div style={{ marginBottom: "20px" }}>
  <Link
    href="/"
    style={{
      color: "#374151",
      textDecoration: "none",
      fontWeight: "bold",
    }}
  >
    ← Back to Craft Chain
  </Link>
</div>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            Craft Chain
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#4b5563",
              marginTop: "8px",
            }}
          >
            Product Verification
          </p>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "25px",
            backgroundColor: batch.verified ? "#dcfce7" : "#fef3c7",
border: batch.verified
  ? "2px solid #22c55e"
  : "2px solid #f59e0b",
            borderRadius: "14px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: "#15803d",
            }}
          >
          {batch.verified ? "✓" : "⚠"}
          </div>

          <h2
  style={{
    margin: "8px 0",
    fontSize: "26px",
    color: batch.verified ? "#166534" : "#92400e",
  }}
>
  {batch.verified
    ? "CHECKPOINTS VERIFIED"
    : batch.checkpoints.length === 0
      ? "NO CHECKPOINTS"
      : "NOT FULLY VERIFIED"}
</h2>

          <p
  style={{
    margin: 0,
    color: "#166534",
  }}
>
  This craft product has a unique digital identity on the Craft Chain
  blockchain. Its recorded journey can be independently verified using
  blockchain transaction records.
</p>
        </div>

        <div
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            padding: "22px",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Batch #{batch.tokenId}
          </h2>

          <p>
            <strong>Product:</strong> {batch.productName}
          </p>

          <p>
            <strong>Artisan:</strong> {batch.artisan}
          </p>

          <p>
            <strong>Description:</strong> {batch.description}
          </p>

          <p style={{ marginBottom: 0 }}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color: "#15803d",
                fontWeight: "bold",
              }}
            >
              {batch.status}
            </span>
          </p>
        </div>

        <h2 style={{ marginBottom: "20px" }}>
          Journey
        </h2>

        <div>
          {batch.timeline.map((event) => (
            <div
              key={event.id}
              style={{
                padding: "18px",
                borderLeft:
  event.source === "BLOCKCHAIN_TRANSFER"
    ? "5px solid #2563eb"
    : event.source === "BLOCKCHAIN_CREATED"
    ? "5px solid #16a34a"
    : "5px solid #16a34a",
                backgroundColor: "#f9fafb",
                marginBottom: "12px",
                borderRadius: "0 10px 10px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <strong>{event.title}</strong>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    padding: "5px 9px",
                    borderRadius: "999px",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                  }}
                >
                  {event.type}
                </span>
              </div>

              <p
                style={{
                  margin: "6px 0",
                  color: "#4b5563",
                }}
              >
                {event.actor}
              </p>

              <p
                style={{
                  margin: "6px 0",
                  color: "#4b5563",
                }}
              >
                {event.description}
              </p>

              <div style={{ marginTop: "10px" }}>
                <small
                  style={{
                    display: "block",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  {event.timestamp}
                </small>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "8px",
                    fontSize: "13px",
                    wordBreak: "break-all",
                  }}
                >
                  <div>
                    <strong>Transaction: </strong>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#059669", textDecoration: "underline" }}
                    >
                      {event.transactionHash.slice(0, 18)}...{event.transactionHash.slice(-8)} ↗
                    </a>
                  </div>
                  {event.blockNumber !== undefined && (
                    <div style={{ marginTop: "4px" }}>
                      <strong>Block:</strong> #{event.blockNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

          <div
  style={{
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
  }}
>
  <h2
    style={{
      marginTop: 0,
      fontSize: "20px",
    }}
  >
    What does this verification mean?
  </h2>

  <p
    style={{
      color: "#4b5563",
      lineHeight: "1.6",
      marginBottom: 0,
    }}
  >
    Each craft batch receives a unique digital identity. The blockchain
    records important events in the batch journey, helping buyers verify
    where the product came from and how its custody changed over time.
  </p>
</div>

        <QRCode tokenId={batch.tokenId} />

        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "13px",
          }}
        >
          <p style={{ margin: 0 }}>
            Craft Chain • Blockchain-based craft traceability
          </p>

          <p style={{ margin: "6px 0 0" }}>
            Verify the journey. Know the origin.
          </p>
        </div>
      </div>
    </main>
  );
}
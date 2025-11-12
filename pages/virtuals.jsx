import { useEffect, useState } from "react";

export default function VirtualsUSD() {
  const [tokens, setTokens] = useState([]);
  const [virtualUsd, setVirtualUsd] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1️⃣ Virtual token listesi
        const virtualsRes = await fetch(
          "https://api2.virtuals.io/api/virtuals?filters[chain]=BASE&filters[status]=5&pagination[pageSize]=150"
        );
        const virtualsData = await virtualsRes.json();
        const list = virtualsData?.data || [];

        // 2️⃣ Coingecko'dan VIRTUAL fiyatı (USD)
        const cgRes = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=virtual-protocol&vs_currencies=usd"
        );
        const cgJson = await cgRes.json();
        const vPrice = Number(cgJson?.["virtual-protocol"]?.usd || 0.0042);
        setVirtualUsd(vPrice);

        // 3️⃣ Her tokenin USD fiyatı ve FDV'sini hesapla
        const formatted = list.map((t) => {
          const a = t.attributes || {};
          const name = a.name || a.symbol || "Unknown";
          const symbol = a.symbol || "???";
          const priceVirtual = Number(a.virtualTokenValue || 0);
          const fdvVirtual = Number(a.mcapInvirtual || a.fdvInVirtual || 0);
          const change = Number(a.virtualTokenChange24h || 0);
          const priceUsd = priceVirtual * vPrice;
          const fdvUsd = fdvVirtual * vPrice;

          return {
            id: t.id,
            name,
            symbol,
            priceUsd,
            fdvUsd,
            change,
          };
        });

        setTokens(formatted);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading)
    return (
      <div
        style={{
          color: "#9ca3af",
          textAlign: "center",
          paddingTop: "25vh",
          fontSize: "18px",
        }}
      >
        Fetching Virtual tokens...
      </div>
    );

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#00ff9c",
          fontWeight: "bold",
          fontSize: "28px",
          marginBottom: "8px",
        }}
      >
        Virtual Protocol Tokens (USD)
      </h1>
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "16px" }}>
        $VIRTUAL price = ${virtualUsd.toFixed(4)} USD
      </p>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            border: "1px solid #333",
          }}
        >
          <thead
            style={{
              background: "#111",
              color: "#9ca3af",
              textTransform: "uppercase",
              fontSize: "12px",
            }}
          >
            <tr>
              <th style={{ padding: "8px", textAlign: "left" }}>#</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Token</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Price (USD)</th>
              <th style={{ padding: "8px", textAlign: "right" }}>FDV (USD)</th>
              <th style={{ padding: "8px", textAlign: "right" }}>24h</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={t.id} style={{ borderTop: "1px solid #222" }}>
                <td style={{ padding: "8px", color: "#777" }}>{i + 1}</td>
                <td style={{ padding: "8px" }}>{t.symbol}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  ${t.priceUsd.toFixed(6)}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  ${t.fdvUsd.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "8px",
                    textAlign: "right",
                    fontWeight: "bold",
                    color: t.change >= 0 ? "#00ff9c" : "#f87171",
                  }}
                >
                  {t.change.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", color: "#888", marginTop: "16px" }}>
        Showing {tokens.length} tokens — FDV(USD) = fdvInVirtual × VIRTUAL(USD)
      </p>
    </div>
  );
}

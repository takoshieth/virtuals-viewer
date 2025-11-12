import { useEffect, useState } from "react";

export default function VirtualTokens() {
  const [tokens, setTokens] = useState([]);
  const [virtualPrice, setVirtualPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // 1️⃣ Virtual token listesi
        const r = await fetch(
          "https://api2.virtuals.io/api/virtuals?filters[status]=5&filters[chain]=BASE&pagination[pageSize]=100"
        );
        const j = await r.json();
        const list = j.data || [];

        // 2️⃣ VIRTUAL fiyatı (örnek LP adresi)
        const vRes = await fetch(
          "https://api.dexscreener.com/latest/dex/pairs/base/0xb0a4d7d567389b5f57ef94c5a2db6466af081cb6"
        );
        const vJson = await vRes.json();
        const vPrice = Number(vJson?.pair?.priceUsd || 0);
        setVirtualPrice(vPrice);

        // 3️⃣ Her tokenin USD fiyatını hesapla
        const data = list.map((t) => {
          const a = t.attributes || {};
          const priceVirtual = Number(a.virtualTokenValue || 0);
          const priceUSD = priceVirtual * vPrice;
          return {
            id: t.id,
            name: a.name || a.symbol || "Unknown",
            symbol: a.symbol || "???",
            priceUSD,
            virtualTokenValue: priceVirtual,
          };
        });
        setTokens(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    fetchAll();
  }, []);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
        }}
      >
        Loading Virtual tokens...
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "24px" }}>
      <h1
        style={{
          textAlign: "center",
          fontWeight: 800,
          fontSize: "28px",
          color: "#34d399",
          marginBottom: "16px",
        }}
      >
        Virtual Protocol Tokens (via Virtual API)
      </h1>
      <p style={{ textAlign: "center", color: "#9ca3af", marginBottom: "16px" }}>
        Virtual token price: ${virtualPrice.toFixed(4)} USD
      </p>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            border: "1px solid #374151",
            borderRadius: "12px",
            fontSize: "14px",
          }}
        >
          <thead style={{ background: "#111827", color: "#9ca3af", textTransform: "uppercase", fontSize: "12px" }}>
            <tr>
              <th style={{ padding: "8px", textAlign: "left" }}>#</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Token</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Virtual Value</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Price (USD)</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={t.id} style={{ borderTop: "1px solid #1f2937" }}>
                <td style={{ padding: "8px", color: "#9ca3af" }}>{i + 1}</td>
                <td style={{ padding: "8px" }}>{t.symbol}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {t.virtualTokenValue.toFixed(2)}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  ${t.priceUSD.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

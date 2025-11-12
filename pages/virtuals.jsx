import { useEffect, useState } from "react";

export default function VirtualTokens() {
  const [tokens, setTokens] = useState([]);
  const [virtualPrice, setVirtualPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        // 1️⃣ Tüm Virtual tokenleri çek
        const res = await fetch(
          "https://api2.virtuals.io/api/virtuals?filters[status]=5&filters[chain]=BASE&pagination[pageSize]=200"
        );
        const data = await res.json();
        const list = data?.data || [];

        // 2️⃣ VIRTUAL fiyatını al (gerçek USD)
        const dex = await fetch(
          "https://api.dexscreener.com/latest/dex/pairs/base/0xb0a4d7d567389b5f57ef94c5a2db6466af081cb6"
        );
        const dexJson = await dex.json();
        const virtualUsd = Number(dexJson?.pair?.priceUsd || 0.004);
        setVirtualPrice(virtualUsd);

        // 3️⃣ Token fiyatlarını hesapla
        const formatted = list
          .map((t) => {
            const a = t.attributes || {};
            const val = Number(a.virtualTokenValue || 0);
            if (!val || isNaN(val)) return null;
            return {
              id: t.id,
              name: a.name || a.symbol || "Unknown",
              symbol: a.symbol || "???",
              usdPrice: val * virtualUsd,
              virtualVal: val,
              holders: a.holderCount || 0,
            };
          })
          .filter(Boolean);

        setTokens(formatted);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading)
    return (
      <div style={{ color: "#aaa", textAlign: "center", paddingTop: "20vh" }}>
        Fetching Virtual tokens...
      </div>
    );

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "24px" }}>
      <h1
        style={{
          textAlign: "center",
          color: "#00ff9c",
          fontWeight: "bold",
          fontSize: "28px",
          marginBottom: "10px",
        }}
      >
        Virtual Protocol Tokens (USD prices)
      </h1>
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "20px" }}>
        $VIRTUAL price = ${virtualPrice.toFixed(4)}
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#111", color: "#9ca3af", textTransform: "uppercase" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>#</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Token</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Virtual Value</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Price (USD)</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Holders</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={t.id} style={{ borderTop: "1px solid #222" }}>
                <td style={{ padding: "6px", color: "#777" }}>{i + 1}</td>
                <td style={{ padding: "6px" }}>{t.symbol}</td>
                <td style={{ padding: "6px", textAlign: "right" }}>
                  {t.virtualVal.toFixed(2)}
                </td>
                <td style={{ padding: "6px", textAlign: "right", color: "#00ff9c" }}>
                  ${t.usdPrice.toFixed(6)}
                </td>
                <td style={{ padding: "6px", textAlign: "right" }}>{t.holders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function VirtualTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1️⃣ Virtuals API'den tokenleri çek
        const virtualsRes = await fetch(
          "https://api2.virtuals.io/api/virtuals?filters[status]=5&filters[chain]=BASE&pagination[pageSize]=50"
        );
        const virtualsData = await virtualsRes.json();

        const rawTokens = (virtualsData?.data || []).map((item) => {
          const a = item.attributes || {};
          return {
            id: item.id,
            name: a.name || a.symbol || "Unknown",
            symbol: a.symbol || "???",
            lp: a.lpAddress,
            tokenAddress: a.tokenAddress,
          };
        });

        // 2️⃣ Her token için Dexscreener'dan fiyat çek
        const enriched = await Promise.all(
          rawTokens.map(async (t) => {
            if (!t.lp) return { ...t, price: 0, change24h: 0, fdv: 0 };
            try {
              const dexRes = await fetch(
                `https://api.dexscreener.com/latest/dex/pairs/base/${t.lp}`
              );
              const dexJson = await dexRes.json();
              const pair = dexJson.pair || {};
              return {
                ...t,
                price: Number(pair.priceUsd || 0),
                change24h: Number(pair.priceChange?.h24 || 0),
                fdv: Number(pair.fdv || 0),
              };
            } catch {
              return { ...t, price: 0, change24h: 0, fdv: 0 };
            }
          })
        );

        setTokens(enriched);
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-gray-400 flex items-center justify-center text-lg">
        Fetching Virtual tokens...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-400">
        Virtual Protocol Tokens (Live Dexscreener Data)
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700 rounded-xl text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Token</th>
              <th className="p-2 text-right">Price (USD)</th>
              <th className="p-2 text-right">24h Change</th>
              <th className="p-2 text-right">FDV</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr
                key={t.id}
                className="border-t border-gray-800 hover:bg-gray-800 transition"
              >
                <td className="p-2 text-gray-500">{i + 1}</td>
                <td className="p-2">{t.symbol}</td>
                <td className="p-2 text-right">${t.price.toFixed(6)}</td>
                <td
                  className={`p-2 text-right font-semibold ${
                    t.change24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {t.change24h.toFixed(2)}%
                </td>
                <td className="p-2 text-right text-gray-300">
                  ${t.fdv.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-gray-500 mt-6">
        Showing {tokens.length} tokens — Prices fetched from Dexscreener
      </p>
    </div>
  );
}

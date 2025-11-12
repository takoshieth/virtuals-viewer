import { useEffect, useState } from "react";

export default function VirtualsList() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVirtuals() {
      setLoading(true);
      try {
        const apiUrl =
          "https://api2.virtuals.io/api/virtuals?filters[status]=5&filters[chain]=BASE&sort[0]=virtualTokenValue:desc&sort[1]=createdAt:desc&populate[0]=image&populate[1]=genesis&populate[2]=creator&pagination[page]=1&pagination[pageSize]=100";
        const res = await fetch(apiUrl);
        const json = await res.json();
        const data = json.data || [];

        const formatted = data.map((t) => {
          const attr = t.attributes || {};
          return {
            id: t.id,
            name: attr.symbol || attr.name || "Unknown",
            price: Number(attr.virtualTokenValue || 0),
            change24h: Number(attr.virtualTokenChange24h || 0),
            fdv: Number(attr.virtualTokenFDV || 0),
            image: attr.image?.data?.attributes?.url || null,
          };
        });

        setTokens(formatted);
      } catch (err) {
        console.error("Virtuals API Error:", err);
      }
      setLoading(false);
    }

    fetchVirtuals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400 text-lg">
        Fetching Virtual tokens...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-400">
        Virtual Protocol Tokens
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
                <td className="p-2 flex items-center gap-2">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-600 rounded-full" />
                  )}
                  <span className="font-medium">{t.name}</span>
                </td>
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
        Showing {tokens.length} tokens — Data from Virtuals Protocol API
      </p>
    </div>
  );
}

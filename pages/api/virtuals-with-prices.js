// pages/api/virtuals-with-prices.js
const VIRTUALS_BASE =
  "https://api2.virtuals.io/api/virtuals?filters[status]=5&filters[chain]=BASE";

async function fetchAllVirtuals() {
  const pageSize = 100;
  let page = 1;
  const out = [];
  while (true) {
    const url = `${VIRTUALS_BASE}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Virtuals API error");
    const j = await r.json();
    const arr = j?.data || [];
    if (!arr.length) break;
    out.push(
      ...arr.map((it) => {
        const a = it.attributes || {};
        return {
          id: it.id,
          name: a.name || a.symbol || "Unknown",
          symbol: a.symbol || "???",
          tokenAddress: a.tokenAddress || null,
          lpAddress: a.lpAddress || null,
          image:
            a.image?.data?.attributes?.url ||
            a.image?.url ||
            null,
        };
      })
    );
    if (arr.length < pageSize) break;
    page += 1;
    if (page > 20) break; // emniyet
  }
  return out;
}

async function fetchDexForLPs(lpList) {
  // Dexscreener çoklu sorgu: 30 adede kadar virgülle birleştir
  const chunks = [];
  for (let i = 0; i < lpList.length; i += 30) {
    chunks.push(lpList.slice(i, i + 30));
  }

  const map = new Map();
  for (const chunk of chunks) {
    const url = `https://api.dexscreener.com/latest/dex/pairs/base/${chunk.join(
      ","
    )}`;
    const r = await fetch(url);
    if (!r.ok) continue;
    const j = await r.json();
    const pairs = j?.pairs || (j?.pair ? [j.pair] : []);
    for (const p of pairs) {
      if (!p?.pairAddress) continue;
      map.set(p.pairAddress.toLowerCase(), {
        priceUsd: Number(p.priceUsd || 0),
        change24h: Number(p.priceChange?.h24 || 0),
        fdv: Number(p.fdv || 0),
      });
    }
  }
  return map;
}

export default async function handler(req, res) {
  try {
    const list = await fetchAllVirtuals();
    const lpAddrs = [...new Set(list.map(x => x.lpAddress).filter(Boolean))].map(
      (x) => x.toLowerCase()
    );

    const dexMap = await fetchDexForLPs(lpAddrs);

    const tokens = list.map((t) => {
      const dex = t.lpAddress ? dexMap.get(t.lpAddress.toLowerCase()) : null;
      return {
        id: t.id,
        name: t.name,
        symbol: t.symbol,
        image: t.image,
        tokenAddress: t.tokenAddress,
        lpAddress: t.lpAddress,
        price: dex?.priceUsd ?? 0,
        change24h: dex?.change24h ?? 0,
        fdv: dex?.fdv ?? 0,
      };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.status(200).json({ tokens, count: tokens.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Aggregator failed" });
  }
}

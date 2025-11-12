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
                price: Number(pair.priceUsd || 0

// pages/virtuals.jsx
import { useEffect, useState } from "react";

export default function VirtualTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        const r = await fetch("/api/virtuals-with-prices");
        const j = await r.json();
        setTokens(j.tokens || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    run();
  }, []);

  if (loading)
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af"}}>
        Fetching Virtual tokens...
      </div>
    );

  return (
    <div style={{minHeight:"100vh",background:"#000",color:"#fff",padding:"24px"}}>
      <h1 style={{textAlign:"center",fontWeight:800,fontSize:"28px",color:"#34d399",marginBottom:"16px"}}>
        Virtual Protocol Tokens (Dexscreener fiyatları)
      </h1>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0,border:"1px solid #374151",borderRadius:"12px",fontSize:"14px"}}>
          <thead style={{background:"#111827",color:"#9ca3af",textTransform:"uppercase",fontSize:"12px"}}>
            <tr>
              <th style={{padding:"8px",textAlign:"left"}}>#</th>
              <th style={{padding:"8px",textAlign:"left"}}>Token</th>
              <th style={{padding:"8px",textAlign:"right"}}>Price (USD)</th>
              <th style={{padding:"8px",textAlign:"right"}}>24h Change</th>
              <th style={{padding:"8px",textAlign:"right"}}>FDV</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={t.id} style={{borderTop:"1px solid #1f2937"}}>
                <td style={{padding:"8px",color:"#9ca3af"}}>{i+1}</td>
                <td style={{padding:"8px",display:"flex",alignItems:"center",gap:"8px"}}>
                  {t.image ? (
                    <img src={t.image} alt={t.symbol} style={{width:24,height:24,borderRadius:"50%"}}/>
                  ) : (
                    <div style={{width:24,height:24,background:"#4b5563",borderRadius:"50%"}}/>
                  )}
                  <span style={{fontWeight:600}}>{t.symbol}</span>
                </td>
                <td style={{padding:"8px",textAlign:"right"}}>${Number(t.price||0).toFixed(6)}</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:700,color:(t.change24h||0) >= 0 ? "#34d399" : "#f87171"}}>
                  {Number(t.change24h||0).toFixed(2)}%
                </td>
                <td style={{padding:"8px",textAlign:"right",color:"#d1d5db"}}>${Number(t.fdv||0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{textAlign:"center",color:"#9ca3af",marginTop:"16px"}}>
        Showing {tokens.length} tokens — LP’lerden çekilen canlı fiyatlar.
      </p>
    </div>
  );
}

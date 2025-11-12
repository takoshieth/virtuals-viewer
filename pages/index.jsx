// pages/index.jsx
import Link from "next/link";
export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Virtuals Viewer</h1>
      <Link href="/virtuals">
        <p style={{ color: "lime", marginTop: "20px", cursor: "pointer" }}>
          → View Tokens
        </p>
      </Link>
    </div>
  );
}

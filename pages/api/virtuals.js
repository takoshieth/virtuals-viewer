export default async function handler(req, res) {
  try {
    const apiUrl =
      "https://api2.virtuals.io/api/virtuals?filters[status]=5&filters[chain]=BASE&sort[0]=virtualTokenValue:desc&sort[1]=createdAt:desc&populate[0]=image&populate[1]=genesis&populate[2]=creator&pagination[page]=1&pagination[pageSize]=100";

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.status(200).json(data);
  } catch (error) {
    console.error("Virtuals proxy error:", error);
    res.status(500).json({ error: "Failed to fetch Virtuals API" });
  }
}

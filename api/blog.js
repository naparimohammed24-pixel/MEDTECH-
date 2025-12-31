export default async function handler(req, res) {
  const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
  const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

  const url =
    `https://cdn.contentful.com/spaces/${SPACE_ID}/entries` +
    `?content_type=blogPost&order=-fields.publishDate`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
}

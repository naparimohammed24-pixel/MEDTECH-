export default async function handler(req, res) {
  const { slug } = req.query;

  const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
  const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

  const url =
    `https://cdn.contentful.com/spaces/${SPACE_ID}/entries` +
    `?content_type=blogPost&fields.slug=${slug}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}

# Flipkart phone shortlist

A standalone Next.js App Router project with a responsive React page and server-side live Flipkart reader. No example products or invented prices are shipped.

## Run

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. For production use `npm run build` followed by `npm start`, or deploy to a host supporting Next.js server routes. A static-only host cannot run the live reader.

## Included

- All 16 brands, camera, RAM, storage, battery, network, SIM and smartphone filters from the supplied URL, selected by default.
- Adjustable minimum/maximum price sliders (₹0–₹1,00,000 in ₹500 steps), defaulting to ₹10,000–₹20,000, and lowest-price-first ordering.
- Product image, name, rupee price, specifications and listing status.
- Server-side fetching on page open, Refresh, filter application and page change.
- Pagination across the complete result set. Flipkart controls the number of listings per page.
- Loading, empty, failure and missing-image states.

## Integrating into an existing Next.js app

Copy `app/page.jsx` (or use its component in another route), `app/api/products/route.js`, `lib/filters.js`, and `lib/flipkart.js`. Merge the styles in `app/globals.css` carefully: they include global element selectors. Install `cheerio`; React and Next.js will normally already exist in the target app. Adjust relative imports if you relocate the files. The API route must execute on the server.

## Data behavior and limits

This is an HTML reader of Flipkart's public listing page, not an official Flipkart API integration. It currently uses the inspected product-link structure, image alt text, price selector and pagination text. Flipkart can change its markup or restrict requests, especially from hosted servers. A failed read produces an explicit error, never fake prices or a false out-of-stock status. For a dependable production service, replace the reader with an authorized data feed and apply rate limiting/caching appropriate to its terms. The current page is intended for personal low-volume use, and has no automatic background polling.

“Currently unavailable”, “Coming soon”, “Out of stock” and “Only few left” come from explicit listing text. If no stock text is supplied, the page says “Check availability”; absence of an unavailable label does not prove stock. No delivery postcode is set, so location-specific availability is not verified. The displayed check time identifies when that page was retrieved; it does not guarantee a purchase price. Unavailable items missing from Flipkart's own results cannot be discovered by this reader. Product images are loaded from Flipkart's image host.

Run `npm test` for filter encoding and parser behavior checks.

## Big Billion Days filter
Only products containing the exact Big Billion Days Price tag within their listing card are returned. Other offers or page-wide sale banners do not qualify. The displayed count is the tagged count on the current source page, not an unverified global count. Pagination retains Flipkart's source pages, including pages with zero tagged products. All earlier filters and stock labels remain active. Product-detail-only tags absent from the listing card cannot be detected by this reader.


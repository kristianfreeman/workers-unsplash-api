// Handle incoming fetch events with handleRequest function
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

// Make requests based on the request body to Unsplash API
const getImages = async event => {
  // Parse the key "query" from a JSON body in the request
  const { query } = await event.request.json()

  // Create a new Unsplash URL
  const url = new URL("https://api.unsplash.com/search/photos")
  // Set the client ID from a secret set via `wrangler secret`
  url.searchParams.set("client_id", UNSPLASH_ACCESS_KEY)
  // Only return nine results for a nice grid layout
  url.searchParams.set("per_page", 9)
  // Set the query/keyword to the value from request body
  url.searchParams.set("query", query)

  // Make a request to Unsplash's API
  const resp = await fetch(url)
  // Parse the response body into JSON
  const data = await resp.json()
  // Map through the image data in `data.results` and return
  // a JS object with just the values we need
  const images = data.results.map(image => ({
    id: image.id,
    image: image.urls.small,
    link: image.links.html
  }))

  // Return a JSON response with an array of images
  return new Response(
    JSON.stringify(images),
    { headers: { 'Content-type': 'application/json', ...corsHeaders } }
  )
}

// Some CORS headers to lock down our API
const corsHeaders = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Origin': '*'
}

async function handleRequest(event) {
  // If an OPTIONS request comes in, return a simple
  // response with the CORS information for our app
  if (event.request.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders })
  }

  // If a POST request comes in, handle it using the getImages function
  if (event.request.method === "POST") return getImages(event)

  // Redirect any other requests to a different URL, such as
  // your deployed React application
  return new Response.redirect("https://bytesized.xyz")
}

async function run() {
  const url = "https://hzeqntoxqeylnglkgdnp.supabase.co/rest/v1/projects?order=created_at.desc";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6ZXFudG94cWV5bG5nbGtnZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg0MzUsImV4cCI6MjA5NDg1NDQzNX0.0Ush4SkknslhAtPg8fmCEZkCygi3QgDzUo-P-7IvT-w";
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await res.json();
    console.log("PROJECTS IN DB:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
run();

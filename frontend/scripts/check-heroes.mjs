import assert from "node:assert/strict";

/** Real production responses: every formerly plain hero has a loadable photo. */
export async function checkHeroes(read, port) {
  const stockPhotos = ["vision", "writing", "teamwork", "contact", "justice", "microphone", "camera", "documents"];
  const routes = [
    ["/about", "home-about"],
    ["/about/who-we-are", "home-about"],
    ["/about/mission-and-vision", "vision"],
    ["/about/aims-and-objectives", "writing"],
    ["/about/message-of-ceo", "home-chairman"],
    ["/about/board-of-directors", "teamwork"],
    ["/about/our-team", "teamwork"],
    ["/about/registration-and-certificates", "documents"],
    ["/about/progress-reports", "home-report-2024"],
    ["/our-work", "home-hero"],
    ["/projects", "research-and-advocacy-archive"],
    ["/programmes", "research-and-advocacy-archive"],
    ["/projects/real-project", "teamwork"],
    ["/blogs", "writing"],
    ["/blogs/real-news", "home-report-2023"],
    ["/gallery", "camera"],
    ["/gallery/media-coverage", "camera"],
    ["/gallery/media-coverage?category=in-action", "camera"],
    ["/gallery/tv-interviews", "microphone"],
    ["/become-a-member", "teamwork"],
    ["/contact", "contact"],
    ["/file-a-complaint", "justice"],
    ["/donate", "home-hero"],
    ["/impact", "home-hero"],
    ["/faq", "writing"],
    ["/search", "documents"],
    ["/newsletter", "writing"],
    ["/partner-with-us", "teamwork"],
    ["/complaints", "contact"],
    ["/privacy-policy", "documents"],
    ["/terms-of-use", "justice"],
    ["/accessibility", "writing"],
    ["/safeguarding-policy", "teamwork"],
  ];
  const pages = await Promise.all(
    routes.map(async ([route, photo]) => ({
      route,
      photo,
      page: await read(route),
    })),
  );
  for (const { route, photo, page } of pages) {
    assert.equal(page.status, 200, route);
    const main = page.html.match(/<main\b[\s\S]*?<\/main>/)?.[0];
    const hero = main?.match(/<section\b[\s\S]*?<\/section>/)?.[0];
    assert.ok(
      hero?.includes("hrpf-hero-overlay"),
      `Photo hero rendered on ${route}`,
    );
    if (stockPhotos.includes(photo)) {
      assert.ok(hero.includes(`${photo}-desktop.webp`) && hero.includes(`${photo}-mobile.webp`), `Separate compositions on ${route}`);
      assert.match(hero, /<picture><source media="\(min-width: 1024px\)"/, `Desktop source on ${route}`);
      assert.ok(hero.includes('fetchPriority="high"'), `Selected hero receives fetch priority on ${route}`);
      assert.ok(!hero.includes('rel="preload"'), `No fallback-only preload on ${route}`);
    } else {
      assert.ok(hero.includes(`${photo}.webp`), `Relevant photo on ${route}`);
      assert.ok(!hero.includes("<picture>"), `Actual cover retained on ${route}`);
    }
    assert.ok(
      /<img\b[^>]*alt=""/.test(hero) && hero.includes('aria-hidden="true"'),
      `Decorative image on ${route}`,
    );
    assert.ok(
      hero.includes('sizes="100vw"') && hero.includes("srcSet="),
      `Responsive image on ${route}`,
    );
    assert.equal(
      (main.match(/<h1[ >]/g) || []).length,
      1,
      `One page heading on ${route}`,
    );
  }
  for (const file of stockPhotos.flatMap((photo) => [`${photo}-desktop`, `${photo}-mobile`])) {
    const response = await fetch(
      `http://127.0.0.1:${port}/images/heroes/v2/${file}.webp`,
    );
    assert.equal(response.status, 200, file);
    assert.match(response.headers.get("content-type"), /image\/webp/);
    assert.match(
      response.headers.get("cache-control"),
      /max-age=31536000.*immutable/,
    );
    assert.ok(
      (await response.arrayBuffer()).byteLength > 5000,
      `Nonempty photograph: ${file}`,
    );
  }
  const home = (await read("/")).html.match(/<main\b[\s\S]*?<\/main>/)?.[0];
  assert.ok(
    home.includes("hrpf-home-overlay"),
    "Home video has its separate blue overlay",
  );
  assert.ok(
    !/<video\b[^>]*\bcontrols(?:=|[ >])/.test(home),
    "Home video has no playback controls",
  );
  console.log(
    `Photo hero checks passed: ${routes.length} public pages, uploaded-cover/missing-cover behavior, responsive decorative images, versioned assets and home video.`,
  );
}

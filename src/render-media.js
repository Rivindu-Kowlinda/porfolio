// Optional project media is authored together in content.js. An empty source
// produces a quiet placeholder, never a broken image or a non-working player.
const escape = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

export function mediaImage(media, eager = false) {
  const dimensions =
    media.width && media.height
      ? ` width="${media.width}" height="${media.height}"`
      : "";
  return `<img src="${escape(media.src)}" alt="${escape(media.alt)}"${dimensions} loading="${eager ? "eager" : "lazy"}">`;
}

export function renderMediaSlot(media) {
  const captionText = (!media.src && media.placeholderCaption) || media.caption;
  const caption = captionText
    ? `<figcaption class="mono">${escape(captionText)}</figcaption>`
    : "";
  if (media.type === "image") {
    return `<figure${media.wide ? ' class="gallery-wide"' : ""} data-media-slot="${escape(media.id)}">${
      media.src
        ? `<div class="project-image-frame">${mediaImage(media)}</div>`
        : `<div class="media-placeholder image-placeholder" aria-hidden="true"><span class="mono">SOUNDSHARE / CAPTURE 02</span><span class="placeholder-mark">◫</span></div>`
    }${caption}</figure>`;
  }
  return `<figure data-media-slot="${escape(media.id)}"><h3 class="demo-title">${escape(media.title)}</h3>${
    media.src
      ? `<div class="video-clip demo-frame"><video controls playsinline preload="none" aria-label="${escape(media.title)}"${media.poster ? ` poster="${escape(media.poster)}"` : ""} src="${escape(media.src)}">Your browser cannot play this recording.</video></div>`
      : `<div class="media-placeholder demo-frame">${media.poster ? `<img src="${escape(media.poster)}" alt="" loading="lazy">` : ""}<span class="placeholder-mark" aria-hidden="true">▷</span><span class="mono">Demo coming soon</span></div>`
  }${caption}</figure>`;
}

export function renderMediaGallery(media) {
  // The primary image already appears in the shared hero visual.
  const images = media.filter((entry) => entry.type === "image").slice(1);
  const videos = media.filter((entry) => entry.type === "video");
  return `<div class="gallery-grid">${images.map(renderMediaSlot).join("")}</div>${
    videos.length
      ? `<div class="case-recording"><span class="eyebrow">PROJECT RECORDINGS</span><div class="gallery-grid demo-gallery">${videos.map(renderMediaSlot).join("")}</div></div>`
      : ""
  }`;
}

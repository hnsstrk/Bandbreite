// Enable prerendering for all pages (required for static adapter)
export const prerender = true;

// Use trailing slashes so that routes with children (e.g. /spektrum)
// are generated as directory/index.html instead of directory.html,
// which avoids 403 errors on static hosting when a directory of the
// same name exists.
export const trailingSlash = 'always';

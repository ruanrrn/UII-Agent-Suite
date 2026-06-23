export function withResourceHash(url: string) {
  const separator = url.includes('?') ? '&' : '?';
  const version = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

export function publicAssetUrl(path: string) {
  return withResourceHash(`${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`);
}

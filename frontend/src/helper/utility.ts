export function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1];
}
export function getInitials(name: string) {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
}

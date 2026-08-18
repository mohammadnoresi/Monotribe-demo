const avatarThumbnailModules = import.meta.glob('../../assets/Avatar/thumbs/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export const bundledAvatarThumbnailUrls = Object.fromEntries(
  Object.entries(avatarThumbnailModules).map(([path, url]) => [path.split('/').at(-1)!, url]),
) as Record<string, string>

export function avatarThumbnailUrlFor(fileName: string) {
  return bundledAvatarThumbnailUrls[fileName] ?? ''
}

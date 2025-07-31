// Checks if the user has all required permissions
export function hasPermission(user: any, required: string[]): boolean {
  if (!user || !user.permissions) return false;
  return required.every(perm => user.permissions.includes(perm));
}

/**
 * Utility functions for creating and parsing URL-friendly slugs
 */

/**
 * Creates a URL-friendly slug from a name
 * @param name - The name to convert to a slug
 * @returns A URL-friendly slug
 */
export function createSlug(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extracts the name from a slug (reverse operation)
 * Note: This is approximate as special characters are lost in slug creation
 * @param slug - The slug to convert back to a name
 * @returns An approximate name (with hyphens replaced by spaces, title case)
 */
export function slugToName(slug: string): string {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


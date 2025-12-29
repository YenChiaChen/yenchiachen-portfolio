
import { projectSlugs, blogSlugs } from '../data/registry';

interface Frontmatter {
  [key: string]: string | string[];
}

interface ParsedFile {
    metadata: Frontmatter;
    content: string;
    hasFrontmatter: boolean;
}

/**
 * Parses a raw markdown string to separate Frontmatter (YAML-like) from content.
 */
const parseFrontmatter = (text: string): ParsedFile => {
  // 1. Clean up the text: Remove BOM and leading whitespace
  const cleanText = text.replace(/^\uFEFF/, '').trimStart();

  const frontmatterRegex = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
  const match = cleanText.match(frontmatterRegex);

  // If no frontmatter is found, return empty metadata but mark hasFrontmatter as false
  if (!match) {
    return { metadata: {}, content: cleanText, hasFrontmatter: false };
  }

  const rawMetadata = match[1];
  const content = match[2];

  const metadata: Frontmatter = {};
  
  // 3. Robust line splitting
  rawMetadata.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return; 

    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayValue = value.slice(1, -1).split(',').map(item => item.trim().replace(/^['"]|['"]$/g, ''));
        metadata[key] = arrayValue;
      } else {
        // Remove quotes
        value = value.replace(/^['"]|['"]$/g, '');
        metadata[key] = value;
      }
    }
  });

  return { metadata, content, hasFrontmatter: true };
};

/**
 * Helper to fetch a raw file content
 */
const fetchRaw = async (path: string): Promise<string | null> => {
    try {
        const response = await fetch(path);
        if (response.ok) {
            const text = await response.text();
            const trimmed = text.trim();
            // Prevent HTML fallback from SPA routers (GitHub Pages 404 fallback often returns HTML)
            if (!trimmed.toLowerCase().startsWith('<!doctype html>') && !trimmed.toLowerCase().startsWith('<html')) {
                return text;
            }
        }
    } catch (e) {
        // console.warn(`Fetch failed for ${path}`);
    }
    return null;
}

/**
 * Helper to construct the correct path respecting the deployment Base URL
 */
const getAssetPath = (path: string) => {
    // In Vite, import.meta.env.BASE_URL is injected during build based on 'base' config
    // Use optional chaining and default to '/' if env is missing
    const meta = import.meta as any;
    const baseUrl = meta.env?.BASE_URL || '/';
    
    // Ensure baseUrl ends with '/'
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    // Remove leading slash from path to avoid double slashes if base has one
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    return `${cleanBase}${cleanPath}`;
};

/**
 * Smart loader that composites metadata and content based on availability.
 * Strategy:
 * 1. Fetch Root file (Canonical Source of Truth for Metadata)
 * 2. Fetch Localized file
 * 3. Merge: Use Localized Content + Localized Metadata (if exists) OR Root Metadata
 */
const loadEntry = async <T>(type: 'projects' | 'posts', slug: string, language: string): Promise<T | null> => {
    // Use getAssetPath to ensure we fetch from /repo-name/projects/... instead of /projects/...
    const rootPath = getAssetPath(`${type}/${slug}.md`);
    const localizedPath = getAssetPath(`${type}/${language}/${slug}.md`);

    // Fetch in parallel
    const [rootText, localizedText] = await Promise.all([
        fetchRaw(rootPath),
        language !== 'en' && language !== '' ? fetchRaw(localizedPath) : Promise.resolve(null)
    ]);

    // If absolutely nothing exists, return null
    if (!rootText && !localizedText) {
        console.warn(`No content found for ${slug} at ${rootPath}`);
        return null;
    }

    const rootData = rootText ? parseFrontmatter(rootText) : null;
    const localizedData = localizedText ? parseFrontmatter(localizedText) : null;

    // BASE: Start with root metadata and content
    let finalMetadata = rootData?.metadata || {};
    let finalContent = rootData?.content || '';

    // OVERRIDE: If localized file exists
    if (localizedData) {
        // If localized file has its own frontmatter, merge/override root metadata
        if (localizedData.hasFrontmatter) {
            finalMetadata = { ...finalMetadata, ...localizedData.metadata };
        }
        // Always use localized content if available
        finalContent = localizedData.content;
    }

    // If we still don't have a title, something is wrong with the data source
    if (!finalMetadata.title && !finalMetadata.slug) {
         // Fallback title from slug if really desperate
         finalMetadata.title = slug; 
    }

    return {
        slug,
        ...finalMetadata,
    } as unknown as T;
};


/**
 * Loads metadata for all items in the registry.
 */
export const loadMarkdownContent = async <T>(type: 'projects' | 'posts', language: string): Promise<T[]> => {
  const slugs = type === 'projects' ? projectSlugs : blogSlugs;

  const promises = slugs.map(async (slug) => {
      return loadEntry<T>(type, slug, language);
  });

  const items = await Promise.all(promises);
  return items.filter((item) => item !== null) as T[];
};

/**
 * Gets the full content of a specific file.
 * Reuses the same logic to ensure consistency (e.g. if localized file has no frontmatter, we still get the content).
 */
export const getMarkdownContent = async (type: 'projects' | 'posts', slug: string, language: string): Promise<string> => {
    const rootPath = getAssetPath(`${type}/${slug}.md`);
    const localizedPath = getAssetPath(`${type}/${language}/${slug}.md`);

    // Try localized first
    let text = await fetchRaw(localizedPath);
    if (text) {
        const parsed = parseFrontmatter(text);
        return parsed.content;
    }

    // Fallback to root
    text = await fetchRaw(rootPath);
    if (text) {
        const parsed = parseFrontmatter(text);
        return parsed.content;
    }

    return Promise.reject("File not found");
}

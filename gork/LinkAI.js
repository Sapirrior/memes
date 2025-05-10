/*
 * Copyright © 2025 Jimmynnit
 * Licensed under the MIT License. See LICENSE file in the project root or
 * https://opensource.org/licenses/MIT for details.
 */
 
/**
 * LinkAI: Detects any valid URL or domain-like string in text with high accuracy.
 * @param {string} text - The input text to scan for links.
 * @returns {string} - '1' if a link is found, '0' if none.
 */
function LinkAI(text) {
  // Comprehensive TLD list (simulating IANA, including new and niche TLDs)
  const tlds = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'biz', 'info', 'io', 'ai', 'co',
    'in', 'co.in', 'uk', 'co.uk', 'ca', 'au', 'de', 'jp', 'fr', 'cn', 'ru',
    'app', 'dev', 'tech', 'shop', 'online', 'site', 'blog', 'news', 'store',
    'club', 'live', 'world', 'group', 'xn--supemail', 'health', 'travel',
    'design', 'market', 'digital', 'services', 'solutions', 'agency', 'company',
    'xyz', 'top', 'win', 'fun', 'guru', 'space', 'cloud', 'link', 'pro', 'work',
    'tv', 'crypto', 'blockchain', 'eth', 'nft', 'dao', 'museum', 'aero', 'coop',
    // Add more as needed or fetch dynamically from IANA
  ];

  // Common protocols and prefixes
  const protocols = [
    'http://', 'https://', 'ftp://', 'sftp://', 'file://', 'ws://', 'wss://',
    'mailto:', 'tel:', 'sms:', 'magnet:', 'git://', 'ssh://',
  ];

  // Context keywords for natural language detection
  const contextKeywords = [
    'check out', 'visit', 'see this', 'link to', 'website', 'page', 'article',
    'go to', 'read more at', 'click here', 'follow this', 'source:', 'reference:',
    'more info:', 'learn more:', 'view it here:', 'access here:', 'at:', 'on:',
    'available at:', 'find it at:', 'shared at:', 'posted on:',
  ];

  // File extensions to exclude (avoid false positives)
  const fileExtensions = [
    'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg',
    'png', 'gif', 'svg', 'mp3', 'mp4', 'zip', 'rar', 'exe', 'dll', 'bat',
    'css', 'js', 'py', 'java', 'cs', 'html', 'xml',
  ];

  // Core regex for detecting URLs (handles modern formats, IP addresses, IDNs)
  const urlRegex = /(?:[a-zA-Z][a-zA-Z0-9+.-]*:\/\/)?(?:[a-zA-Z0-9-_\u00A1-\uFFFF]{1,63}\.)+[a-zA-Z\u00A1-\uFFFF]{2,}(?::\d{1,5})?(?:\/[^\s]*)?|[a-zA-Z0-9-_\u00A1-\uFFFF]{1,63}\.[a-zA-Z\u00A1-\uFFFF]{2,}(?::\d{1,5})?(?:\/[^\s]*)?|(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?(?:\/[^\s]*)?|localhost(?::\d{1,5})?(?:\/[^\s]*)?/gi;

  // Helper: Normalize text for consistent processing
  function normalizeText(str) {
    return str
      .replace(/\u200B/g, '') // Remove zero-width spaces
      .replace(/[\u2018\u2019]/g, "'") // Normalize quotes
      .replace(/[\u201C\u201D]/g, '"') // Normalize double quotes
      .normalize('NFKC'); // Unicode normalization
  }

  // Helper: Validate domain or hostname
  function isValidDomain(segment) {
    if (!segment || segment.length > 255) return false;
    const parts = segment.split('.');
    const tld = parts.pop()?.toLowerCase();
    if (!tld || !tlds.includes(tld)) return false;
    if (fileExtensions.includes(tld)) return false;
    const domainRegex = /^[a-zA-Z0-9-_\u00A1-\uFFFF]{1,63}(\.[a-zA-Z0-9-_\u00A1-\uFFFF]{1,63})*$/;
    return domainRegex.test(segment) && !/^-|-$/.test(segment);
  }

  // Helper: Check for context keywords near a potential link
  function hasSurroundingContext(fullText, potentialLink, keywords) {
    const lowerText = fullText.toLowerCase();
    const lowerLink = potentialLink.toLowerCase();
    const windowSize = 100; // Larger window for better context detection

    for (const keyword of keywords) {
      let keywordIndex = lowerText.indexOf(keyword);
      while (keywordIndex !== -1) {
        const start = Math.max(0, keywordIndex - windowSize);
        const end = keywordIndex + keyword.length + windowSize;
        const window = lowerText.slice(start, end);
        if (window.includes(lowerLink)) {
          return true;
        }
        keywordIndex = lowerText.indexOf(keyword, keywordIndex + 1);
      }
    }
    return false;
  }

  // Helper: Check if a string is a likely link
  function isLikelyLink(potentialLink, fullText, tlds, protocols, keywords) {
    const lowerLink = potentialLink.toLowerCase();
    const cleanLink = potentialLink.replace(/^[({[<]+|[>})]+$/g, '').trim();

    // Exclude version numbers (e.g., v1.2.3) and similar patterns
    if (/^v?\d+\.\d+\.\d+$/.test(cleanLink)) return false;

    // 1. Explicit protocol match
    if (protocols.some((protocol) => lowerLink.startsWith(protocol))) {
      const domainPart = cleanLink.replace(/^[^:]+:\/\//, '').split('/')[0];
      return isValidDomain(domainPart);
    }

    // 2. TLD-based detection
    if (cleanLink.includes('.') && !cleanLink.includes(' ') && !cleanLink.includes('@')) {
      const parts = cleanLink.split('.');
      const tld = parts.pop()?.toLowerCase();
      if (tlds.includes(tld) && isValidDomain(cleanLink)) {
        return true;
      }
    }

    // 3. Slash-terminated domains (e.g., example.com/)
    if (cleanLink.endsWith('/') && !cleanLink.includes(' ')) {
      const domain = cleanLink.slice(0, -1);
      if (isValidDomain(domain)) return true;
    }

    // 4. Context-based detection
    if (hasSurroundingContext(fullText, cleanLink, keywords)) {
      if (isValidDomain(cleanLink)) return true;
    }

    // 5. IP address or localhost
    if (/^(?:\d{1,3}\.){3}\d{1,3}$|^localhost$/.test(cleanLink)) {
      return true;
    }

    return false;
  }

  // Main detection logic
  try {
    const normalizedText = normalizeText(text);

    // Step 1: Check explicit URLs with regex
    const regexMatches = normalizedText.match(urlRegex) || [];
    for (const match of regexMatches) {
      const domainPart = match.replace(/^[^:]+:\/\//, '').split(/[/:?]/)[0];
      if (isValidDomain(domainPart) || /^(?:\d{1,3}\.){3}\d{1,3}$|^localhost$/.test(domainPart)) {
        return '1';
      }
    }

    // Step 2: Split text and check for implicit links
    const wordSeparators = /[\s,.!?;()[\]{}\n\t'"]+/g;
    const words = normalizedText.split(wordSeparators).filter((word) => word && word.includes('.'));
    for (const word of words) {
      if (isLikelyLink(word, normalizedText, tlds, protocols, contextKeywords)) {
        return '1';
      }
    }

    // Step 3: No links found
    return '0';
  } catch (error) {
    console.error('LinkAI Error:', error);
    return '0'; // Fail-safe
  }
}

module.exports = LinkAI;
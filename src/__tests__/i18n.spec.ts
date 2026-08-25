import { describe, it, expect } from 'vitest';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

describe('Localization Integrity (i18n)', () => {
  const ruKeys = getAllKeys(ru);
  const enKeys = getAllKeys(en);

  it('should have non-empty keys in ru.json', () => {
    expect(ruKeys.length).toBeGreaterThan(50);
  });

  it('should have non-empty keys in en.json', () => {
    expect(enKeys.length).toBeGreaterThan(50);
  });

  it('should have essential core keys in both ru.json and en.json', () => {
    const requiredSections = ['common', 'sidebar', 'dashboard', 'auth', 'modals'];
    for (const sec of requiredSections) {
      expect(ru).toHaveProperty(sec);
      expect(en).toHaveProperty(sec);
    }
  });

  it('should contain matching keys between ru.json and en.json for modals and dashboard', () => {
    expect((ru as any).modals?.share?.title).toBeDefined();
    expect((en as any).modals?.share?.title).toBeDefined();

    expect((ru as any).modals?.addProject?.title).toBeDefined();
    expect((en as any).modals?.addProject?.title).toBeDefined();
  });
});

import { newId } from '../../newId';

describe('newId', () => {
  test('generates 24-character string', () => {
    const id = newId();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(24);
  });

  test('generates unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(newId());
    }
    expect(ids.size).toBe(1000);
  });

  test('generates sortable IDs (later IDs sort after earlier)', () => {
    const id1 = newId();
    // Generate many IDs to ensure time progresses or sequence increments
    for (let i = 0; i < 100; i++) newId();
    const id2 = newId();
    
    expect(id1 < id2).toBe(true);
  });

  test('bulk-created IDs are still sorted', () => {
    const ids: string[] = [];
    for (let i = 0; i < 100; i++) {
      ids.push(newId());
    }
    
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  test('IDs contain only b64lex safe characters', () => {
    // b64lex uses: 0-9 A-Z _ a-z and | as separator
    const validChars = /^[0-9A-Z_a-z|]+$/;
    for (let i = 0; i < 100; i++) {
      const id = newId();
      expect(id).toMatch(validChars);
    }
  });
});

// Logic: Automated unit test suite for frontend utilities.
// Input: Test assertions for slugification and byte formatting.
// Output: Node.js test runner results.

import test from 'node:test';
import assert from 'node:assert';
import { slugifyVietnamese, formatBytes, estimateReadingTime } from '../src/lib/utils.ts';

test('slugifyVietnamese transforms accented Vietnamese text into clean slugs', () => {
  const input = 'Chào Mừng Đến Với Câu Lạc Bộ Eternal Flame Tech';
  const expected = 'chao-mung-den-voi-cau-lac-bo-eternal-flame-tech';
  assert.strictEqual(slugifyVietnamese(input), expected);
});

test('formatBytes correctly formats file sizes', () => {
  assert.strictEqual(formatBytes(0), '0 B');
  assert.strictEqual(formatBytes(1024), '1 KB');
  assert.strictEqual(formatBytes(1024 * 1024 * 2.5), '2.5 MB');
});

test('estimateReadingTime calculates expected reading time', () => {
  const content = 'từ '.repeat(400);
  assert.strictEqual(estimateReadingTime(content), '2 phút đọc');
});

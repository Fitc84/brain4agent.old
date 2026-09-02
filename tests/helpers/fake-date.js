'use strict';
// Preload (-r) cố định mốc thời gian cho engine: `new Date()` và `Date.now()` trả
// đúng BRAIN_NOW, còn `new Date(x)` có đối số giữ nguyên hành vi gốc.
// Không đặt BRAIN_NOW ⇒ không đụng gì (module vô hại).
const raw = process.env.BRAIN_NOW;
if (raw) {
  const fixed = Date.parse(raw);
  if (Number.isNaN(fixed)) {
    throw new Error(`[fake-date] BRAIN_NOW khong parse duoc: ${raw}`);
  }
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(fixed);
      else super(...args);
    }
    static now() { return fixed; }
  }
  Object.defineProperty(FakeDate, 'name', { value: 'Date' });
  global.Date = FakeDate;
}

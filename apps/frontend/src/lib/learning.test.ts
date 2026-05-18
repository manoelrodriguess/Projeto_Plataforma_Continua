import assert from 'node:assert/strict';
import { clampPercent, courses, defaultDiagnostic, scoreCourseRecommendation } from './learning';

assert.equal(clampPercent(-12), 0);
assert.equal(clampPercent(42.4), 42);
assert.equal(clampPercent(42.6), 43);
assert.equal(clampPercent(124), 100);

const ranked = [...courses].sort(
  (a, b) => scoreCourseRecommendation(b.id, defaultDiagnostic) - scoreCourseRecommendation(a.id, defaultDiagnostic),
);

const topFourIds = ranked.slice(0, 4).map((course) => course.id);
assert.ok(topFourIds.includes(1));
assert.ok(topFourIds.includes(3));

assert.ok(courses.length > 0);
assert.ok(courses.every((course) => course.modules.length > 0));
assert.ok(courses.every((course) => course.modules.every((module) => module.options[module.correct])));

console.log('learning rules ok');

import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5005/api';

describe('PlaceWise REST API & End-to-End Integration Tests', () => {
  let studentToken = null;
  let adminToken = null;
  let sampleDriveId = null;

  it('1. Health check returns OK', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'OK');
  });

  it('2. List institutions returns active institutions', async () => {
    const res = await fetch(`${BASE_URL}/institutions`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length >= 2);
    const amity = body.data.find(i => i.code === 'AUK');
    assert.ok(amity);
  });

  it('3. Student Login returns valid JWT and user payload', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rohan.cse@auk.edu',
        password: 'Demo@1234'
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
    assert.strictEqual(body.user.role, 'STUDENT');
    studentToken = body.token;
  });

  it('4. Authenticated /auth/me returns student profile and preference mode', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.preferenceMode, 'TECHNICAL');
    assert.strictEqual(body.user.studentProfile.branch, 'CSE');
  });

  it('5. Opportunity listing retrieves campus and external opportunities', async () => {
    const res = await fetch(`${BASE_URL}/opportunities`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length > 0);
    sampleDriveId = body.data[0].id;
  });

  it('6. CPIE Recommendations splits opportunities into Recommended and Explore Other', async () => {
    const res = await fetch(`${BASE_URL}/opportunities/recommendations`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.recommended);
    assert.ok(body.data.exploreOther);
    // Rohan is TECHNICAL, so technical opportunities should be in recommended
    for (const rec of body.data.recommended) {
      assert.strictEqual(rec.eligibility.status, 'ELIGIBLE');
      assert.strictEqual(rec.recommendation.section, 'RECOMMENDED');
    }
  });

  it('7. Skill-Gap Impact Analysis returns aggregated missing desirable skills', async () => {
    const res = await fetch(`${BASE_URL}/opportunities/skill-gaps`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.gaps);
    assert.match(body.data.disclaimer, /opportunity-impact indicator/);
  });

  it('8. Duplicate application prevention returns 409 Conflict', async () => {
    // Rohan already applied to Drive 1 in seed data!
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ driveId: 1, notes: 'Duplicate test attempt' })
    });
    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.match(body.error, /Duplicate application/);
  });

  it('9. Placement Admin login and institutional drive access', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'placement@auk.placewise.io',
        password: 'Demo@1234'
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.user.role, 'PLACEMENT_ADMIN');
    adminToken = body.token;

    const drivesRes = await fetch(`${BASE_URL}/admin/drives`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(drivesRes.status, 200);
    const drivesData = await drivesRes.json();
    assert.strictEqual(drivesData.success, true);
    assert.ok(drivesData.data.length > 0);
  });

  it('10. Platform Admin can access moderation queue', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@placewise.io',
        password: 'Demo@1234'
      })
    });
    assert.strictEqual(res.status, 200);
    const platUser = await res.json();
    assert.strictEqual(platUser.user.role, 'PLATFORM_ADMIN');

    const modRes = await fetch(`${BASE_URL}/platform/external-opportunities`, {
      headers: { Authorization: `Bearer ${platUser.token}` }
    });
    assert.strictEqual(modRes.status, 200);
    const modData = await modRes.json();
    assert.strictEqual(modData.success, true);
    assert.ok(modData.data.length > 0);
  });
});

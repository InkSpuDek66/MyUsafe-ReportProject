// backend/tests/hooks.test.js
// Global test hooks 
const { connectTestDb, clearAllCollections, closeTestDb } = require('./setup');

//  tests 
before(async function () {
  this.timeout(10000);
  try {
    await connectTestDb();
  } catch (error) {
    console.error(' :', error);
    process.exit(1);
  }
});

//  collection  test
afterEach(async function () {
  await clearAllCollections();
});

//  tests 
after(async function () {
  try {
    await closeTestDb();
  } catch (error) {
    console.error(':', error);
  }
});
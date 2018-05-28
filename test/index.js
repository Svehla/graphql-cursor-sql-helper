import 'babel-polyfill'
import assert from 'assert';
import { connectionFromPromisedSqlResult } from '../lib'

const fakeData = [
  { id: 0, name: "a" },
  { id: 1, name: "b" },
  { id: 2, name: "c" },
  { id: 3, name: "d" },
  { id: 4, name: "e" }
]

const getFakeSqlData = ({ offset, limit }) => {
  const firstIndex = offset
  const lastIndex = offset + limit
  return fakeData.splice(firstIndex, lastIndex)
}

describe('sql-graphql-cursor-helper', () => {
  describe('connectionFromPromisedSqlResult', async () => {

    // possible args
    // const args = {
    //   after,
    //   before,
    //   first: 2,
    //   last
    // }
    it('get correct totalCount', async () => {
      const mockTotalCount = 5
      const lastNItems = 4
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { last: lastNItems },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.equal(sqlResult.totalCount, mockTotalCount);
      assert.equal(sqlResult.edges.length, lastNItems);
    });
  });
});
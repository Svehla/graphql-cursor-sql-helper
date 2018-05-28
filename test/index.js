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

describe('Sql-graphql-cursor-helper', () => {
  describe('Check connectionFromPromisedSqlResult', async () => {
    // TODO: implement test for each functionality
    // possible args
    // const args = {
    //   after,
    //   before,
    //   first: 2,
    //   last
    // }
    it('Get correct totalCount', async () => {
      const mockTotalCount = 5
      const lastNItems = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { last: lastNItems },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.equal(sqlResult.totalCount, mockTotalCount);
      assert.equal(sqlResult.edges.length, lastNItems);
      assert.equal(sqlResult.edges[1].node.id, 3);
      assert.equal(sqlResult.edges[2].node.id, 4);
    });
  });
});
import 'babel-polyfill'
import assert from 'assert';
import { connectionFromPromisedSqlResult } from '../lib'
import { offsetToCursor } from 'graphql-relay'

// TODO: implement [ 'A', 'B', 'C', 'D', 'E' ]
// https://github.com/graphql/graphql-relay-js/blob/4fdadd3bbf3d5aaf66f1799be3e4eb010c115a4a/src/connection/__tests__/arrayconnection.js#L658
const fakeData = [
  { id: 0, name: "0" },
  { id: 1, name: "a" },
  { id: 2, name: "b" },
  { id: 3, name: "c" },
  { id: 4, name: "d" }
]

const getFakeSqlData = ({ offset, limit }) => {
  const firstIndex = offset
  const lastIndex = offset + limit
  return fakeData.slice(firstIndex, lastIndex)
}

describe('Sql-graphql-cursor-helper', () => {
  describe('Check connectionFromPromisedSqlResult', async () => {
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
    });

    it('Check last param', async () => {
      const mockTotalCount = 5
      const lastNItems = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { last: lastNItems },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.equal(sqlResult.edges.length, lastNItems);
      assert.equal(sqlResult.edges[0].node.id, 2);
      assert.equal(sqlResult.edges[0].node.name, "b");
      assert.equal(sqlResult.edges[1].node.id, 3);
      assert.equal(sqlResult.edges[2].node.id, 4);
      assert.equal(sqlResult.edges[2].node.name, "d");
    });

    it('Check first param', async () => {
      const mockTotalCount = 50
      const lastNItems = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { first: lastNItems },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.equal(sqlResult.edges.length, lastNItems);
      assert.equal(sqlResult.edges[0].node.id, 0);
      assert.equal(sqlResult.edges[0].node.name, "0");
      assert.equal(sqlResult.edges[1].node.id, 1);
      assert.equal(sqlResult.edges[2].node.id, 2);
      assert.equal(sqlResult.edges[2].node.name, "b");
    });

    it('Start & end cursor', async () => {
      const mockTotalCount = 5
      const firstNItem = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { first: firstNItem },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.equal(sqlResult.edges.length, firstNItem);
      assert.equal(sqlResult.pageInfo.startCursor, offsetToCursor(0));
      // last index of mockedDataArray
      assert.equal(sqlResult.pageInfo.endCursor, offsetToCursor(4));
    });

    it('validate after cursor ', async () => {
      const mockTotalCount = 5
      const firstNItem = 2
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        {
          // get items after first index
          after: offsetToCursor(1),
          first: firstNItem
        },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      console.log(`JSON.stringify(sqlResult, null, 2)`)
      console.log(JSON.stringify(sqlResult, null, 2))
      assert.equal(sqlResult.edges.length, 2);
      assert.equal(sqlResult.edges[0].cursor, offsetToCursor(2));
      assert.equal(sqlResult.edges[0].node.id, 2);
    });

    it('validate before cursor ', async () => {
      const mockTotalCount = 5
      const firstNItem = 2
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        {
          // get items after first index
          before: offsetToCursor(1),
          first: firstNItem
        },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      console.log(`JSON.stringify(sqlResult, null, 2)`)
      console.log(JSON.stringify(sqlResult, null, 2))
      assert.equal(sqlResult.edges.length, 1);
      assert.equal(sqlResult.edges[0].cursor, offsetToCursor(0));
      assert.equal(sqlResult.edges[0].node.id, 0);
    });


    // tests for empty sql tablw
    it('Start & end cursor for empty array', async () => {
      const mockTotalCount = 0
      const firstNItem = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { first: firstNItem },
        ({ offset, limit }) => [] // return empty array
      )
      assert.equal(sqlResult.pageInfo.startCursor, null);
      assert.equal(sqlResult.pageInfo.endCursor, null);
      assert.equal(sqlResult.pageInfo.hasPreviousPage, false);
      assert.equal(sqlResult.pageInfo.hasNextPage, false);
      assert.deepEqual(sqlResult.edges, []);
      assert.equal(sqlResult.edges.length, 0);
    });

  });
});
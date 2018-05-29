import 'babel-polyfill'
import assert from 'assert';
import { connectionFromPromisedSqlResult } from '../lib'
import { offsetToCursor } from 'graphql-relay'

// tests are inspired by:
// https://github.com/graphql/graphql-relay-js/blob/4fdadd3bbf3d5aaf66f1799be3e4eb010c115a4a/src/connection/__tests__/arrayconnection.js#L658

const fakeData = [ 'A', 'B', 'C', 'D', 'E' ]

const getFakeSqlData = ({ offset, limit }) => {
  const firstIndex = offset
  const lastIndex = offset + limit
  return fakeData.slice(firstIndex, lastIndex)
}

describe('Sql-graphql-cursor-helper', () => {
  describe('Check connectionFromPromisedSqlResult', async () => {
    it('works with last arg', async () => {
      const mockTotalCount = 5
      const lastNItems = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { last: lastNItems },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.deepEqual(sqlResult, {
        edges: [
          {
            node: 'C',
            cursor: offsetToCursor(2),
          },
          {
            node: 'D',
            cursor: offsetToCursor(3),
          },
          {
            node: 'E',
            cursor: offsetToCursor(4),
          },
        ],
        pageInfo: {
          startCursor: offsetToCursor(0),
          endCursor: offsetToCursor(4),
          hasPreviousPage: true,
          hasNextPage: false,
        },
        totalCount: 5
      });
    });

    it('works with first arg', async () => {
      const mockTotalCount = 50
      const lastNItems = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { first: lastNItems },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.deepEqual(sqlResult, {
        edges: [
          {
            node: 'A',
            cursor: offsetToCursor(0),
          },
          {
            node: 'B',
            cursor: offsetToCursor(1),
          },
          {
            node: 'C',
            cursor: offsetToCursor(2),
          },
        ],
        pageInfo: {
          startCursor: offsetToCursor(0),
          endCursor: offsetToCursor(49),
          hasPreviousPage: false,
          hasNextPage: true,
        },
        totalCount: 50
      });
    });


    it('works with first & after args', async () => {
      const mockTotalCount = 5
      const firstNItems = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        {
          first: firstNItems,
          after: offsetToCursor(2)
        },
        ({ offset, limit }) => getFakeSqlData({ offset, limit })
      )
      assert.deepEqual(sqlResult, {
        edges: [
          {
            node: 'D',
            cursor: offsetToCursor(3),
          },
          {
            node: 'E',
            cursor: offsetToCursor(4),
          }
        ],
        pageInfo: {
          startCursor: offsetToCursor(0),
          endCursor: offsetToCursor(4),
          // hasPreviousPage has same behavior as relay-graphql-js 
          hasPreviousPage: false,
          hasNextPage: false,
        },
        totalCount: 5
      });
    });
    

    it('works with before arg', async () => {
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
      assert.deepEqual(sqlResult, {
        edges: [
          {
            node: 'A',
            cursor: offsetToCursor(0),
          }
        ],
        pageInfo: {
          startCursor: offsetToCursor(0),
          endCursor: offsetToCursor(4),
          hasPreviousPage: false,
          // hasPreviousPage has same behavior as relay-graphql-js 
          hasNextPage: false,
        },
        totalCount: 5
      });
    });


    // tests for empty sql tablw
    it('works with empty array', async () => {
      const mockTotalCount = 0
      const firstNItem = 3
      const sqlResult = await connectionFromPromisedSqlResult(
        mockTotalCount,
        { first: firstNItem },
        ({ offset, limit }) => [] // return empty array
      )
      assert.deepEqual(sqlResult, {
        edges: [],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          // hasPreviousPage has same behavior as relay-graphql-js 
          hasNextPage: false,
        },
        totalCount: 0
      });
    });
  });
});
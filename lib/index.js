import {
  offsetToCursor,
  getOffsetWithDefault
} from 'graphql-relay'
require("babel-core/register");
require("babel-polyfill");
// part of logic for this source is borrowed from
// https://github.com/graphql/graphql-relay-js/blob/master/src/utils/base64.js
// for identify of row we use index (not ID)
export const connectionToSqlQuery = async (
  totalCountMaybePromise,
  args,
  getDataCb
) => {
  const totalCount = await totalCountMaybePromise
  const { after, before, first, last } = args
  const sliceStart = 0
  const sliceEnd = sliceStart + totalCount
  const beforeOffset = getOffsetWithDefault(before, totalCount)
  const afterOffset = getOffsetWithDefault(after, -1)

  let startOffset = Math.max(
    sliceStart - 1,
    afterOffset,
    -1
  ) + 1
  let endOffset = Math.min(
    sliceEnd,
    beforeOffset,
    totalCount
  )

  if (typeof first === 'number') {
    if (first < 0) {
      throw new Error('Argument "first" must be a non-negative integer')
    }

    endOffset = Math.min(
      endOffset,
      startOffset + first
    )
  }
  if (typeof last === 'number') {
    if (last < 0) {
      throw new Error('Argument "last" must be a non-negative integer')
    }

    startOffset = Math.max(
      startOffset,
      endOffset - last
    )
  }
  // recalculate slice to offset and limit
  const offset = Math.max(startOffset - sliceStart, 0)
  const limitIndex = totalCount - (sliceEnd - endOffset)
  const limit = limitIndex - offset

  let sqlResult
  // fetch data from database
  if (limit === -1 || limit === 0) {
    sqlResult = []
  } else {
    sqlResult = await getDataCb({ limit, offset })
  }
  const edges = sqlResult.map((row, index) => ({
    cursor: offsetToCursor(offset + index),
    node: row
  }))

  const lowerBound = after ? (afterOffset + 1) : 0
  const upperBound = before ? beforeOffset : totalCount
  const lastNodeIndex = totalCount - 1 // index start from 0
  return {
    totalCount,
    pageInfo: {
      // if length === 0 than cursors are null => no data provided
      startCursor: totalCount > 0 ? offsetToCursor(0) : null,
      endCursor: totalCount > 0 ? offsetToCursor(lastNodeIndex) : null,
      hasPreviousPage:
        typeof last === 'number' ? startOffset > lowerBound : false,
      hasNextPage:
        typeof first === 'number' ? endOffset < upperBound : false
    },
    edges
  }
}

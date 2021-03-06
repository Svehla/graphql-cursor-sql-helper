"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectionToSqlQuery = undefined;

var _graphqlRelay = require("graphql-relay");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require("babel-core/register");
require("babel-polyfill");
// part of logic for this source is borrowed from
// https://github.com/graphql/graphql-relay-js/blob/master/src/utils/base64.js
// for identify of row we use index (not ID)
var connectionToSqlQuery = exports.connectionToSqlQuery = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(totalCountMaybePromise, args, getDataCb) {
    var totalCount, after, before, first, last, sliceStart, sliceEnd, beforeOffset, afterOffset, startOffset, endOffset, offset, limitIndex, limit, sqlResult, edges, lowerBound, upperBound, lastNodeIndex;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return totalCountMaybePromise;

          case 2:
            totalCount = _context.sent;
            after = args.after, before = args.before, first = args.first, last = args.last;
            sliceStart = 0;
            sliceEnd = sliceStart + totalCount;
            beforeOffset = (0, _graphqlRelay.getOffsetWithDefault)(before, totalCount);
            afterOffset = (0, _graphqlRelay.getOffsetWithDefault)(after, -1);
            startOffset = Math.max(sliceStart - 1, afterOffset, -1) + 1;
            endOffset = Math.min(sliceEnd, beforeOffset, totalCount);

            if (!(typeof first === 'number')) {
              _context.next = 14;
              break;
            }

            if (!(first < 0)) {
              _context.next = 13;
              break;
            }

            throw new Error('Argument "first" must be a non-negative integer');

          case 13:

            endOffset = Math.min(endOffset, startOffset + first);

          case 14:
            if (!(typeof last === 'number')) {
              _context.next = 18;
              break;
            }

            if (!(last < 0)) {
              _context.next = 17;
              break;
            }

            throw new Error('Argument "last" must be a non-negative integer');

          case 17:

            startOffset = Math.max(startOffset, endOffset - last);

          case 18:
            // recalculate slice to offset and limit
            offset = Math.max(startOffset - sliceStart, 0);
            limitIndex = totalCount - (sliceEnd - endOffset);
            limit = limitIndex - offset;
            sqlResult = void 0;
            // fetch data from database

            if (!(limit === -1 || limit === 0)) {
              _context.next = 26;
              break;
            }

            sqlResult = [];
            _context.next = 29;
            break;

          case 26:
            _context.next = 28;
            return getDataCb({ limit: limit, offset: offset });

          case 28:
            sqlResult = _context.sent;

          case 29:
            edges = sqlResult.map(function (row, index) {
              return {
                cursor: (0, _graphqlRelay.offsetToCursor)(offset + index),
                node: row
              };
            });
            lowerBound = after ? afterOffset + 1 : 0;
            upperBound = before ? beforeOffset : totalCount;
            lastNodeIndex = totalCount - 1; // index start from 0

            return _context.abrupt("return", {
              totalCount: totalCount,
              pageInfo: {
                // if length === 0 than cursors are null => no data provided
                startCursor: totalCount > 0 ? (0, _graphqlRelay.offsetToCursor)(0) : null,
                endCursor: totalCount > 0 ? (0, _graphqlRelay.offsetToCursor)(lastNodeIndex) : null,
                hasPreviousPage: typeof last === 'number' ? startOffset > lowerBound : false,
                hasNextPage: typeof first === 'number' ? endOffset < upperBound : false
              },
              edges: edges
            });

          case 34:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function connectionToSqlQuery(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
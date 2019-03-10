'use strict';

const RightTrackDBTemplate = require('right-track-db');
const sqlite3 = require('sqlite3');

/**
 * RightTrackDB Implementation
 * -------------------------------
 * This Class is an implementation of the abstract `RightTrackDB` Class.
 *
 * This implementation uses the node `sqlite3` module to provide the
 * actual SQLite functionality.
 *
 * @class
 */
class RightTrackDB extends RightTrackDBTemplate {

  /**
   * Right Track Database Constructor
   * @constructor
   * @param {RightTrackAgency} agency The Right Track Agency this DB will be used to query
   */
  constructor(agency) {
    super(agency);
    this.db = new sqlite3.Database(this.location);
  }


  /**
   * Select multiple rows from the database
   * @param {string} statement Select Statement
   * @param {function} callback {@link RightTrackDB~selectCallback|selectCallback} callback function
   */
  select(statement, callback) {
    console.log("==> QUERY: [SELECT] " + statement);
    this.db.all(statement, function(err, rows) {

      // SQLite Error
      if (err) {
        console.error('ERROR SELECTING RESULTS FROM DB');
        console.error(statement);
        console.error(err);
        return callback(err);
      }

      // Return Results
      return callback(null, rows);

    });
  }

  /**
   * Select a single row from the database.  If no results are selected, this
   * will return undefined.  If more than 1 results are selected it will
   * return the first result.
   * @param {string} statement Select Statement
   * @param {function} callback {@link RightTrackDB~getCallback|getCallback} callback function
   */
  get(statement, callback) {
    console.log("==> QUERY: [GET] " + statement);
    this.db.get(statement, function(err, row) {

      // SQLite ERROR
      if (err) {
        console.error('ERROR SELECTING FIRST RESULT FROM DB');
        console.error(statement);
        console.error(err);
        return callback(err);
      }

      // Return Result
      return callback(null, row);

    });
  }

}


// ==== CALLBACK DEFINITIONS ==== //

/**
 * This callback is performed after performing a SELECT query
 * that can return multiple rows.
 * @callback RightTrackDB~selectCallback
 * @param {Error} error Database Query Error
 * @param {object[]} [rows] Selected rows
 */

/**
 * This callback is performed after performing a SELECT query
 * that will return the first row.
 * @callback RightTrackDB~getCallback
 * @param {Error} error Database Query Error
 * @param {object} [row] First selected row
 */


module.exports = RightTrackDB;
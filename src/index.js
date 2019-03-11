'use strict';

const RightTrackDBTemplate = require('right-track-db');
const sql = require('sql.js');

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
   * @param {Uint8Array} data A uInt8Array containing the database data
   */
  constructor(agency, data) {
    super(agency);
    this.db = new sql.Database(data);
  }


  /**
   * Select multiple rows from the database
   * @param {string} statement Select Statement
   * @param {function} callback {@link RightTrackDB~selectCallback|selectCallback} callback function
   */
  select(statement, callback) {
    console.log("==> QUERY: [SELECT] " + statement);

    // Execute the statement
    let contents = this.db.exec(statement);

    // SQLite Error
    if ( contents === undefined || contents.length !== 1 ) {
      return callback(null, []);
    }

    // Get the columns and set the rows
    let columns = contents[0].columns;
    let rows = [];

    // Parse the values
    for ( let i = 0; i < contents[0].values.length; i++ ) {
      let values = contents[0].values[i];
      let row = {};
      for ( let j = 0; j < values.length; j++ ) {
        row[columns[j]] = values[j];
      }
      rows[i] = row;
    }

    // Return the Results
    return callback(null, rows);

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

    // Execute Statement
    let contents = this.db.exec(statement);

    // No results returned
    if ( contents === undefined || contents.length !== 1 || contents[0].values.length < 1 ) {
      return callback(null, undefined);
    }

    // Get the columns and set the row
    let columns = contents[0].columns;
    let row = {};

    // Get the first row's properties
    let values = contents[0].values[0];
    for ( let j = 0; j < values.length; j++ ) {
      row[columns[j]] = values[j]
    }

    // Return the results
    return callback(null, row);

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
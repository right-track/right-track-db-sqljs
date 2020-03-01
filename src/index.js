'use strict';

const RightTrackDBTemplate = require("right-track-db");
const RightTrackAgency = require("right-track-agency");

// SQL JS CONFIG
let INIT_SQL_JS = undefined;
let CONFIG = undefined;

// SQL JS DATABASE
let DB = undefined;


/**
 * RightTrackDB Implementation
 * -------------------------------
 * This Class is an implementation of the abstract `RightTrackDB` Class.
 *
 * This implementation uses the `sql.js` javascript module to provide the
 * actual SQLite functionality.
 *
 * NOTE: This class is designed to use the Web Worker version of `sql.js`
 *
 * @class
 */
class RightTrackDB extends RightTrackDBTemplate {

    /**
     * Right Track Database Constructor
     * @constructor
     * @param  {Object}   agencyConfig  The configuration of the Right Track Agency
     * @param  {Array}    array         A Uint8Array containing the database data
     * @param  {Function} [callback]    Callback function()
     */
    constructor(agencyConfig, array, callback) {
        super(new RightTrackAgency(agencyConfig));
        INIT_SQL_JS(CONFIG).then(function(SQL) {
            DB = new SQL.Database(array);
            if ( callback ) return callback();
        });
    }

    /**
     * Select multiple rows from the database
     * @param {string} statement Select Statement
     * @param {function} callback {@link RightTrackDB~selectCallback|selectCallback} callback function
     */
    select(statement, callback) {

        // Make query
        let rows = DB.exec(statement);
        let results = rows[0];
        let columns = results.columns;
        let values = results.values;

        // No results found, return empty array
        if ( !values ) {
            return callback(null, []);
        }

        // Return results of first row
        else {
            let rtn = [];
            for ( let i = 0; i < values.length; i++ ) {
                let rtn_row = {};
                for ( let j = 0; j < columns.length; j++ ) {
                    rtn_row[columns[j]] = values[i][j]
                }
                rtn.push(rtn_row);
            }
            return callback(null, rtn);
        }        

    }

    /**
     * Select a single row from the database.  If no results are selected, this
     * will return undefined.  If more than 1 results are selected it will
     * return the first result.
     * @param {string} statement Select Statement
     * @param {function} callback {@link RightTrackDB~getCallback|getCallback} callback function
     */
    get(statement, callback) {

        // Make query
        let rows = DB.exec(statement);
        let results = rows[0];
        let columns = results.columns;
        let values = results.values;

        // No results found, return empty array
        if ( !values || values.length === 0 ) {
            return callback(null, undefined);
        }

        // Return results of first row
        else {
            let rtn = {};
            let row = values[0];
            for ( let i = 0; i < columns.length; i++ ) {
                rtn[columns[i]] = row[i];
            }
            return callback(null, rtn);
        }       

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



module.exports = function(initSqlJs, config) {
    if ( !initSqlJs ) {
        console.log("ERROR: initSqlJs function must be specified");
        return undefined;
    }
    INIT_SQL_JS = initSqlJs;
    CONFIG = config;
    return RightTrackDB;
}
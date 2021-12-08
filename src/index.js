'use strict';

const RightTrackDBTemplate = require('right-track-core/modules/classes/RightTrackDB');
const RightTrackAgency = require('right-track-core/modules/classes/RightTrackAgency');

// SQL JS WORKER
let worker = undefined;

// Registered Callbacks
let _SQL_CALLBACK_ID = 0;
let _SQL_CALLBACKS = {};


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
     */
    constructor(agencyConfig, array) {
        super(new RightTrackAgency(agencyConfig));
        
        // Register Listeners
        worker.onmessage = this._handleMessage;
        worker.onerror = this._handleError;

        // Open Database
        worker.postMessage({
            id: _registerCallback(),
            action: 'open',
            buffer: array
        });
    }

    /**
     * Select multiple rows from the database
     * @param {string} statement Select Statement
     * @param {function} callback {@link RightTrackDB~selectCallback|selectCallback} callback function
     */
    select(statement, callback) {

        // Register the callback
        let id = _registerCallback(function(results) {
            return callback(null, results);
        });

        // Send Query Request
        worker.postMessage({
            id: id,
            action: 'exec',
            sql: statement
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

        // Register the callback
        let id = _registerCallback(function(results) {
            if ( results ) {
                if ( results.length === 0 ) {
                    return callback(null, undefined);
                }
                else {
                    return callback(null, results[0]);
                }
            }
            else {
                return callback(null, undefined);
            }
        });

        // Send Query Request
        worker.postMessage({
            id: id,
            action: 'exec',
            sql: statement
        }); 

    }


    /**
     * SQL Worker Message Handler
     * - Parse the event results
     * - Send results to registered callback
     * @param  {Event} event Message Event
     * @private
     */
    _handleMessage(event) {
        let id = event.data.id;
        let callback = _getCallback(id);

        // Return parsed results
        if ( event.data.results ) {
            let contents = event.data.results;
            
            // SQLite Error
            if ( contents === undefined || contents.length !== 1 ) {
                return callback([]);
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
            if ( callback ) {
                return callback(rows);
            }
        }

        // Return raw data
        else {
            if ( callback ) {
                return callback(event.data);
            }
        }

    }


    /**
     * SQL Worker Error Handler
     * @param  {Error} error SQL Worker Error
     * @private
     */
    _handleError(error) {
        console.error("SQL ERROR: " + error.message);
    }

}



/**
 * Register a callback function and return its ID
 * @param  {Function} callback Callback funtction
 * @return {int}               Callback ID to pass to worker
 * @private
 */
function _registerCallback(callback) {
    _SQL_CALLBACK_ID = _SQL_CALLBACK_ID + 1;
    _SQL_CALLBACKS[_SQL_CALLBACK_ID.toString()] = callback;
    return _SQL_CALLBACK_ID;
}

/**
 * Get the registered callback function
 * @param  {int}      id   Callback function ID
 * @return {Function}      Callback function
 * @private
 */
function _getCallback(id) {
    let callback = _SQL_CALLBACKS[id.toString()];
    delete _SQL_CALLBACKS[id.toString()];
    return callback;
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



module.exports = function(workerLocation) {
    if ( !workerLocation ) {
        console.log("ERROR: SQL Worker Location must be specified");
        return undefined;
    }
    worker = new Worker(workerLocation);
    return RightTrackDB;
}

import con from './connection.js';
class Query {
    /**
     * Executes a SQL query and returns the results.
     * @param {string} query
     * @returns {Promise<any>} 
     */
    static query = async (query) => {
        try {
            const results = await new Promise((resolve, reject) => {
                con.query(query, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Formats the filters for SQL queries.
     * @param {Array<Array<string>>} filters - An array of filters where each filter is an array containing column, condition, and value.
     * Example: [['name', '=', 'John'], ['age', '>', 20]] or [['name', 'john']]
     * @returns {string} - The formatted filter string for SQL queries.
     */
    static formattedFilters = (filters) => {
        if (filters.length === 0) {
            return '';
        }
    
        let formattedFilters = 'WHERE ';
        filters.forEach((filter, i) => {
            let column = filter[0];
            let condition, value;
    
            if (filter.length === 2) {
                condition = '=';
                value = filter[1];
            } else if (filter.length === 3) {
                condition = filter[1];
                value = filter[2];
            } else {
                throw new Error('Invalid filter format');
            }
    
            if (typeof value === 'string') {
                value = `'${value.replace(/'/g, "''")}'`; 
            }
    
            formattedFilters += `${column} ${condition} ${value}`;
            if (i < filters.length - 1) {
                formattedFilters += ' AND ';
            }
        });
    
        return formattedFilters;
    }


    /**
     * Selects rows from a table with optional filters.
     * @param {string} table - The name of the table to select from.
     * @param {Array<Array<string>>} [filters] - see formattedFilters
     * @returns {Promise<any>} - The results of the query.
     */
    static select = async (table, filters) => {
        let query = `SELECT * FROM ${table}`;
        if (filters) {
            query = `${query} ${this.formattedFilters(filters)}`;
        }
        console.log("query", query);
        return await Query.query(query);
    }

    /**
     * Inserts a new row into a table.
     * @param {string} table - The name of the table to insert into.
     * @param {Object} data - {column: value} pairs to update.  
     * @returns {Promise<any>} - The result of the query.
     */
    static insert = async (table, data) => {
        let query = `INSERT INTO ${table} (`;
        let columns = '';
        let values = '';
        for (const [key, value] of Object.entries(data)) {
            columns += `${key}, `;
            values += `'${value}', `;
        }
        columns = columns.slice(0, -2);
        values = values.slice(0, -2);
        query += `${columns}) VALUES (${values})`;
        return await this.query(query);
    }

    /**
     * Updates rows in a table with specified data and filters.
     * @param {string} table - The name of the table to update.
     * @param {Object} data - {column: value} pairs to update.  
     * @param {Array<Array<string>>} filters - see formattedFilters
     * @returns {Promise<any>} - The result of the query.
     */
    static update = async (table, data, filters) => {
        let query = `UPDATE ${table} SET `;
        for (const [key, value] of Object.entries(data)) {
            query += `${key} = '${value}', `;
        }
        query = query.slice(0, -2);
        query += ' WHERE ' + this.formattedFilters(filters);
        return await this.query(query);
    }

    /**
     * Creates a new table with specified columns.
     * @param {string} table - The name of the table to create.
     * @param {Object} columns - {column: {type: string, pk: bool?, null: bool?, fkTable: string? : fkColumn: string? }} pairs for the columns to create.
     */
    static createTable = async (table, columns) => {
        let query = `CREATE TABLE ${table} (`;
        const columnDefinitions = [];
        const foreignKeys = [];

        for (const [columnName, columnProps] of Object.entries(columns)) {
            let columnDef = `${columnName} ${columnProps.type}`;
            if (columnProps.pk) {
                columnDef += ' PRIMARY KEY';
                if (columnProps.type.toLowerCase() === 'int') {
                    columnDef += ' AUTO_INCREMENT';
                }
            }
            if (columnProps.null === false) {
                columnDef += ' NOT NULL';
            }
            if (columnProps.fkTable && columnProps.fkColumn) {
                foreignKeys.push(`FOREIGN KEY (${columnName}) REFERENCES ${columnProps.fkTable}(${columnProps.fkColumn})`);
            }

            columnDefinitions.push(columnDef);
        }
        query += columnDefinitions.join(', ');

        if (foreignKeys.length > 0) {
            query += ', ' + foreignKeys.join(', ');
        }

        query += ');';
        try {
            const results = await new Promise((resolve, reject) => {
                con.query(query, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    }

}


export default Query;
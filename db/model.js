import Query from './query.js';
class Model {
  constructor(table) {
    this.table = table;
    this.primaryKey = table + 'Id';
  }

/**
 * @param {Object} filters - see Query formattedFilters
 * @returns {Promise<Object[]>}  The result of the query.
 */
  select = async (filters) => {
    return await Query.select(this.table, filters);
  }

 /**
 * @param {Object} filters - The filters to apply to the select query.
 * @returns {Promise<Object[]>} The result of the query.
 */
insert = async (data) => {
    return await Query.insert(this.table, data);
}

}

export default Model;
/**
 * Type definitions for RentChain backend
 */

/**
 * @typedef {Object} Property
 * @property {number} id
 * @property {number} property_id
 * @property {string} landlord
 * @property {string} title
 * @property {string} description
 * @property {string} location
 * @property {number} price
 * @property {string[]} image_urls
 * @property {string} status
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} Payment
 * @property {number} id
 * @property {string} payment_id
 * @property {string} tenant
 * @property {number} property_id
 * @property {number} amount
 * @property {string} currency
 * @property {string} payment_method
 * @property {string} status
 * @property {string} tx_hash
 * @property {string} mpesa_receipt
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Agreement
 * @property {number} id
 * @property {number} agreement_id
 * @property {string} tenant
 * @property {string} landlord
 * @property {number} property_id
 * @property {number} start_date
 * @property {number} end_date
 * @property {number} rent_amount
 * @property {string} status
 * @property {Date} signed_at
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Notification
 * @property {number} id
 * @property {string} user_address
 * @property {string} title
 * @property {string} message
 * @property {string} type
 * @property {boolean} read
 * @property {Date} created_at
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {number} totalProperties
 * @property {number} activeProperties
 * @property {number} totalAgreements
 * @property {number} activeAgreements
 * @property {number} totalPayments
 * @property {number} totalVolume
 * @property {Array} popularLocations
 * @property {Array} monthlyRevenue
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} MpesaPaymentResult
 * @property {boolean} success
 * @property {string} [checkoutRequestId]
 * @property {string} [customerMessage]
 * @property {string} [error]
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [error]
 * @property {Object} [pagination]
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} pages
 */

module.exports = {};
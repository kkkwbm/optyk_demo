import { PRODUCT_TYPES } from '../../../constants';

/**
 * Cleans product data by removing fields that are not relevant to the specific product type
 * @param {Object} data - The raw form data
 * @param {string} productType - The product type (FRAME, SUNGLASSES, CONTACT_LENS, SOLUTION, OTHER)
 * @returns {Object} - Cleaned data with only relevant fields
 */
export function cleanProductData(data, productType) {
  const cleanedData = { ...data };

  // Fields that are common to all product types
  const commonFields = ['brandId', 'notes', 'sellingPrice', 'quantity', 'locationId', 'addToAllOfType'];

  // Fields specific to each product type
  const typeSpecificFields = {
    [PRODUCT_TYPES.FRAME]: ['model', 'color', 'size'],
    [PRODUCT_TYPES.SUNGLASSES]: ['model', 'color', 'size'],
    [PRODUCT_TYPES.CONTACT_LENS]: ['model', 'color', 'size', 'lensType', 'power'],
    [PRODUCT_TYPES.SOLUTION]: ['name', 'volume'],
    [PRODUCT_TYPES.OTHER]: ['name'],
  };

  // Get allowed fields for this product type
  const allowedFields = [...commonFields, ...(typeSpecificFields[productType] || [])];

  // Remove fields that are not allowed for this product type
  Object.keys(cleanedData).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete cleanedData[key];
    }
  });

  // Remove empty string values (backend expects null or undefined for optional fields)
  Object.keys(cleanedData).forEach(key => {
    if (cleanedData[key] === '') {
      delete cleanedData[key];
    }
  });

  return cleanedData;
}

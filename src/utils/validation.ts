import Joi from "joi";
import { ICustomValidationFields } from "../types";
import { isValidObjectId } from "mongoose";

export const checkForRequiredInput: ICustomValidationFields = (value, helpers, fieldToCheck, valueToCheck) => {
    const schema = helpers.state.ancestors[helpers.state.ancestors.length - 1]

    // for easy debugging
    console.log('all schemas involved:', helpers.state.ancestors);
    console.log(`this is the property we're trying to validate: ${helpers.state.path.join(':')}`);
    console.log('we checked the schema:', schema);
    console.log(`for its property: ${fieldToCheck} for the value: ${schema[fieldToCheck]}`);

    if(valueToCheck === 'isProvided') {
        if (schema[fieldToCheck]) return value
    } else {
        if (schema[fieldToCheck] === valueToCheck) return value
    }

    return helpers.error('any.unknown');
}

export const checkMongooseId = (id: string, helpers: any): string => {
  if (!isValidObjectId(id)) {
    console.error("Invalid Object Id");
    return helpers.error("Invalid Object Id");
  }

  return id;
}

export const getValidationFields = (schema: any, fields: string[]) => {
  // Create a new schema that includes only the fields mentioned in the `fields` array
  const filteredSchema = fields.reduce((acc: any, field) => {
    const isRequired = field.endsWith('*');  // Fields with '*' are required
    const fieldName = field.replace('*', '');  // Remove '*' to get the actual field name
    
    if (schema[fieldName]) {
      // Assign the Joi validation based on whether it's required or not
      acc[fieldName] = isRequired
        ? schema[fieldName].required()  // Mark field as required
        : schema[fieldName].optional();  // Otherwise, mark as optional
    }

    return acc;
  }, {});

  // Return Joi object that allows only the specified fields and forbids unknown fields
  return Joi.object(filteredSchema).unknown(false);
};
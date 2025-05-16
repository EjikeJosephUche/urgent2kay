import Joi from 'joi'
import { checkMongooseId } from '../utils'

export const ServiceSchemas = {
  withProviders: Joi.boolean()
    .label('With Providers')
    .messages({
      'boolean.base': 'With Providers must be a boolean.',
    }),

  category: Joi.string()
    .label('Category')
    .required()
    .messages({
      'string.base': 'Category must be a string.',
      'string.empty': 'Category cannot be empty.',
      'any.required': 'Category is required.',
    }),

  provider: Joi.string()
    .label('Provider')
    .messages({
      'string.base': 'Provider must be a string.',
      'string.empty': 'Provider cannot be empty.',
    }),

  network: Joi.string()
    .label('Network')
    .required()
    .messages({
      'string.base': 'Network must be a string.',
      'string.empty': 'Network cannot be empty.',
      'any.required': 'Network is required.',
    }),

  mobile_number: Joi.string()
    .pattern(/^\d+$/)
    .label('Mobile Number')
    .required()
    .messages({
      'string.base': 'Mobile Number must be a string of digits.',
      'string.empty': 'Mobile Number cannot be empty.',
      'string.pattern.base': 'Mobile Number must contain only digits.',
      'any.required': 'Mobile Number is required.',
    }),

  plan: Joi.string()
    .label('Plan')
    .required()
    .messages({
      'string.base': 'Plan must be a string.',
      'string.empty': 'Plan cannot be empty.',
      'any.required': 'Plan is required.',
    }),

  amount: Joi.number()
    .label('Amount')
    .required()
    .messages({
      'number.base': 'Amount must be a number.',
      'number.empty': 'Amount cannot be empty.',
      'any.required': 'Amount is required.',
    }),

  id: Joi.string()
    .custom(checkMongooseId)
    .label('ID')
    .required()
    .messages({
      'string.base': 'ID must be a string.',
      'any.required': 'ID is required.',
    }),

  disco_name: Joi.string()
    .label('Disco Name')
    .required()
    .messages({
      'string.base': 'Disco Name must be a string.',
      'string.empty': 'Disco Name cannot be empty.',
      'any.required': 'Disco Name is required.',
    }),

  meter_number: Joi.number()
    .label('Meter Number')
    .required()
    .messages({
      'number.base': 'Meter Number must be a number.',
      'number.empty': 'Meter Number cannot be empty.',
      'any.required': 'Meter Number is required.',
    }),

  meter_type: Joi.string()
    .label('Meter Type')
    .required()
    .messages({
      'string.base': 'Meter Type must be a string.',
      'string.empty': 'Meter Type cannot be empty.',
      'any.required': 'Meter Type is required.',
    }),

  cablename: Joi.string()
    .label('Cable Name')
    .required()
    .messages({
      'string.base': 'Cable Name must be a string.',
      'string.empty': 'Cable Name cannot be empty.',
      'any.required': 'Cable Name is required.',
    }),

  cableplan: Joi.number()
    .label('Cable Plan')
    .required()
    .messages({
      'number.base': 'Cable Plan must be a number.',
      'number.empty': 'Cable Plan cannot be empty.',
      'any.required': 'Cable Plan is required.',
    }),

  smart_card_number: Joi.number()
    .label('Smart Card Number')
    .required()
    .messages({
      'number.base': 'Smart Card Number must be a number.',
      'number.empty': 'Smart Card Number cannot be empty.',
      'any.required': 'Smart Card Number is required.',
    }),
}

export const ServiceFields = {
  FetchOurServices: {
    query: [
      'withProviders',
      'category'
    ],
  },

  FetchOurPlans: {
    params: [
      'category*'
    ],
    query: [
      'provider'
    ],
  },

  PurchaseData: {
    params: [
      'provider*',
      'planId*'
    ],
    body: [
      'network*',
      'mobile_number*',
      'plan*',
      'amount*'
    ],
  },

  TopUpAirtime: {
    params: [
      'provider*'
    ],
    body: [
      'network*',
      'mobile_number*',
      'amount*'
    ],
  },

  RechargeElectricity: {
    params: [
      'provider*'
    ],
    body: [
      'disco_name*',
      'meter_number*',
      'meter_type*',
      'amount*'
    ],
  },

  SubscribeCable: {
    params: [
      'provider*',
      'planId*'
    ],
    body: [
      'cablename*',
      'smart_card_number*',
      'cableplan*',
      'amount*'
    ],
  },
}

import DateExtension from '@joi/date';
import JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

const regexUrl = /^http:\/\//;
const regexCpf = /^[0-9]{11}$/;
const regexPhone = /^[0-9]{10,11}$/;

const categorySchema = Joi.object({
    name: Joi.string().min(1).required(),
});

const gameSchema = Joi.object({
    name: Joi.string().min(1).required(),
    image: Joi.string().pattern(regexUrl).required(),
    stockTotal: Joi.number().integer().min(1).required(),
    pricePerDay: Joi.number().positive().required(),
    categoryId: Joi.number().integer().positive().required(),
});

const customerSchema = Joi.object({
    name: Joi.string().min(1).required(),
    phone: Joi.string().pattern(regexPhone).required(),
    cpf: Joi.string().pattern(regexCpf).required(),
    birthday: Joi.date().format('YYYY-MM-DD').required(),
});

const rentalSchema = Joi.object({
    customerId: Joi.number().integer().positive().required(),
    gameId: Joi.number().integer().positive().required(),
    rentDate: Joi.date().format('YYYY-MM-DD').required(),
    daysRented: Joi.number().integer().min(1).required(),
    returnDate: Joi.date().format('YYYY-MM-DD').allow(null).required(),
    originalPrice: Joi.number().integer().min(0).required(),
    delayFee: Joi.number().integer().min(0).allow(null).required(),
});

const rentalSchemaPost = Joi.object({
    customerId: Joi.number().integer().positive().required(),
    gameId: Joi.number().integer().positive().required(),
    daysRented: Joi.number().integer().min(1).required(),
});


export {categorySchema, gameSchema, customerSchema, rentalSchema, rentalSchemaPost};
import DateExtension from '@joi/date';
import JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

const regexUrl = /^http:\/\//;
const regexCpf = /^[0-9]{11}$/;
const regexPhone = /^[0-9]{10,11}$/;

const categorieSchema = Joi.object({
    name: Joi.string().alphanum().min(1).required(),
});

const gameSchema = Joi.object({
    name: Joi.string().alphanum().min(1).required(),
    image: Joi.string().pattern(regexUrl).required(),
    stockTotal: Joi.number().integer().min(1).required(),
    pricePerDay: Joi.number().positive().required(),
    categorieId: Joi.number().integer().positive().required(),
});

const costumerSchema = Joi.object({
    name: Joi.string().alphanum().min(1).required(),
    phone: Joi.string().pattern(regexPhone).required(),
    cpf: Joi.string().pattern(regexCpf).required(),
    birthday: Joi.date().format('YYYY-MM-DD').max().required(),
});


export {categorieSchema, gameSchema, costumerSchema};
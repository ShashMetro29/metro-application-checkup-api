import { CountryModel } from '../models/country.model.js'; export const CountryController={list:async(req,res)=>res.json(await CountryModel.all(req.user))};

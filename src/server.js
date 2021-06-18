import express, { json } from 'express';
import cors from 'cors';
import connection from './connectDb.js';
import { categorieSchema, gameSchema, costumerSchema } from './schemas.js';
import { isAllowedName } from './utils.js';

const app = express();
const port_server = 4000;
app.use(cors());
app.use(json());
const routes = {
    categories: '/categories',
    games: '/games',
    costumers: '/costumers',
    rentals: '/rentals'
}

app.get(routes.categories, async (req, res) => {
    try{
        const categories = await connection.query('SELECT * from categories');
        res.status(200);
        return res.send(categories.rows);
    } catch(err){
        return res.sendStatus(404);
    }
});

app.post(routes.categories, async (req, res) => {
    try{
        if(categorieSchema.validate(req.body).error !== undefined){
            return res.sendStatus(400);
        }
        const name = req.body.name;
        if(await isAllowedName(name)){
            const newCategorie = await connection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
            return res.sendStatus(201);
        }
        return res.sendStatus(409);
    } catch(err){
        return res.sendStatus(409);
    }
    
})

app.listen(port_server);
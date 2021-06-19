import express, { json } from 'express';
import cors from 'cors';
import connection from './connectDb.js';
import { categorieSchema, gameSchema, costumerSchema } from './schemas.js';
import { isAllowedCpf, isAllowedName } from './utils.js';

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
        if(await isAllowedName('categories',name)){
            const newCategorie = await connection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
            return res.sendStatus(201);
        }
        return res.sendStatus(409);
    } catch(err){
        return res.sendStatus(409);
    }
    
});

app.get(routes.games, async (req, res) => {
    try{
        const games = await connection.query('SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games.categoryId=categories.id');
        res.status(200);
        return res.send(games.rows);
    }
    catch{
        return res.sendStatus(404);
    }
});

app.post(routes.games, async (req, res) => {
    try{
        if(gameSchema.validate(req.body).error !== undefined){
            return res.sendStatus(400);
        }
        const name = req.body.name;
        const image = req.body.image;
        const stockTotal = req.body.stockTotal;
        const categoryId = req.body.categoryId;
        const pricePerDay = req.body.pricePerDay;
        if(await isAllowedName('games', name)){
            const newGame = connection.query('INSERT INTO games (name, image, stockToal, categoryId, pricePerDay) VALUES ($1, $2, $3, $4, $5)', [name, image, stockTotal, categoryId, pricePerDay]);
            return res.sendStatus(201);
        }
        return res.sendStatus(409);
        
    } catch{
        return res.sendStatus(409);
    }
});

app.get(routes.costumers, async (req, res) => {
    try{
        if(req.query.id){
            const idCostumer = parseInt(req.query.id);
            const costumer = await connection.query('SELECT * from costumers WHERE id=$1', [idCostumer]);
            if(costumer.rows.length !== 1){
                return res.sendStatus(404);
            }
            res.status(200);
            return res.send(costumer.rows[0]);
        }
        const costumers = await connection.query('SELECT * from costumers');
        res.status(200);
        return res.send(costumers.rows);
    } catch{
        return res.sendStatus(404);
    }
});
app.post(routes.costumers, async (req, res) => {
    try{
        if(costumerSchema.validate(req.body).error !== undefined){
            return res.sendStatus(400);
        }
        const name = req.body.name;
        const phone = req.body.phone;
        const cpf = req.body.cpf;
        const birthday = req.body.cpf;
        if( await isAllowedCpf(cpf)){
            const newCostumer = await connection.query('INSERT INTO costumers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)', [name, phone, cpf, birthday]);
            return res.sendStatus(201);
        }
        return res.sendStatus(409);
    } catch{

    }
});
app.listen(port_server);
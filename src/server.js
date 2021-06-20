import express, { json } from 'express';
import cors from 'cors';
import connection from './connectDb.js';
import { categorieSchema, gameSchema, costumerSchema, rentalSchema } from './schemas.js';
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
        if(req.query.name){
            const nameInside = req.query.name;
            const games = await connection.query('SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games.categoryId=categories.id WHERE name LIKE "%$1%"', [nameInside]);
            res.status(200);
            return res.send(games.rows);
        }
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
            let idCostumer = parseInt(req.query.id);
            idCostumer = typeof(idCostumer) === 'number' ? idCostumer : null;
            if(idCostumer !== null){
                const costumer = await connection.query('SELECT * from costumers WHERE id=$1', [idCostumer]);
                if(costumer.rows.length !== 1){
                    return res.sendStatus(404);
                }
                res.status(200);
                return res.send(costumer.rows[0]);
            }
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
        if(await isAllowedCpf(cpf)){
            const newCostumer = await connection.query('INSERT INTO costumers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)', [name, phone, cpf, birthday]);
            return res.sendStatus(201);
        }
        return res.sendStatus(409);
    } catch{
        return res.sendStatus(409);
    }
});
app.put(routes.costumers, async (req, res) => {
    try{
        if(!req.query.id){
            return res.sendStatus(400);
        }
        if(costumerSchema.validate(req.body).error !== undefined){
            return res.sendStatus(400);
        }
        let idCostumer = parseInt(req.query.id);
        idCostumer = typeof(idCostumer) === 'number' ? idCostumer : null;
        if(idCostumer !== null){
            const name = req.body.name;
            const phone = req.body.phone;
            const cpf = req.body.cpf;
            const birthday = req.body.cpf;
            if(await isAllowedCpf(cpf)){
                const updatedcostumer = await connection.query('UPDATE costumers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5',
                [name, phone, cpf, birthday, idCostumer]);
                return res.sendStatus(200);
            }
        }
        return res.sendStatus(409);
    } catch{
        return res.sendStatus(409);
    }
});

app.get(routes.rentals, async (req, res) => {
    try{
        let costumerId = null;
        let gameId = null;
        if(req.query.costumerId){
            costumerId = parseInt(req.query.costumerId);
            costumerId = typeof(costumerId) === 'number' ? costumerId : null;
        }
        if(req.query.gameId){
            gameId = parseInt(req.query.gameId);
            gameId = typeof(gameId) === 'number' ? gameId : null;
        }
        let rentals = null;
        if(costumerId !== null && gameId !== null){
            rentals = await connection.query('SELECT * FROM costumers WHERE costumers.costumerId=$1 AND costumers.gameId=$2', [costumerId, gameId]);
        }
        else if(costumerId !== null && gameId === null){
            rentals = await connection.query('SELECT * FROM costumers WHERE costumers.costumerId=$1'[costumerId]);
        }
        else if(gameId !== null && costumerId === null){
            rentals = await connection.query('SELECT * FROM costumers WHERE costumers.gameId=$1'[gameId]);
        }
        else{
            rentals = await connection.query('SELECT * FROM costumers');
        }
        let rowsRentals = rentals.rows;
        rowsRentals = rowsRentals.map(async (row) => {
            const costumerQuery = await connection.query('SELECT (id, name) FROM costumers WHERE costumers.id=$1', [row.costumerId]);
            row['costumer'] = costumerQuery.rows[0];
            const gameQuery = await connection.query('SELECT games.id, games.name, games.categoryId, categories.name as "categoryName" FROM games JOIN categories ON games.categoryId=categories.id ');
            row['game'] = gameQuery.rows[0];
            return row;
        });
        res.status(200);
        return res.send(rowsRentals);
    } catch{
        return res.sendStatus(404);
    }
});


app.listen(port_server);
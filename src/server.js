import express, { json } from 'express';
import cors from 'cors';
import connection from './connectDb.js';
import { categorySchema, gameSchema, customerSchema, rentalSchema, rentalSchemaPost } from './schemas.js';
import { formatedTime, isAllowedCpf, isAllowedName, isValidId } from './utils.js';

const app = express();
const port_server = 4000;
app.use(cors());
app.use(json());
const routes = {
    categories: '/categories',
    games: '/games',
    customers: '/customers',
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
        if(categorySchema.validate(req.body).error !== undefined){
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

            const games = await connection.query(`SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id WHERE "categoryName" LIKE '$1%'`, [nameInside]);
            res.status(200);
            return res.send(games.rows);
        }
        const games = await connection.query('SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id');
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
        const objGame = {
            name, 
            image,
            stockTotal,
            categoryId,
            pricePerDay
        }
        if(gameSchema.validate(objGame).error !== undefined){
            return res.sendStatus(400);
        }
        if(await isAllowedName('games', name)){
            const newGame = await connection.query('INSERT INTO games(name, image, "stockTotal", "categoryId", "pricePerDay") VALUES($1, $2, $3, $4, $5);', [name, image, stockTotal, categoryId, pricePerDay]);
            return res.sendStatus(201);
        }
        return res.sendStatus(409);
        
    } catch{
        return res.sendStatus(409);
    }
});

app.get(routes.customers + '/:id', async (req, res) => {
    try{
        let idCustomer = parseInt(req.params.id);
        idCustomer = typeof(idCustomer) === 'number' ? idCustomer : null;
        if(idCustomer !== null && isValidId('customers', idCustomer)){
            const customer = await connection.query('SELECT * from customers WHERE id=$1', [idCustomer]);
            if(customer.rows.length !== 1){
                return res.sendStatus(404);
            }
            res.status(200);
            return res.send(customer.rows[0]);
        }
    } catch{
        return res.sendStatus(404);
    }
});

app.get(routes.customers, async (req, res) => {
    try{
        const customers = await connection.query('SELECT * FROM customers');
        res.status(200);
        return res.send(customers.rows);
    } catch{
        return res.sendStatus(404);
    }
});

app.post(routes.customers, async (req, res) => {
    try{
        if(customerSchema.validate(req.body).error !== undefined){
            return res.sendStatus(400);
        }
        const name = req.body.name;
        const phone = req.body.phone;
        const cpf = req.body.cpf;
        const birthday = req.body.birthday;
        const objCustomer = {
            name,
            phone,
            cpf,
            birthday
        }
        
        if(customerSchema.validate(objCustomer).error !== undefined){
            
            return res.sendStatus(400);
        }
        if(await isAllowedCpf(cpf)){
            const newcustomer = await connection.query('INSERT INTO customers(name, phone, cpf, "birthday") VALUES ($1, $2, $3, $4)', [name, phone, cpf, birthday]);
            return res.sendStatus(201);
        }
        return res.sendStatus(409);
    } catch{
        return res.sendStatus(409);
    }
});

app.put(routes.customers + '/:id', async (req, res) => {
    try{
        if(!req.params.id){
            return res.sendStatus(400);
        }
        if(customerSchema.validate(req.body).error !== undefined){
            return res.sendStatus(400);
        }
        let idCustomer = parseInt(req.params.id);
        idCustomer = typeof(idCustomer) === 'number' ? idCustomer : null;
        if(idCustomer !== null){
            const name = req.body.name;
            const phone = req.body.phone;
            const cpf = req.body.cpf;
            const birthday = req.body.birthday;
            if(await isAllowedCpf(cpf)){
                const updatedCustomer = await connection.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5', [name, phone, cpf, birthday, idCustomer]);
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
        let customerId = null;
        let gameId = null;
        if(req.query.customerId){
            customerId = parseInt(req.query.customerId);
            customerId = typeof(customerId) === 'number' ? customerId : null;
        }
        if(req.query.gameId){
            gameId = parseInt(req.query.gameId);
            gameId = typeof(gameId) === 'number' ? gameId : null;
        }
        let rentals = null;
        if(customerId !== null && gameId !== null){
            rentals = await connection.query('SELECT * FROM rentals WHERE rentals."customerId"=$1 AND rentals."gameId"=$2', [customerId, gameId]);
        }
        else if(customerId !== null && gameId === null){
            rentals = await connection.query('SELECT * FROM rentals WHERE rentals."customerId"=$1'[customerId]);
        }
        else if(gameId !== null && customerId === null){
            rentals = await connection.query('SELECT * FROM rentals WHERE rentals."gameId"=$1'[gameId]);
        }
        else{
            rentals = await connection.query('SELECT * FROM rentals');
        }
        let rowsRentals = [... rentals.rows];
        rowsRentals = await Promise.all(rowsRentals.map(async (row) => {
            try{
                let newRow = {...row}
                const customerQuery = await connection.query('SELECT id, name FROM customers WHERE customers.id=$1', [row.customerId]);
                newRow['customer'] = customerQuery.rows[0];
                const gameQuery = await connection.query('SELECT games.id, games.name, games."categoryId", categories.name as "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id');
                newRow['game'] = gameQuery.rows[0];
                return newRow;
            } catch(err){
                return null;
            }
        }));
        res.status(200);
        return res.send(rowsRentals);
    } catch{
        return res.sendStatus(404);
    }
});

app.post(routes.rentals + '/:id/return', async (req, res) => {
    try{
        const idRental = parseInt(req.params.id);
        if(!isValidId('rentals', idRental)){
            return res.sendStatus(404);
        }
        const rental = (await connection.query('SELECT * FROM rentals WHERE id=$1', [idRental])).rows[0];
        if(rental.returnDate !== null){
            return res.sendStatus(400);
        }
        const rentDate = formatedTime(new Date(rental.rentDate));
        const oldReturnDate = new Date(new Date(rental.rentDate).getTime() + new Date(rental.daysRented*3600*24).getTime() );
        const newReturnDate = formatedTime(Date.now());
        const diffDays = Math.floor(Math.abs(Date.now()-oldReturnDate)/(1000*86400));
        const gameId = parseInt(rental.gameId);
        const game = await connection.query('SELECT "pricePerDay" FROM games WHERE id=$1', [gameId]);
        if(game.rows.length <= 0){
            return res.sendStatus(404);
        }
        const pricePerDay = parseInt(game.rows[0].pricePerDay);
        const delayFee = diffDays * pricePerDay;
        const newRental = {
            customerId: rental.customerId,
            gameId: rental.gameId,
            rentDate: rental.rentDate,
            daysRented: rental.daysRented,
            returnDate: newReturnDate,
            originalPrice: rental.originalPrice,
            delayFee: delayFee,
        }
        console.log(newRental)
        if(rentalSchema.validate(newRental).error !== undefined){
            return res.sendStatus(400);
        }
        
        const updateRental = await connection.query('UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id=$3', [newReturnDate, delayFee, rental.id]);
        return res.sendStatus(200);
    } catch(err){
        console.log(err)
        return res.sendStatus(404);
    }
})

app.post(routes.rentals, async (req, res) => {
    try{
        if(rentalSchemaPost.validate(req.body).error !== undefined){
            return res.sendStatus(400);
        }
        let customerId = parseInt(req.body.customerId);
        customerId = typeof(customerId) === 'number' ? customerId : null;
        if(customerId === null){
            return res.sendStatus(400);
        }
        const gameId = parseInt(req.body.gameId);
        const daysRented = parseInt(req.body.daysRented);
        const rentDate = formatedTime(Date.now());
        const returnDate = null;
        const delayFee = null;
        const game = await connection.query('SELECT "pricePerDay" FROM games WHERE id=$1', [gameId]);
        if(game.rows.length <= 0){
            return res.sendStatus(404);
        }
        const pricePerDay = parseInt(game.rows[0].pricePerDay);
        const originalPrice = daysRented * pricePerDay;
        if(!isValidId('customers', customerId) || !isValidId('games', gameId)){
            return res.sendStatus(400);
        }
        const objRental = {
            customerId,
            gameId,
            rentDate,
            daysRented,
            returnDate,
            originalPrice,
            delayFee,
        }
        if(rentalSchema.validate(objRental).error !== undefined){
            return res.sendStatus(400);
        }
        const newRent = await connection.query('INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)', [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]);
        return res.sendStatus(201);        
    } catch(err){
        return res.sendStatus(400);
    }
});

app.delete(routes.rentals + '/:id', async (req, res) => {
    try{
        const idRental = parseInt(req.params.id);
        if(!isValidId('rentals', idRental)){
            return res.sendStatus(404);
        }
        const rental = await connection.query('SELECT returnDate FROM rentals WHERE id=$1', [idRental]);
        if(rental.rows[0].returnDate === null){
            return res.sendStatus(400);
        }
        const deleteRental = await connection.query('DELETE FROM rentals WHERE id=$1', [idRental]);
        return res.sendStatus(200);
    } catch{
        return res.sendStatus(404);
    }
});

app.listen(port_server);
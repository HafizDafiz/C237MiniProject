const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();
//const path = require('path');
//const session = require('express-session');
//const bodyParser = require('body-parser');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer ({storage: storage});
// app.use(session({
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: true
// }));
// Create MySQL connection
const connection = mysql.createConnection({
// host: 'localhost',
// user: 'root',
// password: '',
// database: 'c237_hobbyshop'
host: 'db4free.net',
user: 'c237hafiz',
password: 'hafizdafiz',
database: 'c237_hafiz'
});
connection.connect((err) => {
if (err) {
console.error('Error connecting to MySQL:', err);
return;
}
console.log('Connected to MySQL database');
});
// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));

app.use(express.urlencoded({
    extended: false
}));
app.use(express.static('public'));
// app.use((req, res, next) => {
//     if (!req.session.cart) {
//         req.session.cart = [];
//     }
//     next();
// });


// Define routes
// Example:
// app.get('/', (req, res) => {
// connection.query('SELECT * FROM TABLE', (error, results) => {
// if (error) throw error;
// res.render('index', { results }); // Render HTML page with data
// });
// })
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM products';
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving Product List');
        }
        res.render('index', { products: results});
    });
});
 app.get('/product/:id', (req, res) => {
     const productId = req.params.id;
     const sql = 'SELECT * FROM products WHERE productId = ?';
     connection.query( sql, [productId], (error, results) => {
         if (error) {
             console.error('Database query error:', error.message);
             return res.status(500).send('Error Retrieving product by ID');
         }
            if (results.length > 0) {
            res.render('product', { products: results[0] });
         } else {
             res.status(404).send('student not found');
         }
     });
});
app.get('/addProduct', (req, res) => {
    res.render('addProduct');
});
app.post('/addProduct', upload.single('image'), (req, res) => {
    const { name, description, price, quantity} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = null;
    }
    const sql = 'INSERT INTO products (name, description, price, quantity, image) VALUES (?, ?, ?, ?, ?)';
    connection.query( sql, [name, description, price, quantity, image], (error, results) => {
        if (error) {
            console.error('Error adding products:', error);
            res.status(500).send('Error adding products');
        } else {
            res.redirect('/');
        }
    });
});
app.get('/editProduct/:id', (req,res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId =?';
    connection.query( sql, [productId], (error, results)=> {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving product by ID');
        }
        if (results.length > 0) {
            res.render('editProduct', {products: results[0] });
        } else {
            res.status(404).send('Product not found');
        }
    });
});
app.post('/editProduct/:id', upload.single('image'), (req, res) => {
    const productId = req.params.id;
    const { name, description, price, quantity } = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, image = ? WHERE productId = ?';
    connection.query(sql, [name, description, price, quantity, image, productId], (error) => {
        if (error) {
            console.error('Error updating product:', error);
            res.status(500).send('Error updating product');
        } else {
            res.redirect('/');
        }
    });
});
app.get('/deleteProduct/:id', (req,res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE productId = ?';
    connection.query( sql, [productId], (error, results) => {
        if (error) {
            console.error("Error deleting product:", error);
            res.status(500).send('Error deleting product');
        } else {
            res.redirect('/');
        }
    });
});






app.get('/cart', (req, res) => {
    res.render('cart');
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
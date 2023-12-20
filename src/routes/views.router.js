import { Router } from "express";
import __dirname from "../utils.js";
import {cartManager,  Cart}  from "../daos/fsManager/CartManager.js";
import { ProductManager } from "../daos/fsManager/ProductManager.js";
import productsDao from "../daos/dbManager/products.dao.js";


const router = Router();

const managerP = new ProductManager(`${__dirname}/data/productos.json`);

//Ruta principal
router.get('/', (req, res) =>{
    const saludo = {
        msg:"Bienvenido a backend en coderhouse",
        name:"Mario Campos",
        title:"Desafío Complementario Nª4",
    } 
    console.log(saludo);
    res.render('index', {saludo});
});

//Ruta Home Mongo
router.get('/indexmongo', (req, res) =>{
    const saludo = {
        msg:"Testing With Mongo",
        name:"Mario Campos",
        title:"Desafío Complementario Nº1",
    } 
    console.log(saludo);
    res.render('indexmongo', {saludo});
});

// home de products Mongo
router.get('/productshomemg', async (req, res) =>{
    try {
       // const products = await productsDao.getAllProducts();
       // console.log(products);
        res.render('products/home', {
            title:"Product routes"
        })
    }
    catch(error)  {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al Recuperar.' });         
      }
});

//Ejmplo de llamado a la ruta get para productos
router.get('/productlist', async (req, res) => {
    try {
       const products = await productsDao.getAllProducts();
       //console.log(products);
       res.render('products/index', {
        title:"Product List",
        products
    })
    }
    catch(error){
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al Recuperar Products.' });    
    }
})

//Ejemplo de busqueda de producto por id
router.get('/productsearch',  (req, res) => 
    {
        res.render('products/search', {
            title:"Product Seach"
    })
})
router.post('/psearch', (req,res) =>{
    const {id} = req.body;
    console.log(id);
    res.redirect(`/products/${id}`);
});




//home de products fs
router.get('/productshome', (req, res) =>{
    //const managerP = new ProductManager;
    
    const products = managerP.getProducts();
    res.render('home', {
        title:"Listado de Productoos",
        products
    });
})






//realtimeProducts
router.get('/realtimeproducts', (req,res) =>{
    res.render('realTimeProducts', {
        title:"Listado de Productos c/WebSocket"
    })
})

//realtimeProducts with mongo
router.get('/realtimeproductsmg', (req,res) =>{
    res.render('realTimeProductsmg', {
        title:"Products List with Mongo and WebSocket"
    })
})

//Lista de Carritos
router.get('/carritos', (req,res) => {
    const saludo = {
        title: "Listado de Carritos",
    }

    res.render('carts',{
        title:"Listado de carritos",
        carritos
    });
})

export default router;





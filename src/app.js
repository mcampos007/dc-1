import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import viewRouter from "./routes/views.router.js";
import productfsRouter from "./routes/productsfs.routes.js";
import productRouter from "./routes/products.routes.js";
import cartsfsRouter from "./routes/cartsfs.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import messageRouter from "./routes/messages.routes.js";
import {Server} from "socket.io";
import { logger } from "./utils/logger.js";
import { cartManager } from "./daos/fsManager/CartManager.js";
import { ProductManager,  Producto} from "./daos/fsManager/ProductManager.js";
import {password, PORT, db_name} from './.env.js';
import methodOverride from "method-override";
import mongoose, { Mongoose } from 'mongoose';
import messagesDao from "./daos/dbManager/messages.dao.js";

const app = express();

//Levantando el servidor
const httpServer = app.listen(PORT, ()=>{
    console.log(`The Server is running in port ${PORT}`); 
});

// Instanciar Websocket
const io = new Server(httpServer);

// Middlewares
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(logger);
// Middleware para admitir la sobrecarga de métodos HTTP
app.use(methodOverride('_method'));

// Cadena par conectar con Atlas
// `mongodb+srv://mcamposinfocam:${password}@cluster0.alvwu9f.mongodb.net/${db_name}?retryWrites=true&w=majority`)
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
.then( () => {
    console.log("Succesfull connect");
})
.catch((error) => {
    console.log(`There were errors connecting to the database: ${error}`)
}); 

//Seteo de la rutas estática
app.use(express.static(`${__dirname}/public`));

//Inicializndo el motor
app.engine(
  "hbs",
  handlebars.engine({
      extname: "hbs",
      defaultLayout: "main",
      layoutsDir: __dirname+"/views/layouts",
      partialsDir:__dirname+"/views/layouts",
      runtimeOptions: {
          allowProtoPropertiesByDefault: true,
          allowProtoMethodsByDefault: true,
        },
  })
);
//Indico que el motor inicializad
app.set("view engine", "hbs");

//Ubicacion de las vistas
app.set('views', `${__dirname}/views`);

app.use('/', viewRouter);

//console.log("Definicion de Ruta a productos");
app.use("/api/productsfs", productfsRouter);
app.use("/api/products", productRouter);

//console.log("Definicion de rutas a Carts");
app.use("/api/cartsfs", cartsfsRouter);
app.use("/api/carts", cartsRouter);

// Definicion de rutas para el chat
app.use("/api/messages", messageRouter);

//Implementaciòn de Socket
//WebSocket
const managerP = new ProductManager(`${__dirname}/data/productos.json`);


/// old socket
/* io.on("connection", (socket) => {
    console.log("cliente conectado");
    const productos = managerP.getProducts();
    console.log(productos);
    socket.emit("products_list", productos);
  
    socket.on("product_send", async (data) => {
        console.log(data);
        try {
          const product = new Producto(
            data.title,
            data.description,
            data.code,
            data.price,
            data.status,
            data.stock,
            data.category
          );
          await managerP.addProduct(product);
          
          socket.emit("products_list", managerP.getProducts());
        } catch (error) {
          console.log(error);
        }
      });
      socket.emit("products_list", managerP.getProducts());

      socket.on('product_delete', async(data) => {
        
        try{
            console.log(data);
            await managerP.deleteProduct(data);
            socket.emit("products_list", managerP.getProducts());

        }catch(error){
            console.log(error);
        };
      });
  }); */
//

//// chat
// Socket communication
let messages = [];
io.on("connection" , (socket) =>{
  console.log("Nuevo cliente Conectado");

  // socket de inicio de sesion 
  socket.on("inicio", async (data)=>{
    console.log(`Bienvenido ${data}`);
    const objMsg = {
      "correoDelUsuario": data,
      "message": "Starting session"
    };
    const statmsg =   messagesDao.createMessage(objMsg)
    .then((statmsg) => {
      console.log(`Registro en la la coleccion: ${statmsg}`); 
      //REcuperar todos los mensajes registrados
      const allmsg = messagesDao.getAllMessages() 
      .then((allmsg) => {
        console.log(`Mensajes recuperados: ${allmsg}`);
        const resultados = allmsg.map(({ correoDelUsuario, message }) => ({ correoDelUsuario, message }));
        console.log(resultados);
        socket.emit("messageLogs", resultados); //Envio los mensajes grabados
        socket.broadcast.emit("connection", data )    //Aviso en broadcast el inicio
      })
      .catch((error) => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al recuperar datos de la coleccion.' });   
      })
    })
    .catch((error) => {
      console.error('Error:', error);
          res.status(500).json({ error: 'Hubo un error al actualizar la coleccion.' }); 
    })
  });

  //REcibir lo que se escriba en la caja de texto
  socket.on("message", (data) => {
    console.log(`Datos recibidos en el socket message:${data}`);
    messages.push(data);
    io.emit("messageLogs", messages);
    const msg = messagesDao.createMessage(data)
      .then((msg) => {
        console.log(`Mensaje registrado en la coleccion: ${data}`);
      })
      .catch((error) => {
        console.error('Error:', error);
          res.status(500).json({ error: 'Hubo un error al actualizar la coleccion.' });         
      })
  });


});


  ////



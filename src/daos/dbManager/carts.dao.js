import { cartModel } from "../../models/carts.model.js";

class CartDao {
    async getAllCarts(){
        return await cartModel.find();
    };

    async getCartById(id){
        return await cartModel.findById(id);
    };

    async createCart(cart){
        return await cartModel.create(cart);
    };

    async addProductToCart(cid, pid){
        console.log(cid);
        console.log(pid);
        try {
            const cart = await this.getCartById(cid)
            const nuevoProducto = {
                "product": pid,
                "quantity": 1
            }
            const indexProductoExistente = cart.products.findIndex(item => item.product ===  pid);

            if (indexProductoExistente !== -1) {
            // Si el producto ya existe, incrementar la cantidad en 1
                cart.products[indexProductoExistente].quantity += 1;
            } else {
            // Si el producto no existe, agregarlo al array
                cart.products.push(nuevoProducto);
            }
            
            console.log(`Nuevos productos ${cart.products}`);
            return await this.updateCart(cid, cart)

        }
        catch(error)   {
            console.log(error);
        }
    }
        
        //return await cartModel.cr
    

    async updateCart(id, newCart){
        return await cartModel.findByIdAndUpdate(id, newCart);
    };
    

    async deleteCart(id){
        return await cartModel.findByIdAndDelete(id);
    }

}

export default new CartDao();

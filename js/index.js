const productoDOM = document.querySelector(".productos_center");
const carritoDOM = document.querySelector(".carrito");
const carritoCenter = document.querySelector(".carrito_center");
const openCarrito = document.querySelector(".carrito_icon");
const closeCarrito = document.querySelector(".close_carrito");
const overlay = document.querySelector(".carrito_overlay");
const carritoTotal = document.querySelector(".carrito_total");
const createOrderBtn = document.querySelector(".create_order");
const itemTotales = document.querySelector(".item_total");

let carrito = [];
let buttonDOM = [];

class UI {
	renderProductos(productos) {
		let result = "";
		let cont = 0;
		productos.forEach((producto) => {
			result += `
            <div class="producto">
                <div class="image_container">
                    <img src="./img/dummi.png" alt="">
                </div>
                <div class="producto_footer">
                    <h2>${producto.name}</h2>
                    <div class="price">$${producto.unit_price}</div>
                </div>
                <div class="bottom">
                    <div class="btn_group">
                        <a class="cantidad">${producto.stock}</a>
                        <button href="#" class="btn addToCart" data-id=${cont}>Add to Cart</button>
                    </div>
                </div>
            </div>
            `;

			cont++;
		});

		productoDOM.innerHTML = result;
	}

	getButtons() {
		const buttons = [...document.querySelectorAll(".addToCart")];
		buttonDOM = buttons;
		buttons.forEach((button) => {
			const id = button.dataset.id;
			const inCart = carrito.find((item) => item.id === parseInt(id, 10));

			if (inCart) {
				button.innerHTML = "In Cart";
				button.disabled = true;
			}

			button.addEventListener("click", (e) => {
				e.preventDefault();
				e.target.innerHTML = "In Cart";
				e.target.disabled = true;

				const carritoItem = { ...Storage.getProductos(id), cantidad: 1 };

				//Agregamos el producto al carrito
				carrito = [...carrito, carritoItem];

				//Guardamos el carrito al localstorage
				Storage.saveCart(carrito);

				//Set cart values
				this.setItemValues(carrito);

				//Show al carrito
				this.addCarritoItem(carritoItem);
			});
		});
	}

	setItemValues(carrito) {
		let tempTotal = 0;
		let itemTotal = 0;
		carrito.map((item) => {
			tempTotal += item.price * item.cantidad;
			itemTotal += item.cantidad;
		});
		carritoTotal.innerText = parseFloat(tempTotal.toFixed(2));
		itemTotales.innerText = itemTotal;
	}

	addCarritoItem({ unit_price, name }) {
		const div = document.createElement("div");
		div.classList.add("carrito_item");

		div.innerHTML = `
		<img src="./img/dummi.png" alt="${title}">
        <div>
            <h3>${name}</h3>
            <p class="price">$${unit_price}</p>
        </div>
        <div>
            <span class="increase">
                <i class="fi fi-rr-angle-up"></i>
            </span>
            <p>1</p>
            <span class="decrease">
                <i class="fi fi-rr-angle-down"></i>
            </span>
        </div>
        <div>
            <h3>Total Unit Price</h3>
            <p class="price">$000</p>
        </div>
		`;
		carritoCenter.appendChild(div);
	}
	show() {
		carritoDOM.classList.add("show");
		overlay.classList.add("show");
	}
	hide() {
		carritoDOM.classList.remove("show");
		overlay.classList.remove("show");
	}
	setAPP() {
		carrito = Storage.getCart();
		this.setItemValues(carrito);
		this.populate(carrito);
		openCarrito.addEventListener("click", this.show);
		closeCarrito.addEventListener("click", this.hide);
	}
	populate(carrito) {
		carrito.forEach((item) => this.addCarritoItem(item));
	}
	cartLogic() {
		clearCarritoBtn.addEventListener("click", () => {
			this.clearCarrito();
			this.hide();
		});

		carritoCenter.addEventListener("click", (e) => {
			const target = e.target.closest("span");
			if (!target) return;
		    if (target.classList.contains("increase")) {
				const id = parseInt(target.dataset.id, 10);
				let tempItem = carrito.find((item) => item.id === id);
				tempItem.cantidad++;
				Storage.saveCart(carrito);
				this.setItemValues(carrito);
				target.nextElementSibling.innerText = tempItem.cantidad;
			} else if (target.classList.contains("decrease")) {
				const id = parseInt(target.dataset.id, 10);
				let tempItem = carrito.find((item) => item.id === id);
				tempItem.cantidad--;

				if (tempItem.cantidad > 0) {
					Storage.saveCart(carrito);
					this.setItemValues(carrito);
					target.previousElementSibling.innerText = tempItem.cantidad;
				} else {
					this.removeItem(id);
					carritoCenter.removeChild(target.parentElement.parentElement);
				}
			}
		});
	}
	singleButton(id) {
		return buttonDOM.find((button) => parseInt(button.dataset.id) === id);
	}
}

class Storage {
	static saveProduct(obj) {
		localStorage.setItem("productos", JSON.stringify(obj));
	}
	static saveCart(carrito) {
		localStorage.setItem("carrito", JSON.stringify(carrito));
	}
	static getProductos(id) {
		const producto = JSON.parse(localStorage.getItem("productos"));
		return producto.find((product) => product.id === parseFloat(id, 10));
	}
	static getCart() {
		return localStorage.getItem("carrito")
			? JSON.parse(localStorage.getItem("carrito"))
			: [];
	}
}

class Productos {
	async getProductos() {
		try {
			const result = await fetch("products.json");
			const data = await result.json();
			const productos = data.products;
			return productos;
		} catch (err) {
			console.log(err);
		}
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	const productosLista = new Productos();
	const ui = new UI();

	ui.setAPP();

	const productos = await productosLista.getProductos();
	ui.renderProductos(productos);
	Storage.saveProduct(productos);
	ui.getButtons();
});

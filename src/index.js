import _ from 'lodash';
import './style.css';
import Icon from './remove.png';
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    fetch('./src/cart.json')
        .then(res => res.json())
        .then((result) => {
            appendData(result);
    }).catch(err => console.error(err));

    let quantityInputs = document.getElementsByClassName('cart-quantity-input');
    for(let j of quantityInputs){
        const input = j;
        input.addEventListener('change', quantityChanged)
    }
    document.getElementsByClassName('itemsCount')[0].innerText = 0;
    document.getElementsByClassName('cartCountItems')[0].innerText = 0;

}

const removeCartItem = event=>{
    let buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal();
}

const appendData = data => {
    let displayResources = document.querySelector("#cartData");
    displayResources.textContent = "Loading data from JSON source...";    
    let cartObj = data.items;
    /*let {name, image} = cartObj;
    //let {display, actual} = data.items.price
    console.log(name);*/

    let output = '<div class="shop-items">';
    for (let p in cartObj) {
        output += '<div class="shop-item">'+
            '<div class="item-details">' +
            '<span class="discountValue"><span class="discountAmt">' + cartObj[p].discount + '</span> &#37; off</span>' +
            '<img class="shop-item-image" src="'+ cartObj[p].image + '"></div>' +
            '<div class="shop-item-details">' +
            '<span class="shop-item-price">'+            
                '<p class="shop-item-title">'+cartObj[p].name+'</p>' +
                '<span class="priceDetails"><span class="actualPrice">' + cartObj[p].price.display +'</span>' + '&nbsp; &#36;<span class="discountPrice">'+ 
                cartObj[p].price.actual + '</span>' +
                '</span><button class="btn btn-primary shop-item-button" type="button">ADD TO CART</button>'+
            '</div></div>';
    }
    output += "</div>";
    displayResources.innerHTML = output;

    let addToCartButtons = document.getElementsByClassName('shop-item-button');
    for (let q of addToCartButtons) {
        let button = q;
        button.addEventListener('click', addToCartClicked);
    }
}

const quantityChanged = event => {
    const input = event.target
    if (isNaN(input.value) || (input.value <= 0)) {
        input.value = 1;
    }
    updateCartTotal()
}

const addToCartClicked = event => {
    let button = event.target;
    let shopItem = button.parentElement.parentElement.parentElement;
    let title = shopItem.getElementsByClassName('shop-item-title')[0].innerText;
    let price = shopItem.getElementsByClassName('discountPrice')[0].innerText;
    let imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src;
    let discount = shopItem.getElementsByClassName('actualPrice')[0].innerText;
    addItemToCart(title, price, imageSrc, discount);
    updateCartTotal();
}

function addItemToCart(title, price, imageSrc, discount) {
    let cartRow = document.createElement('div');
    cartRow.classList.add('cart-row');
    let cartItems = document.getElementsByClassName('cart-items')[0]
    let cartItemNames = cartItems.getElementsByClassName('cart-item-title');

    let itemClass = document.createElement('div');
    itemClass.classList.add('itemAdded');
    let cartItems1 = document.getElementsByClassName('itemAdd')[0];
    cartItems1.innerHTML = '';

    for (let i of cartItemNames) {
        if (i.innerText == title) {
            alert('This item is already added to the cart');
            return false;
        }
    }
    let cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
            <img class="btn btn-danger" src="${Icon}">
        </div>
        <div class="cart-quantity cart-column">
            <button data-action="remove" id="minus" class="btn minus update-cart">-</button>
            <input class="cart-quantity-input" type="number" value="1">
            <button data-action="add" id="plus" class="btn add update-cart">+</button>
        </div>
        <span class="cart-price cart-column">$${price}</span>
        <span hidden class="cart-discount cart-column">${discount}</span>`
        
    cartRow.innerHTML = cartRowContents;
    cartItems.append(cartRow);
    
    let itemClassText = title + ' is added to cart';
    itemClass.innerHTML = itemClassText;
    cartItems1.append(itemClass);


    var minusCartItemButtons = document.getElementsByClassName('minus');
    for (let n = 0; n < minusCartItemButtons.length; n++) {
        let minusButton = minusCartItemButtons[n]
        minusButton.addEventListener('click', minusCartInput);
    }
    var addCartItemButtons = document.getElementsByClassName('add');
    for (let m = 0; m < addCartItemButtons.length; m++) {
        let addButton = addCartItemButtons[m];
        addButton.addEventListener('click', addCartInput)
    }

    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

const minusCartInput = event => {
    let buttonClicked = event.target;
    let currentMinusInputBox = buttonClicked.nextElementSibling;
    if (isNaN(currentMinusInputBox.value) || (currentMinusInputBox.value <= 1) ) {
        currentMinusInputBox.value = 1;
    }else{
        currentMinusInputBox.value =  parseInt(currentMinusInputBox.value) - 1;
    }
    updateCartTotal();
}

const addCartInput = event => {
    let buttonClicked = event.target;
    let currentAddInputBox = buttonClicked.previousElementSibling;
    currentAddInputBox.value =  parseInt(currentAddInputBox.value) + 1;
    updateCartTotal();
}

const updateCartTotal = () => {
    let cartItemContainer = document.getElementsByClassName('cart-items')[0]
    let cartRows = cartItemContainer.getElementsByClassName('cart-row')
    let total = 0;
    let discountPrice=0;
    let withoutDiscount = 0;
    for (let i of cartRows) {
        let cartRow = i;
        let discountPriceElement = cartRow.getElementsByClassName('cart-discount')[0].innerText;
        let quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];

        let quantity = quantityElement.value;
        withoutDiscount = withoutDiscount + (parseFloat(discountPriceElement) * quantity);

        let priceElement = cartRow.getElementsByClassName('cart-price')[0];        
        let price = parseFloat(priceElement.innerText.replace('$', ''));        

        discountPrice += (parseFloat(discountPriceElement) * quantity) - (price * quantity);
        total = withoutDiscount - discountPrice;
    }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('itemsCount')[0].innerText = cartRows.length;
    document.getElementsByClassName('cartCountItems')[0].innerText = cartRows.length;
    document.getElementsByClassName('cartTotalItems')[0].innerText = withoutDiscount;
    document.getElementsByClassName('cartDiscountPrice')[0].innerText = '-$' + discountPrice;
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total;
}
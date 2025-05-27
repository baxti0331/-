const menuData = {
  "Закуски": [
    {
      name: "Брускетта с томатами",
      price: 350,
      description: "Хрустящий багет с томатами, базиликом и оливковым маслом",
      image: "images/bruschetta.jpg"
    },
    // ... другие закуски
  ],
  "Основные блюда": [
    // ... основные блюда
  ],
  "Десерты": [
    // ... десерты
  ],
  "Напитки": [
    // ... напитки
  ]
};

let cart = [];

function renderCategories() {
  const categoriesContainer = document.getElementById('categories');
  categoriesContainer.innerHTML = '';
  for (let category in menuData) {
    const button = document.createElement('button');
    button.textContent = category;
    button.addEventListener('click', () => renderDishes(category));
    categoriesContainer.appendChild(button);
  }
}

function renderDishes(category) {
  const dishesContainer = document.getElementById('dishes');
  dishesContainer.innerHTML = '';
  menuData[category].forEach(dish => {
    const dishDiv = document.createElement('div');
    dishDiv.className = 'dish';
    dishDiv.innerHTML = `
      <div>
        <h3>${dish.name}</h3>
        <p>${dish.description}</p>
        <p><strong>${dish.price} ₽</strong></p>
        <button onclick='addToCart(${JSON.stringify(dish)})'>Добавить</button>
      </div>
      <img src='${dish.image}' alt='${dish.name}' />
    `;
    dishesContainer.appendChild(dishDiv);
  });
}

function addToCart(dish) {
  cart.push(dish);
  updateCartButton();
}

function updateCartButton() {
  document.getElementById('cart-button').textContent = `Корзина (${cart.length})`;
}

document.getElementById('cart-button').addEventListener('click', () => {
  // Реализуйте отображение модального окна корзины
});

renderCategories();
renderDishes(Object.keys(menuData)[0]);
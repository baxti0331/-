document.addEventListener('DOMContentLoaded', function() {
    // Загрузить первую категорию по умолчанию
    showCategory('Закуски');
    
    // Проверить количество товаров в корзине
    updateCartCounter();
});

function showCategory(category) {
    // Обновить заголовок текущей категории
    document.getElementById('current-category').textContent = category;
    
    // Подсветить активную кнопку категории
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        if (button.textContent === category) {
            button.style.backgroundColor = '#f0f0f0';
            button.style.fontWeight = 'bold';
        } else {
            button.style.backgroundColor = '#fff';
            button.style.fontWeight = 'normal';
        }
    });
    
    // Загрузить блюда выбранной категории
    fetch(`/get-dishes/${category}`)
        .then(response => response.json())
        .then(dishes => {
            const dishesContainer = document.getElementById('dishes-container');
            dishesContainer.innerHTML = ''; // Очистить контейнер
            
            dishes.forEach(dish => {
                const dishCard = document.createElement('div');
                dishCard.className = 'dish-card';
                
                dishCard.innerHTML = `
                    <img src="/static/images/${dish.image}" alt="${dish.name}" class="dish-image">
                    <div class="dish-info">
                        <div class="dish-name">${dish.name}</div>
                        <div class="dish-description">${dish.description}</div>
                        <div class="dish-price">${dish.price} ₽</div>
                        <button class="add-to-cart" onclick="addToCart(${dish.id})">Добавить в корзину</button>
                    </div>
                `;
                
                dishesContainer.appendChild(dishCard);
            });
        })
        .catch(error => console.error('Error:', error));
}

function addToCart(dishId) {
    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dish_id: dishId,
            quantity: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Обновить счетчик корзины
            document.getElementById('cart-count').textContent = data.cart_count;
            
            // Показать уведомление о добавлении в корзину
            alert('Блюдо добавлено в корзину!');
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateCartCounter() {
    // В реальном приложении здесь должна быть логика обновления счетчика корзины
    // из сессии или localStorage
    
    // Это заглушка, в реальном приложении нужно получать данные с сервера
    const cartCount = document.getElementById('cart-count');
    // Если счетчик существует, обновляем его
    if (cartCount) {
        fetch('/cart')
            .then(response => response.text())
            .then(html => {
                // Парсим HTML для извлечения данных (это не лучший способ, но для примера подойдет)
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const cartItems = doc.querySelectorAll('.cart-item');
                let totalItems = 0;
                
                cartItems.forEach(item => {
                    const quantityText = item.querySelector('.item-quantity').textContent;
                    totalItems += parseInt(quantityText);
                });
                
                cartCount.textContent = totalItems;
            })
            .catch(error => console.error('Error:', error));
    }
}

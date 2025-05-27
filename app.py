from flask import Flask, render_template, request, jsonify, session
import os
import json

app = Flask(__name__)
app.secret_key = 'oson_restaurant_secret_key'

# Данные меню
menu_data = {
    "Закуски": [
        {"id": 1, "name": "Брускетта с томатами", "price": 350, "description": "Хрустящий багет с томатами, базиликом и оливковым маслом", "image": "bruschetta.jpg"},
        {"id": 2, "name": "Карпаччо из говядины", "price": 520, "description": "Тонко нарезанная маринованная говядина с рукколой и пармезаном", "image": "carpaccio.jpg"},
        {"id": 3, "name": "Тартар из лосося", "price": 490, "description": "Свежий лосось с авокадо, каперсами и оливковым маслом", "image": "tartare.jpg"}
    ],
    "Основные блюда": [
        {"id": 4, "name": "Филе миньон", "price": 950, "description": "Сочная говяжья вырезка с овощами гриль и перечным соусом", "image": "filet.jpg"},
        {"id": 5, "name": "Ризотто с грибами", "price": 480, "description": "Кремовое ризотто с белыми грибами и трюфельным маслом", "image": "risotto.jpg"},
        {"id": 6, "name": "Стейк из лосося", "price": 790, "description": "Филе лосося на гриле с соусом из белого вина", "image": "salmon.jpg"}
    ],
    "Десерты": [
        {"id": 7, "name": "Тирамису", "price": 320, "description": "Классический итальянский десерт с маскарпоне и кофе", "image": "tiramisu.jpg"},
        {"id": 8, "name": "Шоколадный фондан", "price": 350, "description": "Теплый шоколадный кекс с жидкой начинкой и ванильным мороженым", "image": "fondant.jpg"},
        {"id": 9, "name": "Панна Котта", "price": 280, "description": "Нежный сливочный десерт с ягодным соусом", "image": "pannacotta.jpg"}
    ],
    "Напитки": [
        {"id": 10, "name": "Домашний лимонад", "price": 220, "description": "Освежающий лимонад по фирменному рецепту", "image": "lemonade.jpg"},
        {"id": 11, "name": "Капучино", "price": 170, "description": "Классический капучино с молочной пенкой", "image": "cappuccino.jpg"},
        {"id": 12, "name": "Свежевыжатый сок", "price": 250, "description": "Апельсиновый, яблочный, грейпфрутовый или морковный", "image": "juice.jpg"}
    ]
}

@app.route('/')
def index():
    categories = list(menu_data.keys())
    return render_template('index.html', menu_data=menu_data, categories=categories)

@app.route('/get-dishes/<category>')
def get_dishes(category):
    if category in menu_data:
        return jsonify(menu_data[category])
    return jsonify([])

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    data = request.json
    dish_id = data['dish_id']
    quantity = data.get('quantity', 1)
    
    if 'cart' not in session:
        session['cart'] = []
    
    # Найти блюдо по ID
    dish = None
    for category in menu_data.values():
        for item in category:
            if item['id'] == dish_id:
                dish = item
                break
        if dish:
            break
    
    if dish:
        # Проверить, есть ли уже это блюдо в корзине
        found = False
        for item in session['cart']:
            if item['id'] == dish_id:
                item['quantity'] += quantity
                found = True
                break
        
        if not found:
            cart_item = dish.copy()
            cart_item['quantity'] = quantity
            session['cart'].append(cart_item)
        
        session.modified = True
        return jsonify({'success': True, 'cart_count': sum(item['quantity'] for item in session['cart'])})
    
    return jsonify({'success': False, 'message': 'Блюдо не найдено'})

@app.route('/cart')
def cart():
    cart_items = session.get('cart', [])
    total = sum(item['price'] * item['quantity'] for item in cart_items)
    return render_template('cart.html', cart_items=cart_items, total=total)

@app.route('/update-cart', methods=['POST'])
def update_cart():
    data = request.json
    dish_id = data['dish_id']
    quantity = data['quantity']
    
    if 'cart' in session:
        for item in session['cart']:
            if item['id'] == dish_id:
                if quantity <= 0:
                    session['cart'].remove(item)
                else:
                    item['quantity'] = quantity
                session.modified = True
                break
    
    cart_items = session.get('cart', [])
    total = sum(item['price'] * item['quantity'] for item in cart_items)
    cart_count = sum(item['quantity'] for item in session['cart'])
    
    return jsonify({
        'success': True, 
        'total': total, 
        'cart_count': cart_count
    })

@app.route('/clear-cart', methods=['POST'])
def clear_cart():
    session['cart'] = []
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)

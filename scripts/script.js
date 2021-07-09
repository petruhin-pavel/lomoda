const headerCityButton = document.querySelector('.header__city-button');
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');

//определяем хеш страниц #men #women #kids
let hash = location.hash.substring(1); //substring обрезает значения substring(1) обрезает 1 символ

/* if (localStorage.getItem('lomoda-location')) {
  headerCityButton.textContent = localStorage.getItem('lomoda-location');
} */

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите ваш город');
  headerCityButton.textContent = city;
  localStorage.setItem('lomoda-location', city)
});

// работа с local storage

// берем данные из local storage
// parse при получение данных приводим их в массив или объект
const getLocalStorage = () => JSON?.parse(localStorage.getItem('cart-lomoda')) || [];

// отправляем данные в local storage
const setLocalStorage = data => localStorage.setItem('cart-lomoda', JSON.stringify(data));

// рендер корзины
const renderCart = () => {
  cartListGoods.textContent = '';

  const cartItems = getLocalStorage();

  let totalPrice = 0;

  cartItems.forEach((item, i) => {

    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${item.brand} ${item.name}</td>
        ${item.color ? `<td>${item.color}</td>` : `<td>-</td>`}
        ${item.size ? `<td>${item.size}</td>` : `<td>-</td>`}
        <td>${item.cost} &#8381;</td>
        <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
      `;
    totalPrice += item.cost;
    cartListGoods.append(tr)
  });
  cartTotalCost.textContent = totalPrice + ' ₽';
}

const deleteItemCart = id => {
  const cartItems = getLocalStorage();
  const newCartItems = cartItems.filter(item => item.id !== id);
  setLocalStorage(newCartItems);
}

cartListGoods.addEventListener('click', e => {
  if (e.target.matches('.btn-delete')) {
    deleteItemCart(e.target.dataset.id);
    renderCart();
  }
});

//Блокиовка скролла
const disableScroll = () => {
  const widthScroll = window.innerWidth - document.body.offsetWidth;
  document.body.dbScrollY = window.scrollY;
  document.body.style.cssText = `
      position: fixed;
      top: ${-window.scrollY}px;
      left: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      padding-right: ${widthScroll}px;
  `;
};

const enableScroll = () => {
  document.body.style.cssText = '';
  window.scroll({
    top: document.body.dbScrollY,
  })
};

//Модальное окно
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

const cartModalOpen = () => {
  cartOverlay.classList.add('cart-overlay-open');
  disableScroll();
  renderCart();
};

const cartModalClose = () => {
  cartOverlay.classList.remove('cart-overlay-open');
  enableScroll();
};

subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => {
  const target = event.target;
  /* if (target.classList.contains('cart__btn-close')) {
    cartModalClose();
  } */
  if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
    cartModalClose();
  }

});

document.addEventListener('keyup', event => {

  if (event.key === 'Escape') {
    cartModalClose();
  };

});

//Запрос базы данных
const getData = async () => { //async - асинхронный оператор

  const data = await fetch('db.json');

  if (data.ok) {
    return data.json()
  } else {
    throw new Error(`Данные небыли получены, ошибка ${data.status} ${data.statusText}`)
  }

};

const getGoods = (callback, prop, value) => {
  getData()
    .then(data => {
      if (value) {
        callback(data.filter(item => item[prop] === value))
      } else {
        callback(data); //на всякий случай
      }
    })
    .catch(err => {
      console.error(err)
    });
}
/* getGoods((data) => {
  console.warn(data)
}) */

// try/catch данная структура позоволяет работать скрипту на определенных страницах. Работает по принципу обнаружения уникального элемента на странице
//страница товаров (категорий)
try {

  const goodsList = document.querySelector('.goods__list');

  if (!goodsList) {
    throw 'This is not a goods page!'
  }

  const goodsTitle = document.querySelector('.goods__title');

  const changeTitle = () => {
    goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
  }

  //const createCard = data => { относится к методу "деструктуризация"
  const createCard = ({ id, preview, cost, brand, name, sizes }) => { //так еще проще
    //новый метод "деструктуризация"
    //const { id, preview, cost, brand, name, sizes } = data;
    //или старый метод
    /* const id = data.id;
    const preview = data.preview;
    const cost = data.cost;
    const brand = data.brand;
    const name = data.name;
    const sizes = data.sizes; */

    const li = document.createElement('li');

    li.classList.add('goods__item'); //создали

    li.innerHTML = `
    <article class="good">
      <a class="good__link-img" href="card-good.html#${id}">
        <img class="good__img" src="goods-image/${preview}" alt="">
      </a>
      <div class="good__description">
        <p class="good__price">${cost} &#8381;</p>
        <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
        ${sizes ?
        `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` : ''}
        <a class="good__link" href="card-good.html#${id}">Подробнее</a>
      </div>
    </article>
    `;
    return li; //вернули
  };

  const renderGoodsList = data => {
    goodsList.textContent = ''; //очищяю от статичной верстки

    //Перебираю элементы массива
    //1 способ "for"
    /* for (let i = 0; i < data.length; i++) {
      console.log(data[i]);
    } */

    //2 способ "for/of"
    /*  for (const item of data) {
       console.log(item);
     } */

    //3 способ "forEach"
    data.forEach(item => {
      const card = createCard(item);
      goodsList.append(card);
    })
  };

  //динамическое обновление карточек при изменение хеша без перезагрузки страницы
  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
    getGoods(renderGoodsList, 'category', hash);
    changeTitle();
  })

  changeTitle();
  getGoods(renderGoodsList, 'category', hash);

} catch (err) {
  console.warn(err)
}
//страница товара
try {
  if (!document.querySelector('.card-good')) {
    throw 'This is not a card-good page';
  }
  const CardGoodImage = document.querySelector('.card-good__image');
  const CardGoodBrand = document.querySelector('.card-good__brand');
  const CardGoodTitle = document.querySelector('.card-good__title');
  const CardGoodPrice = document.querySelector('.card-good__price');
  const CardGoodColor = document.querySelector('.card-good__color');
  const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
  const CardGoodColorList = document.querySelector('.card-good__color-list');
  const CardGoodSize = document.querySelector('.card-good__sizes');
  const CardGoodSizeList = document.querySelector('.card-good__sizes-list');
  const CardGoodBuy = document.querySelector('.card-good__buy');

  const generateList = data => data.reduce((html, item, i) => html +
    `<li class="card-good__select-item" data-id="${i}">${item}</li>`, '');

  const renderCardGood = ([{ id, brand, name, cost, color, sizes, photo }]) => {

    const data = { brand, name, cost, id };

    CardGoodImage.src = `goods-image/${photo}`;
    CardGoodImage.alt = `${brand} ${name}`;
    CardGoodBrand.textContent = brand;
    CardGoodTitle.textContent = name;
    CardGoodPrice.textContent = `${cost} ₽`;
    if (color) {
      CardGoodColor.textContent = color[0];
      CardGoodColor.dataset.id = 0;
      CardGoodColorList.innerHTML = generateList(color);
    } else {
      CardGoodColor.style.display = 'none';
    }
    if (sizes) {
      CardGoodSize.textContent = sizes[0];
      CardGoodSize.dataset.id = 0;
      CardGoodSizeList.innerHTML = generateList(sizes);
    } else {
      CardGoodSize.style.display = 'none';
    }

    if (getLocalStorage().some(item => item.id === id)) {
      CardGoodBuy.classList.add('delete');
      CardGoodBuy.textContent = 'Удалить из корзины';
    }

    CardGoodBuy.addEventListener('click', () => {
      if (CardGoodBuy.classList.contains('delete')) {
        deleteItemCart(id);
        CardGoodBuy.classList.remove('delete');
        CardGoodBuy.textContent = 'Добавить в корзину';
        return;
      }
      if (color) data.color = CardGoodColor.textContent;
      if (sizes) data.size = CardGoodSize.textContent;

      CardGoodBuy.classList.add('delete');
      CardGoodBuy.textContent = 'Удалить из корзины';

      const cardData = getLocalStorage();
      cardData.push(data);
      setLocalStorage(cardData);
    })


  };

  cardGoodSelectWrapper.forEach(item => {
    item.addEventListener('click', eve => {
      const target = eve.target;
      if (target.closest('.card-good__select')) {
        target.classList.toggle('card-good__select__open');
      }
      if (target.closest('.card-good__select-item')) {
        const cardGoodSelect = item.querySelector('.card-good__select');
        cardGoodSelect.textContent = target.textContent;
        cardGoodSelect.dataset.id = target.dataset.id;
        cardGoodSelect.classList.remove('card-good__select__open');
      }
    });
  });

  getGoods(renderCardGood, 'id', hash)

} catch (err) {
  console.warn(err);
}
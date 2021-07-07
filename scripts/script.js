const headerCityButton = document.querySelector('.header__city-button');

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

const getGoods = (callback, value) => {
  getData()
    .then(data => {
      if (value) {
        callback(data.filter(item => item.category === value))
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

//данная структура позоволяет работать скрипту на определенных страницах
try {
  const goodsList = document.querySelector('.goods__list');

  if (!goodsList) {
    throw 'This is not a goods page!'
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
    getGoods(renderGoodsList, hash);
  })

  getGoods(renderGoodsList, hash);


} catch (err) {

}
const headerCityButton = document.querySelector('.header__city-button');

/* if (localStorage.getItem('lomoda-location')) {
  headerCityButton.textContent = localStorage.getItem('lomoda-location');
} */

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?'

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите ваш город');
  headerCityButton.textContent = city;
  localStorage.setItem('lomoda-location', city)
});
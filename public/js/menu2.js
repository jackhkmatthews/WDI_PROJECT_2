'use strict';

var slideLeft = new Menu({
  wrapper: '#o-wrapper',
  type: 'slide-left',
  menuOpenerClass: '.c-button',
  maskId: '#c-mask'
});

var slideLeftLogin = new Menu({
  wrapper: '#o-wrapper',
  type: 'slide-left-login',
  menuOpenerClass: '.c-button',
  maskId: '#c-mask'
});

var slideLeftRegister = new Menu({
  wrapper: '#o-wrapper',
  type: 'slide-left-register',
  menuOpenerClass: '.c-button',
  maskId: '#c-mask'
});

var slideLeftBtn = document.querySelector('#c-button--slide-left');
var slideLeftBtnLogin = document.querySelector('#c-button--slide-left-login');
var slideLeftBtnRegister = document.querySelector('#c-button--slide-left-register');

slideLeftBtn.addEventListener('click', function (e) {
  e.preventDefault;
  slideLeft.open();
});

slideLeftBtnLogin.addEventListener('click', function (e) {
  e.preventDefault;
  slideLeftLogin.open();
});

slideLeftBtnRegister.addEventListener('click', function (e) {
  e.preventDefault;
  slideLeftRegister.open();
});
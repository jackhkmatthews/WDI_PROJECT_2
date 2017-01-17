var slideLeft = new Menu({
  wrapper: '#o-wrapper',
  type: 'slide-left-menu',
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

var slideLeftBtn = $('#c-button--slide-left-menu');
var slideLeftBtnLogin = $('#c-button--slide-left-login');
var slideLeftBtnRegister = $('#c-button--slide-left-register');

slideLeftBtn.on('click', function(e) {
  e.preventDefault;
  slideLeft.open();
});

slideLeftBtnLogin.on('click', function(e) {
  e.preventDefault;
  slideLeftLogin.open();
});

slideLeftBtnRegister.on('click', function(e) {
  e.preventDefault;
  slideLeftRegister.open();
});

$('.back').on('click', function(e){
  e.preventDefault;
  slideLeftLogin.close();
  slideLeftRegister.close();
  slideLeft.open();
});

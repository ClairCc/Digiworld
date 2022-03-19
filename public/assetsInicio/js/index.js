let openMenu = document.getElementById('headerMenuOpen');
let headerMenuItm1 = document.getElementById('headerMenuItm1');
let headerMenuItm2 = document.getElementById('headerMenuItm2');
let headerMenuItm3 = document.getElementById('headerMenuItm3');
let header_itm3 = document.getElementById('header_itm3');
let menu = document.getElementById('menu');

let state = 1;

function openMenuF() {
    console.log('entra');
    if (state == 1) {
        headerMenuItm1.classList.add('headerMenuItm1_start');
        headerMenuItm3.classList.add('headerMenuItm3_start');
        headerMenuItm2.classList.add('headerMenuItm2_none');
        header_itm3.classList.add('header_itm3-margin');
        menu.classList.remove('menu_none');
        menu.classList.add('menu_display');
        openMenu.id = 'closeMenu';
        state = 2;
    } else {
        headerMenuItm1.classList.remove('headerMenuItm1_start');
        headerMenuItm3.classList.remove('headerMenuItm3_start');
        headerMenuItm2.classList.remove('headerMenuItm2_none');
        header_itm3.classList.remove('header_itm3-margin');
        menu.classList.add('menu_none');
        state = 1;
    }
}

openMenu.addEventListener('click', openMenuF);

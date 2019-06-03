var burgerMenuButton = document.querySelector('#check-menu');
burgerMenuButton.addEventListener('click', onClick);

function onClick() {
    var navigation = document.querySelector('.navigation');
    navigation.classList.toggle('active');
    burgerMenuButton.classList.toggle('open');
}

var accordion = function () {
    if(document.querySelector(".accordion")) {
        var data = document.querySelector(".accordion").hasAttribute("data-accordion");

        document.querySelector(".accordion-header").addEventListener("click", function () {
            if (data === "close") {
                document.querySelector(".accordion-body").slideUp();
                if (document.querySelector(this).classList.contains("active")) {
                    document.querySelector(this).classList.toggle("active");
                } else {
                    document.querySelector(".accordion-header").classList.remove("active");
                    document.querySelector(this).classList.toggle("active");
                }
            } else {
                document.querySelector(this).classList.toggle("active");
            }
        });
    }
};

(function() {
    accordion();
    if(document.querySelector(".tabed")) {
        new Tabed(".tabed");
    }
})();


var modalWin = document.getElementsByClassName('request__btn');
modalWin.addEventListener('click', showModalWin);

function showModalWin() {
    var lightLayer = document.querySelector('.js-overlay-modal');
    lightLayer.style.visibility = 'visible';

    var modalWin = document.querySelector('.modal');
    modalWin.style.visibility = 'visible';

    lightLayer.onclick = function () {
        modalWin.style.visibility = 'hidden';
        lightLayer.style.visibility = 'hidden';
    };
}


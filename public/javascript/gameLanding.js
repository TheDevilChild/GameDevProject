var swiper = new Swiper('.swiper-container', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
    },
    pagination: {
        el: '.swiper-pagination',
    },
});

const swiperContainer = document.querySelector('#swiper-box')
const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget)
        openModal(modal)
    })
})

overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
        closeModal(modal)
    })
})

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal')
        closeModal(modal)
    })
})

const bigBox = document.querySelector('#main-content');

function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
    if (modal.id == "account-modal" || modal.id == "search-modal") {
        overlay.classList.remove('active')
        overlay.classList.add('account-active')
    }
    swiper.allowTouchMove = false;
    swiperContainer.style.zIndex = "0";
    bigBox.style.zIndex = "-20";
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
    if (modal.id == "account-modal" || modal.id == "search-modal") {
        overlay.classList.remove('account-active')
    }
    else {
        overlay.classList.remove('active')
    }
    swiper.allowTouchMove = true;
    swiperContainer.style.zIndex = "0";
    bigBox.style.zIndex = "0";
}




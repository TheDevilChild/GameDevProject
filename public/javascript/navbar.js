const openModalButtonsNav = document.querySelectorAll('[data-modal-target]')
const closeModalButtonsNav = document.querySelectorAll('[data-close-button]')
const overlayNav = document.getElementById('overlay')

openModalButtonsNav.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget)
        openModal(modal)
    })
})

overlayNav.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
        closeModal(modal)
    })
})

closeModalButtonsNav.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal')
        closeModal(modal)
    })
})

function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
    overlayNav.classList.add('active')
    if (modal.id == "account-modal" || modal.id == "search-modal") {
        overlayNav.classList.remove('active')
        overlayNav.classList.add('account-active')
    }
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
    if (modal.id == "account-modal" || modal.id == "search-modal") {
        overlayNav.classList.remove('account-active')
    }
    else {
        overlayNav.classList.remove('active')
    }
}
const searchModal = document.querySelector('#search-modal');
const createUserCard = (user) => {
    let followButtonHTML = '';
    console.log(undefined);
    if(currentUser && currentUser.following.includes(user._id)) {
        followButtonHTML = `<button id="${user._id}" class="follow-btn following result-btn">Unfollow</button>`;
    } else {
        followButtonHTML = `<button id="${user._id}" class="follow-btn result-btn">Follow</button>`;
    }
    return `
    <div class="result-box">
    <div class="result-container">
        <div class="result-img-container">
            <img src="images/IMG_20210704_090719 (1).jpg" alt="" class="result-img">
        </div>
        <div class="result-name">
            <h3>${user.username}</h3>
        </div>
        <div class="result-btn-container">
            ${followButtonHTML}
        </div>
    </div>
    <hr>
    `
}
const search = document.querySelector('#search');
// const searchResults = document.querySelector('#searchResults');
search.addEventListener('keyup', async () => {
    if (search.value === '') {
        // searchResults.classList.add('hidden')
         closeModal(searchModal);
    } else {
            // searchResults.classList.remove('hidden')
             openModal(searchModal);
        const searchValue = search.value;
        const users = await axios.get(`/api/users/search?query=${searchValue}`);
        console.log(users);
        searchModal.innerHTML = '';
        users.data.forEach(user => {
            searchModal.insertAdjacentHTML('beforeend', createUserCard(user));
        })
    }

})

const body = document.querySelector('body');


body.addEventListener('click', (e) => {
    if (e.target.closest('.follow-btn')) {
        const id = e.target.id;
        const isFollowing = e.target.classList.contains('following')
        axios.patch(`/api/users/follow`, {
            userId: currentUser._id, targetUserId: id, isFollowing: isFollowing
        })
            .then(() => {
                if (isFollowing) {
                    e.target.innerText = 'Follow';
                    e.target.classList.remove('following');
                } else {
                    e.target.innerText = 'Following';
                    e.target.classList.add('following');
                }
            })
            .catch(err => console.log(err));
    }
})

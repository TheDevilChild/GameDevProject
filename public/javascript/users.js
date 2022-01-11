const main = document.querySelector('#main');

const renderUsers = async () => {
    const users = await axios.get('/api/users/all');
    users.data.forEach(user => {
        if (user._id != currentUser._id)
            main.insertAdjacentHTML('beforeend', createUserCardd(user));
    })
}

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


const createUserCardd = (user) => {
    let followButtonHTML = '';
    if(currentUser.following.includes(user._id)) {
        followButtonHTML = `<button id="${user._id}" class="follow-btn following">Following</button>`;
    } else {
        followButtonHTML = `<button id="${user._id}" class="follow-btn">Follow</button>`;
    }
    return `

        <div class="column">
        <div class="card">
            <img src="${user.profilePic}" alt="player" class="img">
            <h1>${user.username}</h1>
            <p class="title">${user.fullname}</p>
            <p>Level 5 | Pro</p>
            <div class="sub-info">
                <div>Stars &#9733;&#9733;&#9733;&#9734;&#9734; </div>
            </div>
            <p>${followButtonHTML}</p>
        </div>
    </div>
    `
}
renderUsers();
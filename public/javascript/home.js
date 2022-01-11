const pictureElements = document.getElementsByClassName('picture');
console.log(pictureElements);
setInterval(() => {
    for (i = 0; i < pictureElements.length;i++) {
        if (pictureElements[i].classList.contains('picture-up')) {
           pictureElements[i].classList.add('picture-down');
           pictureElements[i].classList.remove('picture-up');
        } else {
           pictureElements[i].classList.add('picture-up');
           pictureElements[i].classList.remove('picture-down');
        }
    }
}, 1500);



var afterG = true;
var afterRestoreDown = true;
var maxLegalWidth = 400;
var maxLegalHeight = 250;
var minLegalWidth = maxLegalWidth - 20;
var minLegalHeight = maxLegalHeight - 20;
var oldX;
var oldY;
var currentUserData;

(function () {
    setTimeout(function () {
        ip = byId('bIp').nextSibling.textContent.trim();
        byId('bIp').nextSibling.remove();
        currentUserData = ' @' + new Date() +
            ' | from: ' + (document.referrer || 'N/A') +
            ' | screen: ' + screen.width + '*' + screen.height +
            ' | ip: ' + ip || 'N/A';
        ga('send', {
            hitType: 'event',
            eventCategory: 'Navigation',
            eventAction: 'joinPage',
            eventLabel: '' + currentUserData
        });
        console.log(currentUserData);
    }, 1000);

    if (screen.width < 700) {
        show('mobile');
        hide('imageMinimize');
        return;
    }
    onResize();
    addEventListener('resize', onResize);
})();

function onResize() {
    isFullScreen() && onWindowFullScreened();
    !isFullScreen() && onWindowResized();
};

function onWindowFullScreened() {
    show('imageMinimize');
    hide('moveBrowser');
    hide('catSpace');
    hide('smallerize');
    hide('startGame');
}

function onWindowResized() {
    hide('moveBrowser');
    hide('catSpace');
    hide('imageMinimize');
    show('smallerize');
    calcArrows();
    isSizeOk();
}

function isSizeOk() {
    hide('arrowRight');
    hide('arrowBottom');
    hide('arrowBottomToBottom');
    hide('arrowRightToRight');
    calcArrows();
    if (innerWidth < maxLegalWidth &&
        innerHeight < maxLegalHeight &&
        innerHeight >= minLegalHeight &&
        innerWidth >= minLegalWidth) {
        hide('smallerize');
        show('startGame');
    } else {
        show('smallerize');
        hide('startGame');
    }
}

function calcArrows() {
    (innerWidth >= maxLegalWidth) && show('arrowRight');
    (innerHeight >= maxLegalHeight) && show('arrowBottom');
    (innerWidth < minLegalWidth) && show('arrowRightToRight');
    (innerHeight < minLegalHeight) && show('arrowBottomToBottom');
}

function show(id) {
    byId(id).style.display = 'block';
}
function hide(id) {
    byId(id).style.display = 'none';
}

function byId(selector) {
    return document.getElementById(selector);
}

function isFullScreen() {
    return !(screenX || screenY);
}

function showMoveBrowser(withTimeout) {
    ga('send', {
        hitType: 'event',
        eventCategory: 'Navigation',
        eventAction: 'click',
        eventLabel: 'merem' + currentUserData
    });
    show('moveBrowser');
    hide('startGame');
    setTimeout(function () {
        oldX = screenX;
        oldY = screenY;
        var lookForInitialMove = setInterval(function () {
            if (oldX != screenX || oldY != screenY) {
                startGame();
                clearInterval(lookForInitialMove);
            }
        }, 0);
    }, withTimeout ? withTimeout : 0);
}

function stopGame() {
    for (var i = 1; i < 99999; i++)
        clearInterval(i);
    showMoveBrowser(500);
}


var currentDirection;
var oftenness;
var speed;
var distanceTraveled;
var cat;
var catSpace;

function startGame() {
    ga('send', {
        hitType: 'event',
        eventCategory: 'Progress',
        eventAction: 'gameBegin',
        eventLabel: 'beginGame ' + currentUserData
    });
    hide('moveBrowser');
    show('catSpace');
    cat = byId('cat');
    catSpace = byId('catSpace');
    cat.style.top = screenY + 60;
    cat.style.left = screenX + 150;
    currentDirection = 0;
    cat.classList = ['direction-' + currentDirection];
    oftenness = 1;
    speed = 1.5;
    distanceTraveled = 0;
    setInterval(function () {
        listenForBrowserMove();
    }, 1);
    initCatMove();
}

function initCatMove() {
    setInterval(function () {
        changeDirection();
    }, 500);
    setInterval(function () {
        followDirection();
    }, 20);
}

function changeDirection(closeToEdgeDirection) {
    if (closeToEdgeDirection > -1) {
        currentDirection = (closeToEdgeDirection + 2) % 4;
        cat.classList = ['direction-' + currentDirection];
        followDirection(speed * 5);
    } else if (Math.random() < (0.1 * oftenness)) {
        oftenness += 0.1;
        speed += 0.25;
        currentDirection = Math.floor(Math.random() * 4);
        byId("cat").classList = ['direction-' + currentDirection];
    }
}

function isCatCloseToEdge() {
    //Left bound
    if ((screenX + cat.offsetLeft) < -10)
        return 0;
    //Top bound
    if ((screenY + cat.offsetTop) < 0)
        return 1;
    //Right bound
    if ((screen.width - (screenX + cat.offsetLeft + catSpace.offsetLeft)) < 100)
        return 2;
    //Bottom bound
    if (screen.height - (screenY + (outerHeight - innerHeight) + catSpace.offsetTop + cat.offsetTop) < 100)//Bottom bound
        return 3;
    return -1;
}

function followDirection(pixels) {
    if (!isCatVisible()) {
        var metersParsed = parseInt(((distanceTraveled / (75 / 1.6))) / 10);
        ga('send', {
            hitType: 'event',
            eventCategory: 'Progress',
            eventAction: 'endGame',
            eventLabel: metersParsed + 'm | ' + currentUserData
        });
        alert('Ți-o fugit mâța. Ai fugărit-o ' + (metersParsed > 5 ? 'vreo ' : '')  + metersParsed + ' metri.');
        stopGame();
    }
    // return;
    var localSpeed = pixels || speed;
    var closeToEdge = isCatCloseToEdge();
    if (closeToEdge > -1 && !pixels)
        changeDirection(closeToEdge);
    switch (currentDirection) {
        case 0:
            cat.style.left = parseInt(cat.style.left) - localSpeed;
            distanceTraveled += localSpeed;
            break;
        case 1:
            cat.style.top = parseInt(cat.style.top) - (localSpeed / 1.5);
            distanceTraveled += (localSpeed / 1.5);
            break;
        case 2:
            cat.style.left = parseInt(cat.style.left) + localSpeed;
            distanceTraveled += localSpeed;
            break;
        case 3:
            cat.style.top = parseInt(cat.style.top) + (localSpeed / 1.5);
            distanceTraveled += (localSpeed / 1.5);
            break;
    }
}

function isCatVisible() {
    return ((cat.offsetLeft + catSpace.offsetLeft + cat.width) >= 0) && //Out from Left
        ((cat.offsetTop + catSpace.offsetTop + cat.width) >= 0) && //Out from top
        ((screenX + cat.offsetLeft + catSpace.offsetLeft) <= (screenX + outerWidth)) && //Out from right
        ((screenY + cat.offsetTop + (outerHeight - innerHeight) + catSpace.offsetTop) <= (screenY + outerHeight)) //Out from bottom
}

function randomDirection() {
    return Math.floor(Math.random() * 4) - 1;
}

function listenForBrowserMove() {
    if (oldX != window.screenX || oldY != window.screenY) {
        catSpace.style.top = -screenY;
        catSpace.style.left = -screenX;
    }
    oldX = window.screenX;
    oldY = window.screenY;
}
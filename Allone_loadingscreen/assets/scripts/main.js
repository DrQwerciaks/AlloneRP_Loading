$('#read-more').on('click', function () {
  let newHeight = $('.information .description > p').height();

  $('#collapse').fadeIn(150);
  $(this).fadeOut(150);

  $('.information .description').css('height', newHeight + 'px');
});

$('#collapse').on('click', function () {
  $('#read-more').fadeIn(150);
  $(this).fadeOut(150);

  $('.information .description').css('height', '');
});

$('.hideoverlay .bind').html(
  Config.CustomBindText == ''
    ? String.fromCharCode(Config.HideoverlayKeybind).toUpperCase()
    : Config.CustomBindText,
);

$(document).on('mousemove', function (e) {
  $('#cursor').css({ top: e.pageY + 'px', left: e.pageX + 'px' });
});

var overlay = true;
$(document).keydown(function (e) {
  if (e.which == Config.HideoverlayKeybind) {
    overlay = !overlay;
    if (!overlay) {
      $('.overlay').css('opacity', '.0');
    } else {
      $('.overlay').css('opacity', '');
    }
  }
});

var song;
function setup() {
  let currentDate = new Date();

  let year = currentDate.getFullYear();
  let month =
    currentDate.getMonth() + 1 < 10
      ? '0' + (currentDate.getMonth() + 1)
      : currentDate.getMonth() + 1;
  let day =
    currentDate.getDate() < 10 ? '0' + currentDate.getDate() : currentDate.getDate();
  $('#date').html(`${day}.${month}.${year}`);

  // Online player count
  fetch('http://' + Config.ServerIP + '/info.json')
    .then((res) => res.json())
    .then((info) => {
      fetch('http://' + Config.ServerIP + '/players.json')
        .then((res) => res.json())
        .then((players) => {
          $('#clients').html(players.length + '/' + info.vars.sv_maxClients);
        });
    });

  if (!localStorage.getItem('music')) {
    localStorage.setItem('music', 'true');
    document.getElementById('sounds').checked = false;
  }

  if (localStorage.getItem('music') == 'true') {
    // Music
    console.log('123');
    document.getElementById('sounds').checked = false;
    song = new Audio('assets/media/' + Config.Song);
    song.play();
    song.volume = Config.Volume;
  } else {
    document.getElementById('sounds').checked = true;
  }

  // Categories
  var currentCat = '';
  Config.Categories.forEach((cat, index) => {
    $('.categories .buttons').append(
      `<p data-category="${index}" class="${cat.default ? 'active' : ''}">${
        cat.label
      }</p>`,
    );
    if (cat.default) currentCat = index;

    $('.categories .carousel > *').css(
      'transform',
      `translateX(-${currentCat * 100}%)`,
    );
  });

  $('.categories .buttons p').on('click', function () {
    $(`.categories .buttons p[data-category="${currentCat}"]`).removeClass('active');
    currentCat = $(this).attr('data-category');
    $(`.categories .buttons p[data-category="${currentCat}"]`).addClass('active');

    $('.categories .carousel > *').css(
      'transform',
      `translateX(-${currentCat * 100}%)`,
    );
  });

  // Carousel
  Config.Staff.forEach((member, index) => {
    $('.staff .innercards')
      .append(`<div class="card" data-id="${index}" style="--color: ${member.color}">
            <p class="name">${member.name}</p>
            <p class="description">${member.description}</p>
            <img class="avatar" src="${member.image}">
        </div>`);
    if (index < Config.Staff.length - 1) {
      $('.staff .pages').append(`<div data-id="${index}"></div>`);
    }
    $(`.staff .pages > div[data-id="0"]`).addClass('active');

    if (Config.Staff.length < 3) {
      $('.staff .pages').hide();
      $('.staff .previous').hide();
      $('.staff .next').hide();
    }
  });

  var currentPage = 0;
  $('.staff .next').on('click', function () {
    if (currentPage < Config.Staff.length - 2) {
      $(`.staff .pages > div[data-id="${currentPage}"]`).removeClass('active');
      currentPage++;
      $(`.staff .pages > div[data-id="${currentPage}"]`).addClass('active');
      $('.staff .innercards').css(
        'transform',
        `translate3d(calc(-${currentPage * 50}% - ${
          (currentPage + 1) * 0.5
        }vw), 0, 0)`,
      );
    }
  });

  $('.staff .previous').on('click', function () {
    if (currentPage > 0) {
      $(`.staff .pages > div[data-id="${currentPage}"]`).removeClass('active');
      currentPage--;
      $(`.staff .pages > div[data-id="${currentPage}"]`).addClass('active');
      $('.staff .innercards').css(
        'transform',
        `translate3d(calc(-${currentPage * 50}% - ${
          (currentPage + 1) * 0.5
        }vw), 0, 0)`,
      );
    }
  });
}

var tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var muted = false;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    events: {
      onReady: onPlayerReady,
    },
  });
}

let interval;
function onPlayerReady() {
  player.mute();

  $('#sounds').on('change', function (e) {
    muted = e.target.checked;
    localStorage.setItem('music', !muted);
    clearInterval(interval);
    if (muted) {
      let volume = Config.Volume;
      interval = setInterval(() => {
        if (volume > 0.0) {
          volume -= 0.02;
          song.volume = volume;
        } else {
          clearInterval(interval);
          song.volume = 0.0;
        }
      }, 1);
    } else {
      let volume = 0.0;
      interval = setInterval(() => {
        if (volume < Config.Volume) {
          volume += 0.02;
          song.volume = volume;
        } else {
          clearInterval(interval);
          song.volume = Config.Volume;
        }
      }, 1);
    }
  });
}

function copyToClipboard(text) {
  const body = document.querySelector('body');
  const area = document.createElement('textarea');
  body.appendChild(area);

  area.value = text;
  area.select();
  document.execCommand('copy');

  body.removeChild(area);
}

setup();

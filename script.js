const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');

const openPlaylistBtn = document.getElementById('openPlaylistBtn');
const closePlaylistBtn = document.getElementById('closePlaylistBtn');
const playlistModal = document.getElementById('playlistModal');
const audioFileInput = document.getElementById('audioFileInput');
const playlistContainer = document.getElementById('playlistContainer');

let playlist = [];
let currentTrackIndex = 0;

// Открытие / Закрытие плейлиста
openPlaylistBtn.addEventListener('click', () => {
    playlistModal.classList.add('active');
});

closePlaylistBtn.addEventListener('click', () => {
    playlistModal.classList.remove('active');
});

// Загрузка локальных файлов с телефона
audioFileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    playlist = []; // Очищаем старый плейлист при новой загрузке
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        playlist.push({
            name: file.name.replace(/\.[^/.]+$/, ""), // Убираем расширение для красоты
            url: URL.createObjectURL(file)
        });
    }

    renderPlaylist();
    
    // Если ничего не играло, автоматически выбираем первый трек
    if (playlist.length > 0) {
        loadTrack(0);
    }
});

// Отрисовка списка треков в модальном окне
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    
    if (playlist.length === 0) {
        playlistContainer.innerHTML = '<div class="empty-playlist-msg">Файлы не найдены.</div>';
        return;
    }

    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.classList.add('playlist-item');
        if (index === currentTrackIndex) {
            item.classList.add('playing');
        }

        item.innerHTML = `
            <span class="playlist-item-title">> ${index + 1}. ${track.name}</span>
        `;

        item.addEventListener('click', () => {
            loadTrack(index);
            playTrack();
            playlistModal.classList.remove('active'); // Закрываем плейлист при выборе
        });

        playlistContainer.appendChild(item);
    });
}

// Загрузка трека по индексу
function loadTrack(index) {
    if (playlist.length === 0) return;
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];

    audio.src = track.url;
    trackTitle.textContent = track.name;
    trackArtist.textContent = `SECTOR LOG: TRACK ${currentTrackIndex + 1} OF ${playlist.length}`;
    
    updateActivePlaylistUI();
}

// Подсветка текущего трека в списке
function updateActivePlaylistUI() {
    const items = playlistContainer.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

// Управление воспроизведением
function togglePlay() {
    if (playlist.length === 0) {
        playlistModal.classList.add('active'); // Если треков нет, открываем проводник
        return;
    }

    if (audio.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
}

function playTrack() {
    if (!audio.src && playlist.length > 0) {
        loadTrack(0);
    }
    audio.play().then(() => {
        playBtn.querySelector('.chevron-icon').textContent = '❚❚';
    }).catch(err => console.log("Ошибка воспроизведения:", err));
}

function pauseTrack() {
    audio.pause();
    playBtn.querySelector('.chevron-icon').textContent = '▶';
}

playBtn.addEventListener('click', togglePlay);

// Кнопки Назад / Вперед
nextBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    let nextIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(nextIndex);
    playTrack();
});

prevBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    let prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(prevIndex);
    playTrack();
});

// Автоматический переход к следующему треку по окончании
audio.addEventListener('ended', () => {
    nextBtn.click();
});

// Обновление прогресс-бара во время воспроизведения
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }
});

// Перемотка кликом по прогресс-бару
progressContainer.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
});

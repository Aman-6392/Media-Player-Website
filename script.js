// Get references to HTML elements
const videoPlayer = document.getElementById('videoPlayer');
const audioPlayer = document.getElementById('audioPlayer');
const mediaPlaceholder = document.getElementById('mediaPlaceholder');
const playPauseButton = document.getElementById('playPauseButton');
const stopButton = document.getElementById('stopButton');
const fullscreenButton = document.getElementById('fullscreenButton'); // New fullscreen button
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const progressBar = document.getElementById('progressBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const volumeControl = document.getElementById('volumeControl');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const mediaItemsContainer = document.getElementById('mediaItemsContainer');
const videoUploadInput = document.getElementById('videoUploadInput');
const audioUploadInput = document.getElementById('audioUploadInput');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const youtubePlayerContainer = document.getElementById('youtubePlayerContainer'); // Kept for structure

let currentMediaElement = null; // Stores the currently active player (video or audio)
let activePlayerType = null; // 'html5'
let isPlaying = false;

// Define a list of media files (only local examples now)
const mediaList = [
    {
        id: 'video1',
        title: 'Big Buck Bunny (Video)',
        type: 'video/mp4',
        src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
        id: 'audio1',
        title: 'Kalimba (Audio)',
        type: 'audio/mp3',
        src: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
    },
    {
        id: 'video2',
        title: 'Sintel (Video)',
        type: 'video/mp4',
        src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    },
    {
        id: 'audio2',
        title: 'Sample Audio File (Audio)',
        type: 'audio/mp3',
        src: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3'
    }
];

// Function to format time
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to show a message in the message box
function showMessage(text, isError = false) {
    messageText.textContent = text;
    messageBox.classList.remove('error');
    if (isError) {
        messageBox.classList.add('error');
    }
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 5000); // Hide after 5 seconds
}

// Function to update progress bar and time display for HTML5 players
function updateHtml5Progress() {
    if (currentMediaElement && activePlayerType === 'html5') {
        const { currentTime, duration } = currentMediaElement;
        progressBar.value = (currentTime / duration) * 100 || 0;
        currentTimeSpan.textContent = formatTime(currentTime);
        durationSpan.textContent = formatTime(duration);
    }
}

// Function to set up event listeners for a given HTML5 media element
function setupHtml5MediaElement(mediaElement) {
    mediaElement.addEventListener('timeupdate', updateHtml5Progress);
    mediaElement.addEventListener('loadedmetadata', updateHtml5Progress);
    mediaElement.addEventListener('play', () => {
        isPlaying = true;
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        playPauseButton.textContent = 'Pause';
        showMessage("Playing: " + nowPlayingTitle.textContent);
    });
    mediaElement.addEventListener('pause', () => {
        isPlaying = false;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        playPauseButton.textContent = 'Play';
        showMessage("Paused: " + nowPlayingTitle.textContent);
    });
    mediaElement.addEventListener('ended', () => {
        isPlaying = false;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        playPauseButton.textContent = 'Play';
        progressBar.value = 0;
        currentTimeSpan.textContent = '0:00';
        showMessage("Finished: " + nowPlayingTitle.textContent);
    });
    mediaElement.addEventListener('volumechange', () => {
        volumeControl.value = mediaElement.volume * 100;
    });
    // Add error handling for media elements
    mediaElement.addEventListener('error', (e) => {
        console.error("Media element error:", e.target.error.code, e.target.error.message);
        nowPlayingTitle.textContent = "Error loading media!";
        mediaPlaceholder.classList.remove('hidden'); // Show placeholder on error
        videoPlayer.classList.add('hidden');
        audioPlayer.classList.add('hidden');
        youtubePlayerContainer.classList.add('hidden'); // Ensure YouTube container is hidden
        isPlaying = false;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        playPauseButton.textContent = 'Play';
        showMessage("Error loading media. Please check the file or try another.", true);
    });
}

// Initialize both HTML5 players with event listeners
setupHtml5MediaElement(videoPlayer);
setupHtml5MediaElement(audioPlayer);

// Play/Pause functionality
playPauseButton.addEventListener('click', () => {
    if (!currentMediaElement && mediaList.length > 0) {
        // If no media is selected, try to load and play the first one from the list
        loadMedia(mediaList[0]);
        return; // loadMedia will handle playback attempt
    } else if (!currentMediaElement) {
        showMessage("No media loaded. Please select an item from the list or upload a file.", true);
        return;
    }

    if (activePlayerType === 'html5') {
        if (isPlaying) {
            currentMediaElement.pause();
        } else {
            currentMediaElement.play().catch(error => {
                console.error("Autoplay prevented or other play error (HTML5 toggle):", error);
                showMessage("Playback prevented. Please click play again or interact with the page.", true);
                isPlaying = false;
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                playPauseButton.textContent = 'Play';
            });
        }
    }
});

// Stop functionality
stopButton.addEventListener('click', () => {
    if (activePlayerType === 'html5' && currentMediaElement) {
        currentMediaElement.pause();
        currentMediaElement.currentTime = 0;
    }
    isPlaying = false;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    playPauseButton.textContent = 'Play';
    progressBar.value = 0;
    currentTimeSpan.textContent = '0:00';
    showMessage("Stopped playback.");
});

// Seek functionality
progressBar.addEventListener('input', () => {
    if (activePlayerType === 'html5' && currentMediaElement && !isNaN(currentMediaElement.duration)) {
        const seekTime = (progressBar.value / 100) * currentMediaElement.duration;
        currentMediaElement.currentTime = seekTime;
    }
});

// Volume control
volumeControl.addEventListener('input', () => {
    const volume = volumeControl.value;
    if (activePlayerType === 'html5' && currentMediaElement) {
        currentMediaElement.volume = volume / 100;
    }
});

// Fullscreen functionality
fullscreenButton.addEventListener('click', () => {
    if (activePlayerType === 'html5' && currentMediaElement === videoPlayer) {
        if (videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        } else if (videoPlayer.mozRequestFullScreen) { /* Firefox */
            videoPlayer.mozRequestFullScreen();
        } else if (videoPlayer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.msRequestFullscreen) { /* IE/Edge */
            videoPlayer.msRequestFullscreen();
        }
    } else {
        showMessage("Fullscreen is only available for video playback.", false);
    }
});

// Listen for fullscreen change events to update button visibility
document.addEventListener('fullscreenchange', exitFullscreenHandler);
document.addEventListener('webkitfullscreenchange', exitFullscreenHandler);
document.addEventListener('mozfullscreenchange', exitFullscreenHandler);
document.addEventListener('MSFullscreenChange', exitFullscreenHandler);

function exitFullscreenHandler() {
    // Hide fullscreen button when exiting fullscreen
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        fullscreenButton.classList.add('hidden');
    } else {
        // Show fullscreen button if a video is currently playing and in fullscreen
        if (activePlayerType === 'html5' && currentMediaElement === videoPlayer) {
             fullscreenButton.classList.remove('hidden');
        }
    }
}


// Function to load and play selected media (from predefined list or upload)
function loadMedia(media) {
    // Hide all players and show placeholder initially
    mediaPlaceholder.classList.remove('hidden');
    videoPlayer.classList.add('hidden');
    audioPlayer.classList.add('hidden');
    youtubePlayerContainer.classList.add('hidden'); // Ensure YouTube container is hidden
    fullscreenButton.classList.add('hidden'); // Hide fullscreen button by default

    // Pause any currently playing media
    if (currentMediaElement && !currentMediaElement.paused) {
        currentMediaElement.pause();
        // Revoke previous object URL if it was a local file to free up memory
        if (currentMediaElement.src && currentMediaElement.src.startsWith('blob:')) {
            URL.revokeObjectURL(currentMediaElement.src);
        }
    }

    // Determine which player to use based on media type
    if (media.type.startsWith('video/')) {
        activePlayerType = 'html5';
        currentMediaElement = videoPlayer;
        currentMediaElement.src = media.src;
        videoPlayer.classList.remove('hidden');
        mediaPlaceholder.classList.add('hidden');
        fullscreenButton.classList.remove('hidden'); // Show fullscreen button for video
    } else if (media.type.startsWith('audio/')) {
        activePlayerType = 'html5';
        currentMediaElement = audioPlayer;
        currentMediaElement.src = media.src;
        audioPlayer.classList.remove('hidden');
        mediaPlaceholder.classList.add('hidden');
        fullscreenButton.classList.add('hidden'); // Ensure hidden for audio
    } else {
        console.error("Unsupported media type:", media.type);
        mediaPlaceholder.classList.remove('hidden'); // Show placeholder if type is unknown
        currentMediaElement = null;
        activePlayerType = null;
        nowPlayingTitle.textContent = "Unsupported Media Type";
        showMessage("Unsupported media type. Please upload .mp4, .webm, .mp3, or .wav files.", true);
        return;
    }

    // Update now playing title
    nowPlayingTitle.textContent = media.title;

    // Load the new media
    currentMediaElement.load();
    currentMediaElement.play().catch(error => {
        console.error("Autoplay prevented or other play error (loadMedia):", error);
        showMessage("Playback prevented. Please click play to start.", true);
        isPlaying = false;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        playPauseButton.textContent = 'Play';
    });

    // Update active state in the list (only for items from the predefined list)
    document.querySelectorAll('.media-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.getElementById(`media-item-${media.id}`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Handle video file upload
videoUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('video/')) {
            const fileURL = URL.createObjectURL(file);
            const newMedia = {
                id: 'uploaded-video-' + Date.now(),
                title: file.name,
                type: file.type, // Use file.type directly
                src: fileURL
            };
            loadMedia(newMedia);
            showMessage(`Video "${file.name}" loaded successfully.`);
        } else {
            showMessage("Please upload a valid video file (e.g., .mp4, .webm, .ogg).", true);
        }
        event.target.value = ''; // Clear the input so same file can be selected again
    }
});

// Handle audio file upload
audioUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('audio/')) {
            const fileURL = URL.createObjectURL(file);
            const newMedia = {
                id: 'uploaded-audio-' + Date.now(),
                title: file.name,
                type: file.type, // Use file.type directly
                src: fileURL
            };
            loadMedia(newMedia);
            showMessage(`Audio "${file.name}" loaded successfully.`);
        } else {
            showMessage("Please upload a valid audio file (e.g., .mp3, .wav, .ogg).", true);
        }
        event.target.value = ''; // Clear the input
    }
});

// Populate media list (for predefined samples)
function populateMediaList() {
    mediaList.forEach(media => {
        const mediaItemDiv = document.createElement('div');
        mediaItemDiv.id = `media-item-${media.id}`;
        mediaItemDiv.classList.add('media-item');
        mediaItemDiv.innerHTML = `
            <span class="media-icon">
                ${media.type.startsWith('video') ?
                    `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-4 4 4 4-4V5h-4v7l-4-4-4 4z" clip-rule="evenodd" />
                    </svg>` :
                    `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.953 9.953 0 0117 7H15c0-1.577-.451-3.12-1.293-4.414zM16.536 8.464a1 1 0 011.414 0 6.953 6.953 0 010 9.899 1 1 0 01-1.414 0 4.953 4.953 0 000-7.071z" clip-rule="evenodd" />
                    </svg>`
                }
            </span>
            <span class="text-gray-700">${media.title}</span>
        `;
        mediaItemDiv.addEventListener('click', () => loadMedia(media));
        mediaItemsContainer.appendChild(mediaItemDiv);
    });
}

// Initial population of the media list
populateMediaList();

// Set initial volume for HTML5 players
if (videoPlayer) videoPlayer.volume = volumeControl.value / 100;
if (audioPlayer) audioPlayer.volume = volumeControl.value / 100;

// If there's no media initially, show the placeholder
if (!currentMediaElement || !currentMediaElement.src) {
    mediaPlaceholder.classList.remove('hidden');
}
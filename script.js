// API endpoint for random memes
const API_URL = 'https://meme-api.com/gimme';
const memeContainer = document.getElementById('meme-container');
const loader = document.getElementById('loader');
const loadMoreButton = document.getElementById('load-more');
let memes = [];
let displayedMemes = 0;
const initialMemes = 6;
const memesPerLoad = 3;

// Fetch a single meme from API
async function fetchSingleMeme() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.url && !data.nsfw) { // Exclude NSFW content
            return {
                url: data.url,
                name: data.title || 'Untitled Meme'
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching meme:', error);
        return null;
    }
}

// Fetch multiple memes
async function fetchMemes(count) {
    try {
        loader.style.display = 'block';
        loadMoreButton.disabled = true;
        const newMemes = [];
        for (let i = 0; i < count; i++) {
            const meme = await fetchSingleMeme();
            if (meme) newMemes.push(meme);
        }
        if (newMemes.length > 0) {
            memes = [...memes, ...newMemes];
            shuffleMemes();
            loadMemes();
        } else {
            memeContainer.innerHTML = '<p>Error loading memes. Try again later.</p>';
        }
    } catch (error) {
        memeContainer.innerHTML = '<p>Error loading memes. Try again later.</p>';
        console.error('Error:', error);
    } finally {
        loader.style.display = 'none';
        loadMoreButton.disabled = false;
    }
}

// Shuffle memes array
function shuffleMemes() {
    for (let i = memes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [memes[i], memes[j]] = [memes[j], memes[i]];
    }
}

// Load memes into the container
function loadMemes() {
    const fragment = document.createDocumentFragment();
    const endIndex = Math.min(displayedMemes + (displayedMemes === 0 ? initialMemes : memesPerLoad), memes.length);
    for (let i = displayedMemes; i < endIndex; i++) {
        const meme = memes[i];
        const memeCard = document.createElement('div');
        memeCard.classList.add('meme-card');
        memeCard.innerHTML = `
            <img src="${meme.url}" alt="${meme.name}" loading="lazy">
            <p>${meme.name}</p>
        `;
        fragment.appendChild(memeCard);
    }
    memeContainer.appendChild(fragment);
    displayedMemes = endIndex;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchMemes(initialMemes);
    loadMoreButton.addEventListener('click', () => fetchMemes(memesPerLoad));
});
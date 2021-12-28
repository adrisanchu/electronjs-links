// DOM Elements
const linksSection = document.querySelector('.links');
const errorMessage = document.querySelector('.error-message');
const newLinkForm = document.querySelector('.new-link-form');
const newLinkURL = document.querySelector('.new-link-url');
const newLinkButton = document.querySelector('.new-link-button');
const clearStorageButton = document.querySelector('.clear-storage');

// DOM APIs
// parser HTML text to get web title
// it uses Chromium API -> DOMParser
const parser = new DOMParser();
// shell lets us access which is the default navigator, open a browser, etc...
const { shell } = require('electron');

const parserResponse = text => {
    return parser.parseFromString(text, 'text/html');
}

// find html tags: title, h1, h2, ...
// we use .innerText to get the text inside the tag
const findTitle = (nodes) => {
    return nodes.querySelector('title').innerText;
};

// local storage
const storeLink = (title, url) => {
    localStorage.setItem(url, JSON.stringify({title, url}))
}

const getLinks = () => {
    // we use Object.keys to access ALL KEYS stored in localStorage
    // we will get an array with .map with all the info, in JSON format
    return Object.keys(localStorage)
        .map(key => JSON.parse(localStorage.getItem(key)));
}

const createLinkElement = link => {
    return `
        <div>
            <h3>${link.title}</h3>
            <p>
                <a href="${link.url}">${link.url}</a>
            </p>
        </div>
    `;
}

// to clean up the form after hitting enter
const clearForm = () => {
    newLinkURL.value = null;
};

// error handling when inserting wrong url
const handleError = (error, url) => {
    errorMessage.innerHTML = `
        There was an issue when adding "${url}" : ${error.message}
    `.trim();
    // remove message after 5 secs
    setTimeout(() => {
        errorMessage.innerHTML = null;
    }, 7000);
};

const renderLinks = () => {
    const linksElements = getLinks().map(createLinkElement).join(`<hr/>`);
    linksSection.innerHTML = linksElements;
}

// Events
newLinkURL.addEventListener('keyup', () => {
    newLinkButton.disabled = !newLinkURL.validity.valid;
});

// submit links
newLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = newLinkURL.value;
    // we use async await because it will take time
    // to fetch the url and get the response
    // we manage errors with try-catch
    try {
        const response = await fetch(url);
        const text = await response.text();
        // parse text into html and save it
        const html = parserResponse(text);
        // find title in the html and save it
        const title = findTitle(html);
        storeLink(title, url);
        clearForm();  // to clean up the form cell
        // render links
        renderLinks();
    } catch(e) {
        handleError(e, url);
    }
    
});

// clear storage (garbagge collector)
clearStorageButton.addEventListener('click', () => {
    localStorage.clear();
    // remove all sites added from our front
    linksSection.innerHTML = '';
});

linksSection.addEventListener('click', (e) => {
    if (e.target.href) {
        // this cancels default behavior: open link in electron
        e.preventDefault();  
        shell.openExternal(e.target.href);
    }
});
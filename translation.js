let translations = {};

// Load translations.json
async function loadTranslations() {
  const response = await fetch('translations.json');
  translations = await response.json();
}

// Language management
function getLanguage() {
  return localStorage.getItem('lang') || 'chinese';
}

function setLanguage(lang) {
  localStorage.setItem('lang', lang);
}

// Support nested keys like "home.title"
function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

// Translation filters
const filters = {
  translate: (key, lang) => getNested(translations[lang], key) || key
};

// Translate all elements with data-translate
function translatePage() {
  updateImageSources();
  
  const lang = getLanguage();
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    el.textContent = filters.translate(key, lang);
  });
}

function updateImageSources(){
  document.getElementById('freespinsoverlayimg').src = `assets/${localStorage.getItem('lang') || 'english'}/freespinsoverlay.png`;
  document.getElementById('freespinsoverlayimg2').src = `assets/${localStorage.getItem('lang') || 'english'}/additionalfreespins.png`;
  document.getElementById('youve_won').src = `assets/${localStorage.getItem('lang') || 'english'}/youve_won.png`;
  document.getElementById('credits_img').src = `assets/${localStorage.getItem('lang') || 'english'}/credits.png`;
  document.getElementById('freespin_part_a_img').src = `assets/${localStorage.getItem('lang') || 'english'}/freespin_part_a.png`;
  document.getElementById('freespin_part_b_img').src = `assets/${localStorage.getItem('lang') || 'english'}/freespin_part_b.png`;
  document.getElementById('winImg').src = `assets/${localStorage.getItem('lang') || 'english'}/winlevels/bigwin.png`;
  document.getElementById('totalbetinner-img').src = `assets/${localStorage.getItem('lang') || 'english'}/totalbetinnerimg.png`;

  if (typeof winLevels !== 'undefined') {
    winLevels.big = {
      imgSrc: `assets/${localStorage.getItem('lang') || 'english'}/winlevels/bigwin.png`,
      text: 'BIG WIN',
      textClass: 'big-win',
      sunburstClass: 'big-win-color',
      threshold: 100,
      coinCount: 50
    };
    winLevels.mega = {
      imgSrc: `assets/${localStorage.getItem('lang') || 'english'}/winlevels/megawin.png`,
      text: 'MEGA WIN',
      textClass: 'mega-win',
      sunburstClass: 'mega-win-color',
      threshold: 300,
      coinCount: 80
    };
    winLevels.ultra = {
      imgSrc: `assets/${localStorage.getItem('lang') || 'english'}/winlevels/ultrawin.png`,
      text: 'ULTRA WIN',
      textClass: 'ultra-win',
      sunburstClass: 'ultra-win-color',
      threshold: Infinity,
      coinCount: 40
    };
  }


}

// Initialize translation system
async function initTranslation(langSelectId = 'lang-select') {
  const langSelect = document.getElementById(langSelectId);
  if (langSelect) {
    langSelect.value = getLanguage();
    langSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
      translatePage();
    });
  }

  await loadTranslations();
  translatePage();
}

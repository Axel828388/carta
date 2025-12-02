/* Enhanced interactions for the card page
     - Supports YouTube thumbnails via data-video-id
     - Supports direct MP4 via data-video-url
     - Modal player with close and ESC handling
*/

document.addEventListener('DOMContentLoaded', function(){
    // Initialize elements
    const envelope = document.getElementById('envelope');
    const letter = document.getElementById('letter');
    const closeLetter = document.getElementById('closeLetter');
    // video removed: no thumbnail or modal initialization

    // Login / pseudologin elements
    const loginModal = document.getElementById('loginModal');
    const loginInput = document.getElementById('loginInput');
    const loginBtn = document.getElementById('loginBtn');
    const hintBtn = document.getElementById('hintBtn');
    const loginMsg = document.getElementById('loginMsg');

    const AUTH_KEY = 'carta_auth_v1';
    const correctNick = 'risita'; // el apodo correcto (case-insensitive)

    function isAuthenticated(){ return sessionStorage.getItem(AUTH_KEY) === '1'; }

    function showLogin(){ if(loginModal) loginModal.style.display = 'flex'; if(loginInput) loginInput.focus(); }
    function hideLogin(){ if(loginModal) loginModal.style.display = 'none'; }

    function attemptOpenLocked(){
        if(!envelope) return;
        envelope.style.transition = 'transform .12s ease';
        envelope.style.transform = 'translateX(-8px) rotate(-2deg)';
        setTimeout(()=> envelope.style.transform = 'translateX(8px) rotate(2deg)', 120);
        setTimeout(()=> envelope.style.transform = '', 260);
        if(loginMsg) loginMsg.innerText = 'Necesitas ingresar el apodo para abrir la carta.';
    }

    function attemptLogin(){
        if(!loginInput) return;
        const val = loginInput.value.trim().toLowerCase();
        if(val === correctNick){
            sessionStorage.setItem(AUTH_KEY, '1');
            if(loginMsg) loginMsg.innerText = '¡Perfecto! Abriendo la carta…';
            hideLogin();
            setTimeout(()=>{ openLetter(); }, 380);
            // enable normal envelope click
            if(envelope){ envelope.removeEventListener('click', attemptOpenLocked); envelope.addEventListener('click', openLetter); }
        } else {
            if(loginMsg) loginMsg.innerText = 'No es ese apodo — inténtalo de nuevo con cariño 💜';
            loginInput.focus();
        }
    }

    // Hint behavior: show a subtle clue when requested
    function showHint(){ if(loginMsg) loginMsg.innerText = "Pista: es un apodo que suena como una risa diminuta (empieza por 'ri')"; if(loginInput) loginInput.focus(); }

    // Authentication flow setup
    if(!isAuthenticated()){
        // block opening until authenticated
        if(envelope) envelope.addEventListener('click', attemptOpenLocked);
        showLogin();
    } else {
        hideLogin();
        if(envelope) envelope.addEventListener('click', openLetter);
    }

    // Bind login controls
    if(loginBtn) loginBtn.addEventListener('click', attemptLogin);
    if(loginInput) loginInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') attemptLogin(); });
    if(hintBtn) hintBtn.addEventListener('click', showHint);

    // Close letter button
    if(closeLetter) closeLetter.addEventListener('click', closeLetterFn);

});

function openLetter(){
    const envelope = document.getElementById('envelope');
    const letter = document.getElementById('letter');
    const indicator = document.getElementById('openIndicator');
    if(!envelope || !letter) return;
    // Hide the indicator
    if(indicator) indicator.classList.add('hidden');
    envelope.style.transition = 'transform .5s ease, opacity .45s ease';
    envelope.style.transform = 'translateY(-30px) scale(.98) rotate(-2deg)';
    envelope.style.opacity = '0';
    setTimeout(()=>{ envelope.style.display = 'none'; letter.classList.remove('hidden'); }, 420);
}

function closeLetterFn(){
    const envelope = document.getElementById('envelope');
    const envelopeWrap = document.getElementById('envelopeWrap');
    const letter = document.getElementById('letter');
    const indicator = document.getElementById('openIndicator');
    if(!envelope || !letter) return;
    // Play close animation then reveal the envelope
    letter.classList.add('closing');
    // after animation completes, hide letter and reveal envelope
    setTimeout(()=>{
        letter.classList.remove('closing');
        letter.classList.add('hidden');
        // reveal envelope with a pop
        envelope.style.display = '';
        // clear any inline transform/opacity left from opening
        envelope.style.transform = '';
        envelope.style.opacity = '1';
        // briefly add 'revealed' to animate
        envelope.classList.add('revealed');
        setTimeout(()=>{
            envelope.classList.remove('revealed');
            // ensure inline styles are clean after animation
            envelope.style.transform = '';
            envelope.style.opacity = '';
        }, 520);
        // show the indicator again
        if(indicator) indicator.classList.remove('hidden');
    }, 560);
}



function showMsg(text, sourceEl){
    const el = document.getElementById('msg');
    if(el) el.innerText = text;

    // If an existing overlay exists, remove it cleanly
    const existing = document.getElementById('popupOverlay');
    if(existing){
        // remove popped class from previous source if present
        if(existing._source) existing._source.classList.remove('popped');
        existing.remove();
        document.body.classList.remove('popup-open');
    }

    const overlay = document.createElement('div');
    overlay.id = 'popupOverlay';
    overlay.className = 'popup-overlay';
    // keep a reference to the source element that triggered the popup
    overlay._source = sourceEl || null;

    const card = document.createElement('div');
    card.className = 'popup-card';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    closeBtn.innerText = '✕';
    // helper to remove overlay and cleanup
    function removeOverlay(){
        const ov = document.getElementById('popupOverlay');
        if(!ov) return;
        if(ov._source) ov._source.classList.remove('popped');
        ov.remove();
        document.body.classList.remove('popup-open');
    }

    closeBtn.addEventListener('click', removeOverlay);

    const p = document.createElement('p');
    p.innerText = text;

    // confetti container inside overlay
    const confettiWrap = document.createElement('div');
    confettiWrap.className = 'confetti-container';

    card.appendChild(closeBtn);
    card.appendChild(p);
    overlay.appendChild(confettiWrap);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // mark body so CSS can hide underlying small messages while popup is visible
    document.body.classList.add('popup-open');

    // add popped class to source element for visual feedback
    if(sourceEl && sourceEl.classList) sourceEl.classList.add('popped');

    // generate confetti particles
    const colors = ['#b97bdc','#9b5bd6','#6f2b7b','#ffb3e6','#d3a0ff'];
    const count = 18;
    for(let i=0;i<count;i++){
        const conf = document.createElement('div');
        conf.className = 'confetti';
        const sizeW = 6 + Math.floor(Math.random()*10);
        const sizeH = sizeW + 6;
        conf.style.width = sizeW + 'px';
        conf.style.height = sizeH + 'px';
        conf.style.background = colors[Math.floor(Math.random()*colors.length)];
        // position confetti around the card
        const left = 20 + Math.random()* (card.clientWidth || 240);
        conf.style.left = left + 'px';
        conf.style.top = (Math.random()*20 - 10) + 'px';
        // random animation duration and delay
        const dur = 1000 + Math.floor(Math.random()*1600);
        const delay = Math.floor(Math.random()*200);
        conf.style.animation = `confettiFall ${dur}ms cubic-bezier(.2,.8,.2,1) ${delay}ms forwards`;
        conf.style.transform = `rotate(${Math.random()*360}deg)`;
        confettiWrap.appendChild(conf);
    }

    // auto remove after 3s (clean removal)
    setTimeout(removeOverlay, 3200);
}

/* Vinyl / audio behavior */
// Plays the configured audio when the record is tapped and animates the record + needle.
document.addEventListener('DOMContentLoaded', function(){
    const vinyl = document.getElementById('vinyl');
    const record = vinyl ? vinyl.querySelector('.record') : null;
    const needle = document.querySelector('.needle');
    const playBtn = document.getElementById('vinylPlayBtn');
    const audio = document.getElementById('audioPlayer');

    if(!audio) return;

    // Load audio src from data attribute if provided
    const dataUrl = audio.dataset.audioUrl && audio.dataset.audioUrl.trim();
    if(dataUrl){
        audio.src = dataUrl;
    }

    // Utility to toggle play state
    function togglePlay(){
        if(audio.paused){
            audio.play().then(()=>{ setPlaying(true); }).catch(err=>{ console.warn('Audio play blocked or error', err); });
        } else {
            audio.pause(); setPlaying(false);
        }
    }

    function setPlaying(on){
        if(record) record.classList.toggle('playing', !!on);
        if(needle) needle.classList.toggle('playing', !!on);
        // update aria on audio
        if(on) audio.setAttribute('aria-label','Reproduciendo'); else audio.setAttribute('aria-label','Pausado');
        // update fallback play button text/state if present
        if(typeof playBtn !== 'undefined' && playBtn){
            try{
                playBtn.innerText = on ? 'Pausar' : 'Reproducir';
                playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
            }catch(e){ /* ignore if DOM changed */ }
        }
    }

    // Bind click on the vinyl element
    if(vinyl){
        vinyl.addEventListener('click', ()=>{
            togglePlay();
        });
        vinyl.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(); } });
    }

    if(playBtn) playBtn.addEventListener('click', togglePlay);

    // When audio ends, stop animations
    audio.addEventListener('ended', ()=>{ setPlaying(false); });

    // If audio fails to load, log error (no external fallback link configured)
    audio.addEventListener('error', ()=>{ console.warn('Audio failed to load'); });
});
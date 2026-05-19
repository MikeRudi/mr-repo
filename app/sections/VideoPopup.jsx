"use client";

const html = `<div class="video-popup-wrap">
<div class="full_vid_holder" data-lenis-prevent="" video-cursor="" video-target="video-1">
<div class="video-player-wrapper">
<div class="html-video-wrapper" f-data-video="wrapper" id="video1">
<div class="html-video-player w-embed" video-holder="video-1"><video class="video-player-style" f-data-video="video-element" playsinline="">
<source f-data-video-src-quality="720p" src="https://cdn.jsdelivr.net/gh/MikeRudi/media/excellence video 202.mp4">
<source f-data-video-src-quality="1080p" src="https://cdn.jsdelivr.net/gh/MikeRudi/media/excellence video 202.mp4">
</source></source></video></div>
<div class="video-player-style hide"></div>
<div class="video-controls-wrapper player_1" video-cursor-remove="">
<div class="video-progress-wrap">
<a class="track video-element w-inline-block" f-data-video="progress-bar" href="#">
<div class="trackinner" f-data-video="progress"></div>
<div class="video-loading-track" f-data-video="loading"></div>
</a>
</div>
<div class="lower-video-controls" id="w-node-_549d2cf6-e114-6f9c-5428-39a875d88fbe-26c53010" video-cursor-remove="">
<div class="video-controls player_1">
<a class="control-button hide-mobile-landscape w-inline-block" f-data-video="play-button" href="#">
<div class="html-icon w-embed"><svg aria-hidden="true" class="iconify iconify--ic" height="100%" preserveaspectratio="xMidYMid meet" role="img" viewbox="0 0 24 24" width="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path d="M8 5v14l11-7z" fill="currentColor"></path>
</svg></div>
</a>
<a class="control-button hide-mobile-landscape w-inline-block" f-data-video="pause-button" href="#">
<div class="html-icon w-embed"><svg aria-hidden="true" class="iconify iconify--ic" height="100%" preserveaspectratio="xMidYMid meet" role="img" viewbox="0 0 24 24" width="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path d="M6 5h4v14H6zm8 0h4v14h-4z" fill="currentColor"></path>
</svg></div>
</a>
<div class="video-track-wrapper u-text-style-small">
<div f-data-video="current-time">00:00</div>
</div>
</div>
<div class="video-controls hide-mobile-landscape">
<div class="video-volume-wrapper _1">
<a class="video-element w-inline-block" f-data-video="volume-button" href="#">
<div class="html-icon small w-embed"><svg fill="none" height="24" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" d="M1.5 7.86233C0.671573 7.86233 0 8.5339 0 9.36233V14.6383C0 15.4667 0.671574 16.1383 1.5 16.1383H5.51737L9.85343 20.4743C10.7984 21.4192 12.4141 20.75 12.4141 19.4136V4.58699C12.4141 3.25064 10.7984 2.58139 9.85343 3.52633L5.51737 7.86233H1.5ZM20.3897 5.59786C20.0774 5.28539 19.5708 5.28531 19.2584 5.59768C18.9459 5.91005 18.9458 6.41658 19.2582 6.72905C20.608 8.07926 21.3662 9.9103 21.3662 11.8195C21.3662 13.7287 20.608 15.5598 19.2582 16.91C18.9458 17.2224 18.9459 17.729 19.2584 18.0413C19.5708 18.3537 20.0774 18.3536 20.3897 18.0412C22.0395 16.3909 22.9662 14.153 22.9662 11.8195C22.9662 9.48605 22.0395 7.24812 20.3897 5.59786ZM17.5658 8.42189C17.2534 8.10942 16.7469 8.10934 16.4344 8.42171C16.1219 8.73407 16.1219 9.2406 16.4342 9.55307C17.0341 10.1532 17.3711 10.967 17.3711 11.8155C17.3711 12.6641 17.0341 13.4779 16.4342 14.0779C16.1219 14.3904 16.1219 14.8969 16.4344 15.2093C16.7469 15.5217 17.2534 15.5216 17.5658 15.2091C18.4656 14.309 18.9711 13.0883 18.9711 11.8155C18.9711 10.5427 18.4656 9.32203 17.5658 8.42189Z" fill="currentColor" fill-rule="evenodd"></path>
</svg></div>
</a>
<div class="video-volume-embed slider w-embed"><input class="slider" f-data-video="volume-slider" max="1" min="0" step="0.01" type="range" value="0.5"/></div>
</div>
<div class="fullscreen"></div>
</div>
</div>
</div>
</div>
</div>
<div class="model-close-m" f-data-video="pause-button" video-cursor-remove="">
<div class="modal_close is-vid">
<div autofocus=" " class="button_close_wrap" data-button=" " data-modal-close=" " data-trigger="hover focus">
<div class="button_close_element">
<div aria-hidden="true" class="button_close_icon"><svg aria-hidden="true" class="u-svg" fill="none" viewbox="0 0 26 26" width="100%" xmlns="http://www.w3.org/2000/svg">
<path class="u-path" d="M2 2L24.6274 24.6274"></path>
<path class="u-path" d="M2 25L24.6274 2.37258"></path>
</svg></div>
</div>
<div class="clickable_wrap u-cover-absolute">
<a class="clickable_link w-inline-block" href="#" target=""><span class="clickable_text u-sr-only">close</span></a><button class="clickable_btn" type="button"><span class="clickable_text u-sr-only">Close</span></button>
</div>
</div>
</div>
</div>
<div class="volume-slider-css w-embed">
<style>
.slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 100vw; background-color: hsla(0, 0.00%, 98.00%, 0.25); outline: none; overflow: hidden; background: linear-gradient(to right, white 50%, rgba(255, 255, 255, 0.2) 50%); }
.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background-color: transparent;
    border: none;
    cursor: pointer;
}
.slider::-moz-range-thumb {
    appearance: none;
    width: 2px;
    height: 2px;
    background-color: transparent;
    border: none;
    cursor: pointer;
}
.slider::-moz-range-progress {
    background-color: white;
}
.slider::-webkit-slider-runnable-track {
    background: transparent;
}
[class*="html-icon"] svg {
width: 100% !important; height: 100% !important;
}
</style>
</div>
</div>
</div>`;

export default function VideoPopup() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

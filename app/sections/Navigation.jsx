"use client";

const html = `<div class="nav-wrap">
<div class="nav-scroll-wrap" nav-scroll-wrap="">
<div class="nav-logo">
<a class="logo-wrap w-inline-block text-white" href="#lander" instant-scroll=""><svg class="nav-logo-full text-white" fill="none" viewbox="0 0 118 59" width="100%" xmlns="http://www.w3.org/2000/svg">
<path d="M1.11479 53.9036H4.35484C5.12789 53.9036 5.71252 53.7176 6.10876 53.3447C6.50501 52.9724 6.70327 52.4577 6.70327 51.8009C6.70327 51.1539 6.50501 50.6443 6.10876 50.2712C5.71252 49.8989 5.12789 49.7128 4.35484 49.7128H1.11479V53.9036ZM0 58.4036V48.6685H4.42932C5.47949 48.6685 6.30675 48.9503 6.91166 49.514C7.51574 50.0778 7.81806 50.8401 7.81806 51.8009C7.81806 52.7617 7.51574 53.524 6.91166 54.0875C6.30675 54.6515 5.47949 54.9333 4.42932 54.9333H1.11479V58.4036H0Z" fill="currentColor"></path>
<path d="M11.691 53.624H15.0945C15.4513 53.624 15.813 53.5703 16.1794 53.4621C16.5458 53.3545 16.8558 53.1611 17.1086 52.8815C17.3613 52.6022 17.4878 52.2123 17.4878 51.7125C17.4878 51.0947 17.2742 50.6072 16.8484 50.2492C16.4223 49.8913 15.8574 49.7123 15.1542 49.7123H11.691V53.624ZM10.5762 58.4036V48.6682H15.2878C16.2986 48.6682 17.1034 48.9427 17.7031 49.4915C18.3025 50.0409 18.6021 50.781 18.6021 51.7125C18.6021 52.3397 18.4808 52.8401 18.2381 53.2124C17.9952 53.585 17.6905 53.8667 17.3241 54.0579C16.9574 54.2491 16.5907 54.389 16.2241 54.4772L18.8102 58.4036H17.4878L15.1093 54.6683H11.691V58.4036H10.5762Z" fill="currentColor"></path>
<path d="M21.707 58.4036H22.8218V48.6682H21.707V58.4036Z" fill="currentColor"></path>
<path d="M30.7899 57.4511C31.5925 57.4511 32.2837 57.2772 32.8634 56.929C33.4431 56.5811 33.8886 56.1104 34.2011 55.5173C34.5133 54.9242 34.6691 54.265 34.6691 53.5393C34.6691 52.8041 34.5133 52.1422 34.2011 51.554C33.8886 50.9658 33.4431 50.4978 32.8634 50.1493C32.2837 49.8019 31.5925 49.6273 30.7899 49.6273C29.9971 49.6273 29.3084 49.8019 28.7238 50.1493C28.1391 50.4978 27.6911 50.9658 27.3787 51.554C27.0665 52.1422 26.9107 52.8041 26.9107 53.5393C26.9107 54.265 27.0665 54.9242 27.3787 55.5173C27.6911 56.1104 28.1391 56.5811 28.7238 56.929C29.3084 57.2772 29.9971 57.4511 30.7899 57.4511ZM30.7899 58.5247C30.0467 58.5247 29.3678 58.3972 28.7536 58.142C28.1391 57.8874 27.6114 57.5297 27.1708 57.069C26.7297 56.608 26.3904 56.0762 26.1524 55.4731C25.9147 54.87 25.7959 54.2257 25.7959 53.5393C25.7959 52.8435 25.9147 52.1964 26.1524 51.5982C26.3904 51.0003 26.7297 50.4709 27.1708 50.0099C27.6114 49.5492 28.1391 49.1912 28.7536 48.9363C29.3678 48.6817 30.0467 48.554 30.7899 48.554C31.5331 48.554 32.2116 48.6817 32.8261 48.9363C33.4404 49.1912 33.968 49.5492 34.4089 50.0099C34.8498 50.4709 35.1893 51.0003 35.4273 51.5982C35.665 52.1964 35.7838 52.8435 35.7838 53.5393C35.7838 54.2257 35.665 54.87 35.4273 55.4731C35.1893 56.0762 34.8498 56.608 34.4089 57.069C33.968 57.5297 33.4404 57.8874 32.8261 58.142C32.2116 58.3972 31.5331 58.5247 30.7899 58.5247Z" fill="currentColor"></path>
<path d="M39.8755 53.624H43.2791C43.6359 53.624 43.9976 53.5703 44.364 53.4621C44.7304 53.3545 45.0405 53.1611 45.2932 52.8815C45.546 52.6022 45.6725 52.2123 45.6725 51.7125C45.6725 51.0947 45.4589 50.6072 45.0331 50.2492C44.6069 49.8913 44.042 49.7123 43.3388 49.7123H39.8755V53.624ZM38.7607 58.4036V48.6682H43.4724C44.4831 48.6682 45.2881 48.9427 45.8878 49.4915C46.4872 50.0409 46.7868 50.781 46.7868 51.7125C46.7868 52.3397 46.6654 52.8401 46.4228 53.2124C46.1799 53.585 45.8751 53.8667 45.5088 54.0579C45.1421 54.2491 44.7754 54.389 44.4086 54.4772L46.9949 58.4036H45.6725L43.2939 54.6683H39.8755V58.4036H38.7607Z" fill="currentColor"></path>
<path d="M49.8857 58.4036H51.0005V48.6682H49.8857V58.4036Z" fill="currentColor"></path>
<path d="M57.0398 58.4036V49.7125H53.6064V48.6682H61.588V49.7125H58.1546V58.4036H57.0398Z" fill="currentColor"></path>
<path d="M67.1632 58.4036V54.5507L63.0312 48.6682H64.3837L67.7131 53.4036L71.0424 48.6682H72.3948L68.278 54.5507V58.4036H67.1632Z" fill="currentColor"></path>
<path d="M80.2984 53.9036H83.5384C84.3115 53.9036 84.8961 53.7176 85.2924 53.3447C85.6886 52.9724 85.8869 52.4577 85.8869 51.8009C85.8869 51.1539 85.6886 50.6443 85.2924 50.2712C84.8961 49.8989 84.3115 49.7128 83.5384 49.7128H80.2984V53.9036ZM79.1836 58.4036V48.6685H83.6129C84.6631 48.6685 85.4903 48.9503 86.0953 49.514C86.6993 50.0778 87.0016 50.8401 87.0016 51.8009C87.0016 52.7617 86.6993 53.524 86.0953 54.0875C85.4903 54.6515 84.6631 54.9333 83.6129 54.9333H80.2984V58.4036H79.1836Z" fill="currentColor"></path>
<path d="M90.8968 54.5653H94.9099L92.9035 49.8151L90.8968 54.5653ZM88.0283 58.4036L92.2046 48.668H93.602L97.7783 58.4036H96.5447L95.3409 55.58H90.4657L89.262 58.4036H88.0283Z" fill="currentColor"></path>
<path d="M103.737 58.5247C102.766 58.5247 101.978 58.3948 101.374 58.135C100.77 57.8752 100.316 57.5151 100.014 57.0541C99.7117 56.5933 99.5356 56.0737 99.4863 55.4953H100.646C100.675 55.9658 100.834 56.3457 101.121 56.6351C101.409 56.9242 101.788 57.1373 102.258 57.2748C102.729 57.412 103.247 57.4803 103.812 57.4803C104.644 57.4803 105.303 57.3361 105.788 57.0467C106.274 56.7579 106.517 56.3287 106.517 55.76C106.517 55.4167 106.395 55.1401 106.152 54.9291C105.909 54.7184 105.588 54.5443 105.186 54.4071C104.785 54.2696 104.346 54.1448 103.871 54.032C103.395 53.9195 102.917 53.7991 102.437 53.6719C101.956 53.5442 101.515 53.3826 101.114 53.1862C100.712 52.9902 100.391 52.738 100.148 52.4291C99.9048 52.1202 99.7834 51.7257 99.7834 51.2454C99.7834 50.4511 100.093 49.8041 100.712 49.304C101.332 48.8042 102.256 48.5539 103.485 48.5539C104.356 48.5539 105.075 48.6841 105.639 48.9439C106.204 49.2037 106.628 49.5443 106.911 49.966C107.193 50.3871 107.349 50.8435 107.378 51.3335H106.234C106.175 50.8435 105.927 50.4289 105.491 50.0907C105.055 49.7526 104.386 49.5836 103.485 49.5836C102.929 49.5836 102.479 49.6376 102.132 49.7452C101.785 49.8532 101.52 49.9928 101.337 50.1645C101.153 50.3359 101.03 50.5148 100.965 50.7009C100.901 50.8874 100.869 51.0637 100.869 51.2305C100.869 51.5543 100.99 51.8165 101.233 52.0172C101.475 52.2184 101.798 52.3846 102.199 52.5172C102.6 52.6498 103.043 52.7697 103.529 52.8779C104.015 52.9856 104.497 53.1054 104.978 53.238C105.459 53.3704 105.9 53.5371 106.301 53.7378C106.702 53.9387 107.024 54.1964 107.267 54.5099C107.51 54.8236 107.631 55.2255 107.631 55.7158C107.631 56.618 107.284 57.3117 106.591 57.7968C105.897 58.282 104.946 58.5247 103.737 58.5247Z" fill="currentColor"></path>
<path d="M114.066 58.5247C113.095 58.5247 112.307 58.3948 111.703 58.135C111.099 57.8752 110.645 57.5151 110.343 57.0541C110.041 56.5933 109.865 56.0737 109.815 55.4953H110.975C111.004 55.9658 111.163 56.3457 111.45 56.6351C111.738 56.9242 112.117 57.1373 112.587 57.2748C113.058 57.412 113.576 57.4803 114.141 57.4803C114.973 57.4803 115.632 57.3361 116.117 57.0467C116.603 56.7579 116.846 56.3287 116.846 55.76C116.846 55.4167 116.724 55.1401 116.481 54.9291C116.239 54.7184 115.917 54.5443 115.515 54.4071C115.114 54.2696 114.675 54.1448 114.2 54.032C113.724 53.9195 113.246 53.7991 112.766 53.6719C112.285 53.5442 111.844 53.3826 111.443 53.1862C111.041 52.9902 110.719 52.738 110.477 52.4291C110.234 52.1202 110.113 51.7257 110.113 51.2454C110.113 50.4511 110.422 49.8041 111.041 49.304C111.661 48.8042 112.585 48.5539 113.814 48.5539C114.685 48.5539 115.404 48.6841 115.969 48.9439C116.533 49.2037 116.957 49.5443 117.239 49.966C117.522 50.3871 117.678 50.8435 117.707 51.3335H116.563C116.504 50.8435 116.256 50.4289 115.82 50.0907C115.384 49.7526 114.715 49.5836 113.814 49.5836C113.258 49.5836 112.808 49.6376 112.461 49.7452C112.114 49.8532 111.849 49.9928 111.666 50.1645C111.482 50.3359 111.359 50.5148 111.294 50.7009C111.23 50.8874 111.198 51.0637 111.198 51.2305C111.198 51.5543 111.319 51.8165 111.562 52.0172C111.804 52.2184 112.127 52.3846 112.528 52.5172C112.93 52.6498 113.373 52.7697 113.858 52.8779C114.344 52.9856 114.826 53.1054 115.307 53.238C115.788 53.3704 116.229 53.5371 116.63 53.7378C117.031 53.9387 117.353 54.1964 117.596 54.5099C117.839 54.8236 117.96 55.2255 117.96 55.7158C117.96 56.618 117.613 57.3117 116.92 57.7968C116.226 58.282 115.275 58.5247 114.066 58.5247Z" fill="currentColor"></path>
<path class="gold-path" d="M64.1124 1.6917C70.5233 1.6917 71.3782 7.57709 71.3782 10.1427C71.3782 12.7374 70.5233 18.6214 64.1124 18.6214H60.6933V1.6917H64.1124ZM65.0462 20.3144C76.2237 20.3144 76.9343 12.8626 76.9343 10.1427C76.9343 7.45181 76.2237 8.7738e-05 65.0462 8.7738e-05H58.9837V37.2438H56.4195V0.000354767L47.192 2.66631L47.6701 4.29176L51.7147 3.12298V37.2438H46.1621V38.9368H66.2495V37.2438H60.6933V20.3144H65.0462Z" fill="currentColor"></path>
</svg>
<div class="nav-svg-small"><svg fill="none" viewbox="0 0 31 39" width="100%" xmlns="http://www.w3.org/2000/svg">
<path class="gold-path" d="M17.9503 1.69145C24.3611 1.69145 25.2161 7.57685 25.2161 10.1425C25.2161 12.7371 24.3611 18.6212 17.9503 18.6212H14.5312V1.69145H17.9503ZM18.8841 20.3141C30.0616 20.3141 30.7722 12.8624 30.7722 10.1425C30.7722 7.45156 30.0616 -0.000156403 18.8841 -0.000156403H12.8216V37.2436H10.2574V0.000110626L1.02992 2.66607L1.50803 4.29152L5.5526 3.12274V37.2436H0V38.9365H20.0874V37.2436H14.5312V20.3141H18.8841Z" fill="currentColor"></path>
</svg></div>
</a>
</div>
<div class="nav-menu" mobile-menu-dropdown="">
<div class="m-text">
<div class="lang-text-wrap">
<div class="text active-lang text-nav text-caps" lang-text="english">jump to</div>
<div class="text text-nav text-caps" lang-text="chineseSimplified"></div>
<div class="text text-nav text-caps" lang-text="chineseTraditional"></div>
<div class="text text-nav text-caps" lang-text="dutch"></div>
<div class="text text-nav text-caps" lang-text="french"></div>
<div class="text text-nav text-caps" lang-text="german"></div>
<div class="text text-nav text-caps" lang-text="italian"></div>
<div class="text text-nav text-caps" lang-text="japanese"></div>
<div class="text text-nav text-caps" lang-text="korean"></div>
<div class="text text-nav text-caps" lang-text="polish"></div>
<div class="text text-nav text-caps" lang-text="portuguese"></div>
<div class="text text-nav text-caps" lang-text="russian"></div>
<div class="text text-nav text-caps" lang-text="spanish"></div>
<div class="text text-nav text-caps" lang-text="turkish"></div>
</div>
</div>
<a class="anchor-link-wrap w-inline-block" href="#lounge-of-year" instant-scroll="" link-underline-hover="">
<div class="m-nav-img"><img alt="" class="img-abs" loading="lazy" src="images/mobile-menu-01.png"/></div>
<div class="lang-text-wrap">
<div class="text active-lang text-nav text-caps is-mobile-menu" lang-text="english">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="chineseSimplified">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="chineseTraditional">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="dutch">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="french">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="german">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="italian">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="japanese">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="korean">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="polish">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="portuguese">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="russian">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="spanish">lounge of the year</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="turkish">lounge of the year</div>
</div>
<div class="link-underline" link-underline=""></div>
</a>
<div class="m-n-line"></div>
<a class="anchor-link-wrap w-inline-block" href="#one-to-watch" instant-scroll="" link-underline-hover="">
<div class="m-nav-img"><img alt="" class="img-abs" loading="lazy" src="images/mobile-menu-02.png"/></div>
<div class="lang-text-wrap">
<div class="text active-lang text-nav text-caps is-mobile-menu" lang-text="english">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="chineseSimplified">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="chineseTraditional">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="dutch">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="french">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="german">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="italian">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="japanese">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="korean">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="polish">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="portuguese">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="russian">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="spanish">one to watch</div>
<div class="text text-nav text-caps is-mobile-menu" lang-text="turkish">one to watch</div>
</div>
<div class="link-underline" link-underline=""></div>
</a>
<div class="m-n-line"></div>
<div class="nav-language" data-lenis-prevent="" language-btn="" link-underline-hover="">
<div class="flex-right">
<div class="lang-text-wrap">
<div class="text active-lang text-nav text-caps" lang-text="english">language</div>
<div class="text text-nav text-caps" lang-text="chineseSimplified">语言</div>
<div class="text text-nav text-caps" lang-text="chineseTraditional">語言</div>
<div class="text text-nav text-caps" lang-text="dutch">Taal</div>
<div class="text text-nav text-caps" lang-text="french">Langue</div>
<div class="text text-nav text-caps" lang-text="german">Sprache</div>
<div class="text text-nav text-caps" lang-text="italian">Lingua</div>
<div class="text text-nav text-caps" lang-text="japanese">言語</div>
<div class="text text-nav text-caps" lang-text="korean">언어</div>
<div class="text text-nav text-caps" lang-text="polish">Język</div>
<div class="text text-nav text-caps" lang-text="portuguese">Idioma</div>
<div class="text text-nav text-caps" lang-text="russian">Язык</div>
<div class="text text-nav text-caps" lang-text="spanish">Idioma</div>
<div class="text text-nav text-caps" lang-text="turkish">Dil</div>
</div>
<div class="language-arrow"><svg fill="none" language-arrow="" viewbox="0 0 14 8" width="100%" xmlns="http://www.w3.org/2000/svg">
<path d="M0.599609 0.600098L6.59961 6.6001L12.5996 0.600098" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"></path>
</svg></div>
<div class="language-dropdown" language-dropdown="">
<div class="language-list">
<div class="language-item" lang-btn="chineseSimplified">
<div class="text-language text-black">Chinese (Simplified, China)</div>
</div>
<div class="language-item" lang-btn="chineseTraditional">
<div class="text-language text-black">Chinese (Traditional, Taiwan)</div>
</div>
<div class="language-item" lang-btn="dutch">
<div class="text-language text-black">Dutch (Netherlands)</div>
</div>
<div class="language-item" lang-btn="english">
<div class="text-language text-black">English (United Kingdom)</div>
</div>
<div class="language-item" lang-btn="french">
<div class="text-language text-black">French (France)</div>
</div>
<div class="language-item" lang-btn="german">
<div class="text-language text-black">German (Germany)</div>
</div>
<div class="language-item" lang-btn="italian">
<div class="text-language text-black">Italian (Italy)</div>
</div>
<div class="language-item" lang-btn="japanese">
<div class="text-language text-black">Japanese (Japan)</div>
</div>
<div class="language-item" lang-btn="korean">
<div class="text-language text-black">Korean (South Korea)</div>
</div>
<div class="language-item" lang-btn="polish">
<div class="text-language text-black">Polish (Poland)</div>
</div>
<div class="language-item" lang-btn="portuguese">
<div class="text-language text-black">Portuguese (Brazil)</div>
</div>
<div class="language-item" lang-btn="russian">
<div class="text-language text-black">Russian (Russia)</div>
</div>
<div class="language-item" lang-btn="spanish">
<div class="text-language text-black">Spanish (Latin America)</div>
</div>
<div class="language-item" lang-btn="turkish">
<div class="text-language text-black">Turkish (Turkey)</div>
</div>
</div>
</div>
</div>
<div class="link-underline" link-underline=""></div>
</div>
</div>
<div class="nav-right">
<div class="flex-right">
<a class="btn-full-wrap is-nav w-inline-block" href="https://www.prioritypass.com/" target="_blank">
<div class="lang-text-wrap">
<div class="text active-lang text-nav text-caps text-no-wrap text-white" lang-text="english">return home</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="chineseSimplified">返回主页</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="chineseTraditional">返回主頁</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="dutch">Terug naar huis</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="french">Retour à la page d’accueil</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="german">Zurück zur Startseite</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="italian">Rientro a casa</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="japanese">トップに戻る</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="korean">홈으로 돌아가기</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="polish">Wróć na stronę główną</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="portuguese">Voltar para a página inicial</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="russian">Возврат на домашнюю страницу</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="spanish">Volver a la página de inicio</div>
<div class="text text-nav text-caps text-no-wrap text-white" lang-text="turkish">Ana Sayfaya Dön</div>
</div>
</a>
<div class="mobile-hamburger" mobile-menu-btn="">
<div class="m-h-line is-1" mobile-hamburger-line=""></div>
<div class="m-h-line" mobile-hamburger-line=""></div>
<div class="m-h-line" mobile-hamburger-line=""></div>
<div class="ham-close is-1" ham-close=""></div>
<div class="ham-close" ham-close=""></div>
</div>
</div>
</div>
<div class="nav-bg" nav-scroll-bg=""></div>
</div>
<div class="m-nav-bg" mobile-menu-bg=""></div>
</div>`;

export default function Navigation() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

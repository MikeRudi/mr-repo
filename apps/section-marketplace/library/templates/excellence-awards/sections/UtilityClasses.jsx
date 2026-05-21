const markup = `
<div class="display-none">
    <div class="text"></div>
    <div class="text-h1">This is some text inside of a div block.</div>
    <div class="text-h2">This is some text inside of a div block.</div>
    <div class="text-h3">This is some text inside of a div block.</div>
    <div class="text-h4">This is some text inside of a div block.</div>
    <div class="text-h5">This is some text inside of a div block.</div>
    <div class="text-h6">This is some text inside of a div block.</div>
    <div class="text-large">This is some text inside of a div block.</div>
    <div class="text-main">This is some text inside of a div block.</div>
    <div class="text-small">This is some text inside of a div block.</div>
    <div class="text-xsmall">This is some text inside of a div block.</div>
    <div class="eyebrow">This is some text inside of a div block.</div>
    <div class="text-nav">This is some text inside of a div block.</div>
    <div class="text-nav is-mobile-menu">This is some text inside of a div block.</div>
    <div class="text-no-wrap">This is some text inside of a div block.</div>
    <div class="ch-25"></div>
    <div class="ch-50"></div>
    <div class="ch-65"></div>
    <div class="ch-79"></div>
    <div class="ch-90"></div>
    <div class="text-caps"></div>
    <div class="text-center"></div>
    <div class="text-white"></div>
    <div class="text-black"></div>
    <div class="text-gold-light"></div>
    <div class="dark-gold"></div>
    <div class="full-height"></div>
    <div class="full-height-desktop"></div>
    <div class="full-cover"></div>
    <div class="full-cover-mobile"></div>
    <div class="active-lang"></div>
    <div class="eyebrow"></div>
    <div class="content-header-112"></div>
    <div class="pointer-events-off"></div>
    <div class="text-faded-60"></div>
    <div class="intro-img"></div>
    <div class="content-160-y"></div>
    <div class="content-160-top"></div>
    <div class="content-112-bot"></div>
    <div class="content-160-bot"></div>
    <div class="ratio-vid-img"></div>
    <div class="ratio-global-lounge"></div>
    <div class="card-small"></div>
    <div class="vid-item-embed"></div>
    <div class="text-invert"></div>
    <div class="text-fade-60"></div>
    <div class="text-underline">This is some text inside of a div block.</div>
    <div class="display-none"></div>
    <div class="lang-text-wrap">
      <div lang-text="english" class="text active-lang eyebrow text-scroll display-none">members choice</div>
      <div lang-text="chineseSimplified" class="text eyebrow text-scroll display-none">会员之选</div>
      <div lang-text="chineseTraditional" class="text eyebrow text-scroll display-none">會員之選</div>
      <div lang-text="dutch" class="text eyebrow text-scroll display-none">Keuze van leden</div>
      <div lang-text="french" class="text eyebrow text-scroll display-none">Choix des membres</div>
      <div lang-text="german" class="text eyebrow text-scroll display-none">Mitgliederentscheidung</div>
      <div lang-text="italian" class="text eyebrow text-scroll display-none">Scelta dai soci</div>
      <div lang-text="japanese" class="text eyebrow text-scroll display-none">会員が選ぶラウンジ</div>
      <div lang-text="korean" class="text eyebrow text-scroll display-none">멤버의 선택</div>
      <div lang-text="polish" class="text eyebrow text-scroll display-none">Wybór członków</div>
      <div lang-text="portuguese" class="text eyebrow text-scroll display-none">Escolha dos associados</div>
      <div lang-text="russian" class="text eyebrow text-scroll display-none">Выбор участников</div>
      <div lang-text="spanish" class="text eyebrow text-scroll display-none">Elección de los miembros</div>
      <div lang-text="turkish" class="text eyebrow text-scroll display-none">Üyelerin seçimi</div>
    </div>
    <div class="text-white-desktop">This is some text inside of a div block.</div>
  </div>
`;

export default function UtilityClasses() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

import { INFO_SVG, CHEVRON_SVG, EXT_LINK_SVG, NOTICE_SVG, SEAT_SVG, MAP_SVG, MANNER_SVG, GIFT_SVG, WARN_SVG, FLASH_OFF_SVG, SHARE_SVG, MOON_SVG } from "./icons.js";
import { siteFooterHtml } from "./footer.js";

// Shared by Vite prerendering and client-side navigation.
export function homeHtml(build, themeToggle = `<button class="theme-toggle home-theme" type="button" data-theme-toggle aria-label="切換主題">${MOON_SVG}</button>`){
  return `
    <section class="hero">
      ${themeToggle}
      <div class="hero-inner">
        <div class="eyebrow">ASIA ARENA TOUR 2026</div>
        <h1 class="tour-title"><span>VAUNDY</span>&ldquo;HORO&rdquo;</h1>

        <div class="countdown" id="countdown">
          <div class="cd-pill">
            <span class="cd-dday" id="cd-dday">D-00</span>
            <span class="cd-sep"></span>
            <span class="cd-clock" id="cd-clock">00:00:00</span>
          </div>
        </div>

        <div class="show-meta">
          <div class="show-row">
            <span class="show-day">10.31<span class="dow">六</span></span>
            <span class="show-time">19:00</span>
          </div>
          <div class="show-row">
            <span class="show-day">11.01<span class="dow">日</span></span>
            <span class="show-time">19:00</span>
          </div>
          <div class="show-venue">TAIPEI ARENA, TAIPEI</div>
        </div>

        <!-- 공연 당일에만 나타나는 오늘의 일정 -->
        <div class="today-card" id="today-card" hidden>
          <div class="today-head"><span class="dot"></span><span id="today-title">今日</span></div>
          <div class="today-now" id="today-now"></div>
          <ul class="today-list" id="today-list"></ul>
        </div>

        <nav class="main-menu">
          <button class="menu-btn" id="guide-btn">
            <span class="menu-btn-label">應援指南 無劇透</span>
          </button>
        </nav>

        <section class="info-section">
      <div class="menu-card">
      <div class="info-card" id="info-card">
        <button class="menu-row info-toggle" id="info-toggle" aria-expanded="false" aria-controls="info-panel">
          <span class="info-toggle-icon">${INFO_SVG}</span>
          <span class="info-toggle-label">演出資訊</span>
          <span class="info-toggle-chevron">${CHEVRON_SVG}</span>
        </button>
        <div class="info-panel" id="info-panel" inert aria-hidden="true">
          <div class="info-panel-inner">
            <div class="info-panel-title"><span class="bar">|</span> 演出概要 <span class="bar">|</span></div>
            <dl class="info-facts">
              <dt>演出名稱</dt>
              <dd>Vaundy ASIA ARENA TOUR 2026 &ldquo;HORO&rdquo; IN TAIPEI</dd>

              <dt>日期／時間</dt>
              <dd>
                <span class="em">2026.10.31（六）19:00</span> ／ <span class="em">11.01（日）19:00</span>
                <span class="sub">兩天皆 17:30 開場・時間以官方公告為準</span>
              </dd>

              <dt>地點</dt>
              <dd>
                台北小巨蛋 Taipei Arena
                <span class="sub">105037 臺北市松山區南京東路4段2號</span>
              </dd>

              <dt>入場規則</dt>
              <dd>
                全場實名制
                <span class="sub">入場請攜帶票券及填寫的有效證件正本；外籍觀眾依售票平台規定攜帶護照正本</span>
              </dd>

              <dt>票價</dt>
              <dd>
                <p class="info-price">
                  <span>NT$ 5,880</span>
                  <span>NT$ 4,880</span>
                  <span>NT$ 3,880</span>
                  <span>NT$ 2,880</span>
                  <span>NT$ 800</span>
                </p>
                <span class="sub">另收購票手續費</span>
              </dd>

              <dt>取票方式</dt>
              <dd>
                依 Ticket Plus 遠大售票平台提供
                <span class="sub">實名制資料請務必填寫正確，入場規定以售票平台公告為準</span>
              </dd>

              <dt>購票</dt>
              <dd>
                Ticket Plus 遠大售票
                <span class="sub">票務、實名制與入場問題請依售票平台最新公告確認</span>
              </dd>
            </dl>

            <a class="info-book-link" href="https://ticketplus.com.tw/activity/6c3d8c24e0f00c9c84777615c001bebe" target="_blank" rel="noopener">
              ${EXT_LINK_SVG} 前往 Ticket Plus 售票頁面
            </a>

            <hr class="info-divider">

            <div class="info-panel-title"><span class="bar">|</span> 觀眾入場資訊 <span class="bar">|</span></div>
            <div class="info-table-wrap">
              <table class="info-table">
                <colgroup>
                  <col class="info-col-label">
                  <col class="info-col-day">
                  <col class="info-col-day">
                  <col class="info-col-note">
                </colgroup>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>10/31（六）</th>
                    <th>11/1（日）</th>
                    <th>備註</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="label" data-label="項目">開場／入場</td>
                    <td data-label="10/31（六）">17:30</td>
                    <td data-label="11/1（日）">17:30</td>
                    <td class="note" data-label="備註">官方已公布</td>
                  </tr>
                  <tr>
                    <td class="label" data-label="項目">正式演出</td>
                    <td data-label="10/31（六）">19:00</td>
                    <td data-label="11/1（日）">19:00</td>
                    <td class="note" data-label="備註">官方已公布</td>
                  </tr>
                  <tr>
                    <td class="label" data-label="項目">周邊／物品寄放</td>
                    <td data-label="10/31（六）">待公告</td>
                    <td data-label="11/1（日）">待公告</td>
                    <td class="note" data-label="備註">請以主辦與場館公告為準</td>
                  </tr>
                  <tr>
                    <td class="label" data-label="項目">演出結束</td>
                    <td data-label="10/31（六）">預計 21:00 左右</td>
                    <td data-label="11/1（日）">預計 21:00 左右</td>
                    <td class="note" data-label="備註">實際時間以現場為準</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="info-footnote">※ 目前官方已確認開場與開演時間；周邊販售、物品寄放與入場動線公布後會再補上。<br>※ 最新資訊請以主辦單位、Ticket Plus 與台北小巨蛋公告為準。</p>



          </div>
        </div>
      </div>

      <div class="info-card" id="notice-card">
        <button class="menu-row info-toggle" aria-expanded="false">
          <span class="info-toggle-icon">${NOTICE_SVG}</span>
          <span class="info-toggle-label">公告・指南</span>
          <span class="info-toggle-chevron">${CHEVRON_SVG}</span>
        </button>
        <div class="info-panel" inert aria-hidden="true">
          <div class="info-panel-inner">
            <p class="way-note">台北場的場館地圖、MD、身分確認等<b>官方公告</b>會在公布後補上。</p>
            <div class="notice-grid" id="notice-grid"></div>
            <p class="notice-empty" id="notice-empty" hidden>
              台北場官方公告圖片尚未公布，請先以主辦與場館公告為準。
            </p>
            <p class="info-footnote">※ 台北場官方公告圖片公布後再更新。</p>
          </div>
        </div>
      </div>

      <div class="info-card" id="seat-card">
        <button class="menu-row info-toggle" aria-expanded="false">
          <span class="info-toggle-icon">${SEAT_SVG}</span>
          <span class="info-toggle-label">座位配置圖</span>
          <span class="info-toggle-chevron">${CHEVRON_SVG}</span>
        </button>
        <div class="info-panel" inert aria-hidden="true">
          <div class="info-panel-inner">
            <div class="info-panel-title"><span class="bar">|</span> 台北小巨蛋 Taipei Arena <span class="bar">|</span></div>

            <p class="way-note">台北場最新官方舞台／座位配置圖：</p>
            <div class="seat-wrap">
              <a class="seat-map-link" href="./images/taipei-stage-map.webp" target="_blank" rel="noopener">
                <img class="seat-map-image" data-src="./images/taipei-stage-map-preview.webp" width="2772" height="3681" alt="Vaundy ASIA ARENA TOUR 2026「HORO」台北場台北小巨蛋舞台與座位配置圖，含各區票價；點擊查看原尺寸" loading="lazy" decoding="async">
              </a>
              <p class="seat-map-caption">點擊圖片後才會載入壓縮原圖，可開啟原尺寸查看。</p>
            </div>
            <p class="way-note">圖中票價與票區依主辦單位公布的配置圖整理；實際座位、入場動線與現場安排仍以票券及演出當日公告為準。</p>
            <div class="info-book-links">
              <a class="info-book-link" href="https://ticketplus.com.tw/activity/6c3d8c24e0f00c9c84777615c001bebe" target="_blank" rel="noopener">
                ${EXT_LINK_SVG} Ticket Plus 售票頁面
              </a>
              <a class="info-book-link" href="https://www.arena.taipei/" target="_blank" rel="noopener">
                ${EXT_LINK_SVG} 台北小巨蛋官網
              </a>
              <a class="info-book-link" href="https://twconcertview.com/venue/taipei-arena-center-stage/" target="_blank" rel="noopener">
                ${EXT_LINK_SVG} 台灣各大場館視野
              </a>
            </div>

            <p class="info-footnote">※ 若主辦單位後續更新舞台、票區或票價，請以最新官方公告為準。</p>
          </div>
        </div>
      </div>

      <div class="info-card" id="way-card">
        <button class="menu-row info-toggle" aria-expanded="false">
          <span class="info-toggle-icon">${MAP_SVG}</span>
          <span class="info-toggle-label">交通方式</span>
          <span class="info-toggle-chevron">${CHEVRON_SVG}</span>
        </button>
        <div class="info-panel" inert aria-hidden="true">
          <div class="info-panel-inner">
            <div class="way-addr">
              <b>台北小巨蛋 Taipei Arena</b>
              <span>105037 臺北市松山區南京東路4段2號</span>
            </div>
            <div class="way-btns">
              <a href="https://www.arena.taipei/cp.aspx?n=459956E830D4A8BB" target="_blank" rel="noopener">場館交通資訊</a>
              <a href="https://web.metro.taipei/pages2026/WebStation/109" target="_blank" rel="noopener">台北捷運 G17</a>
              <a href="https://www.google.com/maps/search/?api=1&query=Taipei+Arena+Taipei" target="_blank" rel="noopener">Google 地圖</a>
              <button type="button" id="copy-addr">複製地址</button>
            </div>

            <p class="way-note">演出日場館周邊預計人潮與車流較多，請<b>優先搭乘大眾運輸並預留入場時間</b>。</p>

            <div class="way-sec">
              <h4>捷運 <span>最推薦</span></h4>

              <div class="way-block">
                <div class="way-block-t">① 松山新店線（綠線） → <b>G17 台北小巨蛋站</b></div>
                <ul class="way-ul">
                  <li>搭乘台北捷運松山新店線至 G17 台北小巨蛋站，從<b> 2 號出口</b>出站即達。</li>
                  <li>從其他捷運路線前往時，請先轉乘至松山新店線；出發前可用台北捷運官方網站確認路線與營運資訊。</li>
                </ul>
              </div>
            </div>

            <div class="way-sec">
              <h4>公車</h4>
              <ul class="way-ul">
                <li>可搜尋站名「臺北小巨蛋」或「捷運台北小巨蛋站」。</li>
                <li>公車路線、到站時間與演出日改道資訊，請以臺北市公車動態資訊及現場公告為準。</li>
              </ul>
            </div>

            <div class="way-sec">
              <h4>開車／停車</h4>
              <ul class="way-ul warn">
                <li>活動日周邊車流與停車需求高，建議不要把開車作為首選。</li>
                <li>若需開車，請先查看台北小巨蛋官方停車與交通公告；場館車位有限，<b>停車不等於保證入場</b>。</li>
                <li>散場時請依工作人員與交通管制指示離場，避免在場館周邊久候。</li>
              </ul>
            </div>

            <p class="info-footnote">※ 地圖 App 需要網路連線。<br>※ 出口、交通管制、停車與臨時接駁若有變更，均以台北小巨蛋、台北捷運及主辦官方公告為準。</p>
          </div>
        </div>
      </div>

      <div class="info-card" id="manner-card">
        <button class="menu-row info-toggle" aria-expanded="false">
          <span class="info-toggle-icon">${MANNER_SVG}</span>
          <span class="info-toggle-label">應援禮儀・第一次參加</span>
          <span class="info-toggle-chevron">${CHEVRON_SVG}</span>
        </button>
        <div class="info-panel" inert aria-hidden="true">
          <div class="info-panel-inner">

            <p class="way-note">不知道應援口號也沒關係。<b>應援不是義務。</b>這份指南整理的是「知道後會更有趣的事」，不是必須背熟的作業。安靜站著欣賞也很棒。</p>

            <div class="way-sec">
              <h4>第一次參加 <span>知道這些就足夠</span></h4>
              <ul class="way-ul">
                <li><b>不用全部跟著做。</b>只要在熟悉的歌曲、熟悉的段落一起應援，就能玩得很開心</li>
                <li>不會日文也沒關係・大合唱多半是<b>「Hu Hu」、「DA-DA-DA」</b>這類聲音，記住發音就可以</li>
                <li>本指南的動作全部都是<b>徒手</b>完成，不需要另外準備應援物品</li>
                <li>晚一拍跟著周圍的人做也完全不奇怪</li>
                <li>場館內網路訊號可能不穩。請<b>在家先開啟一次這個頁面</b>・歌詞會儲存在手機裡，沒有網路也能查看</li>
              </ul>
            </div>

            <div class="way-sec">
              <h4>一起遵守 <span>為了大家的觀賞體驗</span></h4>
              <ul class="way-ul warn">
                <li><b>禁止拍攝・錄音・錄影。</b>若有允許拍攝的段落，現場會另行通知</li>
                <li>演出中請<b>調低手機螢幕亮度</b>。昏暗觀眾席中的亮螢幕，後方觀眾會看得非常清楚</li>
                <li>請<b>避免使用手機閃光燈</b>。舞台演出連燈光完全熄滅的瞬間都經過設計，觀眾席的一道光可能破壞那個畫面
                  <span class="way-hint">若有全場一起舉燈的安排，演出中會另行通知</span></li>
                <li>安靜歌曲・原聲樂段請<b>克制口號與歡呼</b>，很多人是來聽歌的</li>
                <li>把手大幅揮過頭頂時，請留意<b>左右與後方觀眾的視線</b></li>
                <li>演出中的交談與歌曲解說，請留到曲目結束後再分享</li>
                <li>高帽子・蓬鬆髮型可能遮擋後方觀眾視線</li>
                <li>在人潮密集的空間裡，氣味強烈的香水可能讓他人感到不適</li>
              </ul>
            </div>

            <div class="way-sec">
              <h4>如果是站席</h4>
              <ul class="way-ul">
                <li><b>不要往前推。</b>後方推擠的力量會直接累積到前排</li>
                <li>大包包請放進<b>行李寄放處</b>・放在腳邊可能導致跌倒</li>
                <li>如果周圍有人跌倒，請不要推擠，<b>停下來扶起對方</b></li>
                <li>入場前先喝水、先上洗手間，因為要站立 2 小時</li>
                <li>若呼吸急促或頭暈，請不要勉強，告知<b>附近的工作人員</b></li>
              </ul>
            </div>

            <p class="info-footnote">※ 本指南由粉絲製作。拍攝、攜入、再次入場等官方規定，以 Ticket Plus、台北小巨蛋公告與<b>演出當天現場指示</b>為準。</p>
          </div>
        </div>
      </div>

      <div class="info-card" id="vaws-card">
        <button class="menu-row info-toggle" aria-expanded="false">
          <span class="info-toggle-icon">${GIFT_SVG}</span>
          <span class="info-toggle-label">VAWS 會員票卡</span>
          <span class="info-toggle-chevron">${CHEVRON_SVG}</span>
        </button>
        <div class="info-panel" inert aria-hidden="true">
          <div class="info-panel-inner">
            <div class="info-panel-title"><span class="bar">|</span> 場館限定特典 <span class="bar">|</span></div>

            <p class="way-note">VAWS MEMBERS 的「公演別原創票卡」為巡演場館限定企劃；台北場攤位位置、開放時間與領取方式目前尚待官方公告。</p>

            <dl class="info-facts">
              <dt>台北場</dt>
              <dd>
                <span class="em">台北小巨蛋 Taipei Arena</span>
                <span class="sub">2026.10.31（六）・11.01（日）</span>
              </dd>

              <dt>對象</dt>
              <dd>
                <span class="em">VAWS MEMBERS 會員</span>
                <span class="sub">是否可於演出當日新加入、兌換地點與流程，請等待官方公告</span>
              </dd>

              <dt>攤位資訊</dt>
              <dd>
                <span class="em">待官方公布</span>
                <span class="sub">其他場次的攤位位置與營運時間不適用於台北場</span>
              </dd>
            </dl>

            <ul class="way-ul warn">
              <li>官方公布後，請依公告中的 QR 碼與兌換流程辦理。</li>
              <li>攤位時間與數量可能依準備狀況、天氣及現場人流調整。</li>
              <li>開場前後預計人潮較多，請預留時間。</li>
            </ul>

            <a class="info-book-link" href="https://member.vaundy.jp/feature/ASIAARENATOUR_2026" target="_blank" rel="noopener">
              ${EXT_LINK_SVG} 查看 VAWS 官方巡演頁面
            </a>

            <p class="info-footnote">※ 以上內容以 VAWS MEMBERS 官方公告為準，詳細安排可能依演出當天現場狀況調整。</p>
          </div>
        </div>
      </div>

      <div class="menu-links">
        <a class="menu-chip" href="https://vaundy.jp/?lang=en" target="_blank" rel="noopener">
          <span class="chip-ico">${EXT_LINK_SVG}</span>
          <span class="chip-label">官方網站</span>
        </a>
        <button class="menu-chip spoiler" type="button" id="setlist-btn">
          <span class="chip-ico warn">${WARN_SVG}</span>
          <span class="chip-label">東京/首爾歌單</span>
          <span class="chip-note">含劇透</span>
        </button>
      </div>
      </div>

      <!-- 폰 플래시(폰 반딧불) 안내 — 접지 않고 바로 보이는 한 문단 -->
      <aside class="home-note">
        <span class="home-note-ico">${FLASH_OFF_SVG}</span>
        <div class="home-note-body">
          <b>請避免使用手機閃光燈</b>
          <p>舞台演出連燈光完全熄滅的瞬間都經過設計。觀眾席的一道光會打破黑暗，讓精心安排的畫面失去效果。</p>
          <p class="sub">若有全場一起舉燈的安排，演出中會另行通知。</p>
        </div>
      </aside>

      <div class="home-foot">
        <button class="share-btn" type="button" id="share-btn">${SHARE_SVG} 分享</button>
      </div>
        </section>
      </div>
    </section>

    ${siteFooterHtml(build)}
  `;
}

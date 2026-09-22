# CHANGELOG

本檔案依 Git 歷史整理，使用版本提交作為每一段的邊界。

## [**v1.8.30**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/e77dc02)

- 拆分〈不可幸力〉第二段副歌的「あれ、なに」與「それ、なに」為兩個歌詞段落，並同步更新日本版合唱時間、假名與羅馬字，讓應援提示與演唱節奏一致。

## [**v1.8.29**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/3dd6f153ab539484e0f2e9fc95483ed196b2ba3e)

- 修正〈不可幸力〉、〈恋風邪にのせて〉等歌曲的過長歌詞分段，補齊對應的假名、羅馬字與應援區段。
- 移除舊韓文歌詞提示，將合唱與拍手等應援 `tag` 統一交由日文歌詞分段承載，並補齊原本缺少 `jp` 的提示行。
- 更新應援判斷、歌曲標記與歌詞讀音邏輯，避免再依賴已移除的 `ko` 歌詞資料。

## [**v1.8.25**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/84025c84a1c31f6eff44c3151f41772ef37f2c6f) - [**v1.8.28**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/dcba472ce471bbe82d64c0b5077f6cb5917ff057)

- 調整手機版歌曲工具列的倍速與讀音控制寬度、字級和間距，讓控制項在小螢幕上更容易操作。
- 在頁尾加入「更新日誌」，以彈出視窗顯示本檔案內容；支援關閉按鈕、背景點擊、Esc 鍵與鍵盤焦點返回。
- 讓更新日誌視窗跟隨網站的深色／淺色主題，並縮小視窗尺寸、改善手機版的閱讀高度與間距。
- 調整手機版頁尾的專案連結排列，保留 GitHub 專案與原始 Seoul 指南的來源資訊。
- 新增較慢的歌曲播放倍速 `x0.25`、`x0.5`、`x0.75`；設定會保存，並依目前 YouTube 影片實際支援的倍速停用不適用選項。

## [**v1.8.20**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/84e01a8351d0e44600b182dbf127516c0af83a9c) - [**v1.8.24**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/b5df23c1f2766c8cb07af375e089d89a4a11f531)

- 新增歌曲播放倍速控制，支援 `x1`、`x1.25`、`x1.5`、`x2`，並保存使用者選擇；切換歌曲時會依 YouTube 實際支援的倍速恢復設定，同步調整 BPM 應援動畫。
- 移除不穩定的 `x1.1` 選項，停用目前影片不支援的倍速，並修正倍速控制的狀態與無障礙標籤。
- 為手機版歌曲工具列提供更短的「應援」、「日／中」、「卡拉」與「同步」標籤，以及「假／羅／假+羅」讀音縮寫，避免控制項擁擠。
- 調整手機版讀音控制的寬度、間距與倍速選單字體，讓小螢幕上的歌曲控制更容易辨識與操作。

## [**v1.8.15**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/8df2f425ce121d2edaffb4d08d7541ef790423ed) - [**v1.8.19**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/60f21277ea694244c43745b57d7949e6b6dc26af)

- 支援手機橫向分割畫面，並讓歌曲頁的「簡潔模式」（隱藏影片畫面、保留聲音與歌詞）在橫向版面使用完整寬度。
- 修正同步歌詞提示文字的對齊，完成羅馬字對照與歌詞映射稽核。
- 新增 LRCLIB `lyricsfile`／同步 LRC 的逐行時間來源；卡拉 OK 會在既有逐字來源與 AMLL TTML DB 無結果時繼續 fallback。
- 依來源實際提供逐字或逐行時間顯示狀態，並改善來源名稱、對齊行數、影片偏移與本機快取的提示。

## [**v1.7.5**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/115ecd78b3330a3f1331a0caf120b1e905f7cc66) - [**v1.8.14**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/ffd4e397bbfa4a2d9849ee3a2d211d1913011871)

- 新增日本版／韓國版應援切換，提供逐曲應援說明、差異摘要、Canva 參考來源與記憶使用者選擇。
- 移除容易混淆的韓國歌詞提示，將日本版的跟唱、動作與口號分開標示。
- 將日文應援片段拆到正確的歌詞區段，只為實際應援文字套用顏色，並修正〈Tokimeki〉、日文 motto 與其他歌曲的時間點和分段。
- 加入可收合的日文應援筆記，保留歌曲切換後的設定，並修正應援旗標、圖示顏色、行數與段數顯示。
- 更新劇透歌單的安全返回與查看模式文字，修正服務工作者在發佈後的快取更新。

## [**v1.6.19**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/1479630c5caf6ba1de149bcfb679a21ef19759d6) - [**v1.7.2**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/ffaefea4fac2c2e10669ca0cb6a492149989d8ff)

- 將介面字體改為台灣常見的系統字體，移除不必要的 Pretendard 字體檔，並在中日文與英數字之間補上顯示用半形空白。
- 將應援動作圖片改為 WebM 優先、動畫 WebP 次之、GIF 最後回退，並延後載入公告、VAWS 圖片與歌曲應援素材，減少首次開啟的下載量。
- 修正只有拍手／揮手提示的歌詞資料列不應搶走目前演唱歌詞的同步邏輯。
- 補上韓國原作者致謝，更新台灣場地圖與手機版頁尾排列，並同步 PWA 的版本與離線快取標記。

## [**v1.6.6**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/8973b38ec0fe2611fbb3fbb46b370cc06c744b4a) - [**v1.6.16**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/e0c6e9137424a91c424e48804dcd7632bc1aa126)

- 在頁尾補上原始專案、翻譯作者與回饋入口，統一歌曲資訊與卡拉 OK 說明提示，並修正台灣應援指南的標示。
- 更新主題控制與日文讀音介面，整理假名、羅馬字與合併讀音的文字；抽出可重複使用的歌詞翻譯來源資料。
- 改用日文字型顯示歌曲標題，修正回饋連結、卡拉 OK 陰影與自動捲動控制的樣式。
- 加入場館檢視參考連結，並改善手機版座位連結、Jonetsu 翻譯資料與頁尾連結的排列。

## [**v1.6.1**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/08b17fa5ff4050e702ce88a83053af79f618890e) - [**v1.6.5**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/e3998c87b399a224d051dae01fdf6f3c0a5cf126)

- 縮短歌詞同步提示，將卡拉 OK 來源狀態移入影片資訊區，並穩定 YouTube 播放器的開啟與狀態顯示。
- 修正並替換〈怪獣の花唄〉的中文歌詞翻譯。
- 使用上一首／下一首的曲目圖示改善歌曲導覽。
- 在頁尾加入中文歌詞翻譯來源與作者連結，並調整手機版翻譯署名、頁尾連結與簡潔模式播放控制的排版。

## [**cccc899**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/cccc89922ebdbb10afe57cd16e843cf1e3e0d2a8) - [**v1.6.0**](https://github.com/watain666/Vaundy-Taiwan-2026/commit/9ff8bd36561f08e8564053ef1b3965073c6f33f7)

- 將介面、PWA metadata、公告與演出資訊轉為繁體中文，並將指南從首爾場調整為台北場。
- 加入台北場座位圖，將東京／首爾歌單明確標示為非官方參考。
- 讓拍手、揮手等應援動畫依歌曲 BPM 同步，並修正歌詞圖示的動畫相位。
- 加入日文歌詞的假名 ruby、假名／羅馬字切換，以及日文與繁中歌詞的顯示切換。
- 加入卡拉 OK 逐字進度、可關閉逐字高亮的開關、開源計時歌詞來源與羅馬字模式同步修正。
- 將專案改為 Vite 靜態 PWA，拆分資料、樣式、圖示、儲存與延後載入模組，並建立 GitHub Pages 部署流程。

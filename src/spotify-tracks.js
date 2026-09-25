/*
 * Spotify 音源對照表。
 *
 * 歌詞的 time 都是以 YouTube 影片為準；Spotify 播的是錄音室音軌，
 * 前奏長度與 MV 不同，所以每首歌需要一個固定偏移：
 *
 *   影片秒數 = Spotify 秒數 + offset
 *
 * offset 取自開源逐字歌詞與本站歌詞錨點逐句比對的中位數（同一首歌內
 * 各句的偏移幾乎一致，因此一個常數就夠）。若實際聽起來整首歌詞偏早或
 * 偏晚，只要調整這裡的 offset。
 */
export const SPOTIFY_TRACKS = {
  "Tokimeki":               { id: "3e0Td8QexmD5l3DJzXbbcC", offset: 0.24 },
  "KaijuNoHanauta":         { id: "3gQ19Wo6CbBpdHYmt2GVt0", offset: 7.84 },
  "CHAINSAWBLOOD":          { id: "3lUOzabhWYyRImRszpJGOU", offset: 4.05 },
  "KoikazeniNosete":        { id: "70Lmnyu93ANAXSteY6hVHH", offset: 15.84 },
  "Odoriko":                { id: "1uK4zAdMcBRyinAOArUA5X", offset: 6.31 },
  "HadakaNoYusha":          { id: "3k64vNcgYPkETG7TNgpW4o", offset: -0.32 },
  "Fukakouryoku":           { id: "7lewMvWGv9HwIKV5Bwg1DF", offset: -0.79 },
  "Reunion":                { id: "7c1icp8E7aYG90vA3wo3Se", offset: 21.11 },
  "hanaurana":              { id: "3MSqycwh9ypAp45GaqudLo", offset: 0.31 },
  "Yobigoe":                { id: "3kQf453SpkwX7ALdgzNSNY", offset: -0.14 },
  "Tomoshibi":              { id: "6pesahYhSeEyAge39V1uXS", offset: 0.22 },
  "HowdoIknow'":            { id: "6l9uVfPEhdfE50mTPgnE0W", offset: 0.08 },
  "Shiwaawase'":            { id: "7ytwCwjXrrgXmpC9Leaw7n", offset: 22.83 },
  "Homunculus":             { id: "3CmVQtVx9KlzOuPhRJRShH", offset: 2.31 },
  "soramimi":               { id: "2aiz5P2yx5zOc5YBN2h3MM", offset: -0.20 },
  "TokyoFlash":             { id: "6Dwv4HI2oLXiyqDDiV8MKT", offset: -0.20 },
  "NakiJizo":               { id: "7iMmJciZihn8wrKGabtTLU", offset: -0.31 },
  "napori":                 { id: "5Ax1dr8UvllkM8wyLhmc2r", offset: -0.21 },
  "Backlight":              { id: "3LZwKI90sFbwjJMMSfyPp7", offset: -0.07 },
  "NEOJAPAN":               { id: "4PQJs2U6R1xhXLxyjmf4gj", offset: -0.26 },
  "ZuttoLoveSong":          { id: "4EPtKIHOPNYmvnO7sCWGxk", offset: 0.08 },
  "Iseijin'":               { id: "3g1Ca8PPhR4FBN6a66wkyq", offset: 1.70 },
  "ZERO":                   { id: "1zszoj2ksG8F5rDy63RwY2", offset: 1.70 },
  "SonnaBitternaHanashi)":  { id: "2rKtVgSIlMM6SgMVcJk9mb", offset: 6.69 },
  "Fujin":                  { id: "00GDUNeJd97qjKp2yrx0OC", offset: 8.37 },
  "Jonetsu":                { id: "5h3ynZiK27wTtQt0uXId75", offset: -0.20 },
  "Kagero":                 { id: "5BKwzntuwwe6V5oapO6eJ4", offset: -0.05 },
  "IdeagaAfureteNemurenai": { id: "4nsrIXDihSYr8eb56j015A", offset: 9.34 },
  "flyaway":                { id: "2NFgZXeRjcqV91SaBIZ3cI", offset: -0.18 },
  "mabuta":                 { id: "2TUKLEXyjtKOmTjJupAexh", offset: -0.10 },
  "Hitomibore":             { id: "4O9l19x7oblC20MIqdS6L8", offset: 0.26 },
  "SekainoHimitsu":         { id: "7nKmyOBjlCQ5Y3UxRGMEzE", offset: 13.64 },
  "Wasuremono":             { id: "6y3ZWLQTlgRUqqNKBt3WgO", offset: 1.67 },
  "Timeparadox":            { id: "3jNwPOqdPvQIr5dRT0hzgY", offset: 0.41 },
  "TodomenoIchigeki":       { id: "7AObB1OaxymMYQ2pTmFV0f", offset: 4.79 },
  " Kimagure":              { id: "5q97nS5adbpZe3HFvc4zy8", offset: -0.21 }
};

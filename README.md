# Checkers Game - Player vs CPU

Game checkers (dama) sederhana yang menggunakan algoritma Minimax untuk AI CPU.

## Fitur

- **Player vs CPU**: Bermain melawan komputer yang menggunakan algoritma Minimax
- **3 Tingkat Kesulitan**:
  - Mudah (depth 2)
  - Sedang (depth 4)
  - Sulit (depth 6)
- **Aturan Lengkap Checkers**:
  - Bidak normal hanya bisa bergerak maju diagonal
  - Bidak Raja (King) bisa bergerak ke semua arah diagonal
  - Wajib mengambil bidak lawan jika memungkinkan
  - **Multi-Jump**: Jika setelah makan bidak masih bisa makan lagi, harus melanjutkan
  - Bidak menjadi Raja saat mencapai baris terakhir
- **UI Modern**: Desain responsif dengan animasi smooth
- **Indikator Visual**: Notifikasi khusus saat harus melanjutkan makan bidak

## Cara Menggunakan

1. Buka file `index.html` di browser
2. Klik bidak merah (player) untuk memilih
3. Klik kotak hijau yang muncul untuk bergerak
4. **Multi-Jump**: Jika Anda makan bidak dan bisa makan lagi, bidak akan tetap terpilih dan muncul notifikasi "Lanjutkan Makan!"
5. Anda HARUS melanjutkan makan sampai tidak ada lagi bidak yang bisa dimakan
6. CPU akan otomatis bergerak setelah giliran player (termasuk multi-jump dengan animasi)
7. Game berakhir ketika salah satu pemain tidak bisa bergerak lagi

## Algoritma Minimax

Algoritma Minimax diimplementasikan dalam file `minimax.js` dengan fitur:

- **Pure Minimax Algorithm**: Algoritma minimax native tanpa optimasi pruning
- **Depth Search**: Kedalaman pencarian bisa diatur (2, 4, atau 6 level)
- **Exhaustive Search**: Mengevaluasi semua kemungkinan gerakan hingga kedalaman yang ditentukan
- **Heuristic Evaluation**:
  - Bidak normal: 3 poin
  - Bidak Raja: 5 poin
  - Bonus posisi: Bidak yang lebih dekat ke sisi lawan mendapat nilai lebih tinggi
- **Multi-Jump Intelligence**: CPU mengevaluasi semua kemungkinan urutan multi-jump dan memilih yang terbaik

### Perbedaan dengan Alpha-Beta Pruning:

Versi ini menggunakan **pure minimax** yang mengevaluasi **semua node** dalam pohon keputusan, tanpa memangkas cabang-cabang yang tidak perlu. Ini membuat algoritma lebih mudah dipahami untuk keperluan pembelajaran, meskipun memerlukan waktu komputasi lebih banyak.

## Struktur File

- `index.html` - Struktur HTML utama
- `style.css` - Styling dan desain UI (termasuk animasi multi-jump)
- `game.js` - Logika game utama, rendering, kontrol, dan multi-jump
- `minimax.js` - Implementasi algoritma Minimax untuk AI

## Teknologi

- HTML5
- CSS3 (dengan Grid Layout dan Animasi)
- Vanilla JavaScript (ES6+ dengan async/await untuk animasi multi-jump)
- Pure Minimax Algorithm (tanpa Alpha-Beta Pruning)

## Fitur Multi-Jump

- Saat Anda atau CPU melakukan jump dan masih ada jump lain yang tersedia, game akan:
  - Mempertahankan bidak terpilih
  - Menampilkan notifikasi "Lanjutkan Makan!" dengan animasi pulse
  - Mengharuskan pemain melanjutkan jump
  - Mencegah pemilihan bidak lain sampai jump selesai
- CPU akan melakukan semua jump dalam satu giliran dengan delay visual antar jump (400ms)
- CPU mengevaluasi setiap pilihan jump untuk memilih urutan terbaik

## Screenshot

Game board 8x8 dengan bidak merah (player) dan hitam (CPU). Bidak yang menjadi Raja ditandai dengan simbol mahkota (♔).


## Setup Telegram Bot

### 1. Buat Bot
- Chat ke @BotFather di Telegram
- Ketik `/newbot`
- Ikuti instruksi, simpan **Bot Token**

### 2. Dapat Chat ID Lo
- Start bot lo
- Buka: `https://api.telegram.org/bot<TOKEN>/getUpdates`
- Cari `"chat":{"id": ANGKA_INI}` — itu chat ID lo

### 3. Isi settings.js
```js
telegram: {
  botToken: "1234567890:ABCdef...",
  ownerChatId: "123456789",
  webhookSecret: "buat-string-random-bebas",
  notifyOnNewRequest: true,
  notifyOnNewCode: true,
  notifyOnNewUser: true,
},
```

### 4. Set Webhook (setelah deploy ke Vercel)
Buka URL ini di browser (ganti bagian yang perlu):
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://nimzz-code.vercel.app/api/telegram&secret_token=<WEBHOOK_SECRET>
```

### 5. Test
Kirim `/start` ke bot lo → harus muncul menu.

---

### Command Bot Lengkap

| Command | Fungsi |
|---------|--------|
| `/stats` | Statistik platform |
| `/users` | 10 user terbaru |
| `/codes` | 10 code terbaru |
| `/requests` | 10 request terbaru |
| `/addadmin [username]` | Jadikan user admin |
| `/removeadmin [username]` | Hapus role admin |
| `/banuser [username]` | Hapus user dari platform |
| `/userinfo [username]` | Info detail user |
| `/deletecode [slug]` | Hapus code |
| `/codeinfo [slug]` | Info detail code |
| `/setstatus [id] [status]` | Ubah status request |
| `/addkategori [nama]` | Tambah kategori |
| `/delkategori [nama]` | Hapus kategori |
| `/broadcast [pesan]` | Broadcast ke user |
| `⚙️ Settings` | Toggle maintenance & registrasi |

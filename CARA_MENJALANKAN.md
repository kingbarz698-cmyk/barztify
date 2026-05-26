# 🎵 Barztify — Panduan Lengkap Menjalankan di Localhost

---

## ❗ PENYEBAB ERROR 404 (Login/Register Gagal)

Error `POST http://localhost:8080/barztify/backend/api/v1/auth/login 404`
terjadi karena salah satu dari ini:

1. **Folder di htdocs belum benar** → ikuti Langkah 1
2. **mod_rewrite Apache belum aktif** → ikuti Fix Apache
3. **Database belum di-import** → ikuti Langkah 2

---

## 🚀 Langkah 1 — Letakkan Backend di XAMPP htdocs

### Struktur folder yang BENAR di htdocs:

```
C:\xampp\htdocs\
└── barztify\              ← nama folder ini WAJIB "barztify"
    ├── backend\
    │   ├── index.php      ← file ini wajib ada
    │   ├── .env
    │   ├── .htaccess
    │   ├── composer.json
    │   ├── app\
    │   └── database\
    └── (folder lain tidak perlu di htdocs)
```

### Cara copy yang benar:

**Dari ZIP ini**, extract dan copy **hanya folder `backend`** ke htdocs:

```
Salin:  [extracted]\barztify_v2\backend\
Ke:     C:\xampp\htdocs\barztify\backend\
```

Jadi hasilnya:
```
C:\xampp\htdocs\barztify\backend\index.php  ✅
```

> ⚠️ Jangan taruh seluruh folder `barztify_v2` di htdocs — hanya `backend` saja.

---

## 🚀 Langkah 2 — Aktifkan mod_rewrite Apache (WAJIB)

1. Buka **XAMPP Control Panel**
2. Klik **Config** → pilih **httpd.conf**
3. Cari baris: `#LoadModule rewrite_module modules/mod_rewrite.so`
4. Hapus tanda `#` di depannya → jadi: `LoadModule rewrite_module modules/mod_rewrite.so`
5. Cari juga: `AllowOverride None` → ganti ke `AllowOverride All`
6. **Restart Apache** di XAMPP Control Panel

---

## 🚀 Langkah 3 — Import Database

1. XAMPP → Start **Apache** + **MySQL**
2. Buka: `http://localhost/phpmyadmin`
3. Klik **New** → nama database: `barztify` → klik **Create**
4. Klik database `barztify` → tab **Import**
5. Upload file: `barztify_v2\backend\database\schema.sql`
6. Klik **Go**

**Demo account yang sudah dibuat otomatis:**
```
Email:    jacob@barztify.com
Password: barztify123
```

---

## 🚀 Langkah 4 — Edit backend/.env

Buka file: `C:\xampp\htdocs\barztify\backend\.env`

Edit sesuai kebutuhan:

```env
APP_ENV=development
APP_URL=http://192.168.1.5:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=barztify
DB_USER=root
DB_PASS=

ALLOWED_ORIGIN=http://192.168.1.5:5173,http://localhost:5173
```

> Jika MySQL pakai password, isi `DB_PASS=passwordkamu`

**Test backend berhasil:** Buka browser → `http://localhost:8080/barztify/backend/api`
Harus muncul: `{"data":{"name":"Barztify","version":"2.0.0","status":"running"},...}`

---

## 🚀 Langkah 5 — Jalankan Music API (Python)

Buka **Command Prompt** baru:

```cmd
cd [lokasi extract]\barztify_v2\music_api
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 7979 --reload
```

Atau klik file: `START_MUSIC_API_WINDOWS.bat`

**Test:** Buka `http://localhost:7979/health` → harus muncul `{"status":"ok",...}`

---

## 🚀 Langkah 6 — Jalankan Frontend React

Buka **Command Prompt** baru (di folder `barztify_v2`):

```cmd
cd [lokasi extract]\barztify_v2
npm install
npm run dev
```

Atau klik file: `START_FRONTEND_WINDOWS.bat`

**Buka browser:** `http://192.168.1.5:5173`

---

## 📋 Ringkasan Port

| Service | URL |
|---------|-----|
| Frontend React | http://192.168.1.5:5173 |
| PHP Backend | http://localhost:8080/barztify/backend/api |
| Music API Python | http://localhost:7979 |

---

## ⚡ Urutan Start Setiap Sesi

```
1. XAMPP → Start Apache + MySQL
2. Klik START_MUSIC_API_WINDOWS.bat
3. Klik START_FRONTEND_WINDOWS.bat
4. Buka http://192.168.1.5:5173
```

---

## 🔑 Login Demo

```
Email:    jacob@barztify.com
Password: barztify123
```

---

## ❌ Troubleshooting

### 404 saat login/register
→ Cek apakah `http://localhost:8080/barztify/backend/api` bisa diakses
→ Pastikan mod_rewrite aktif (Langkah 2)
→ Pastikan struktur folder benar (Langkah 1)

### "Access denied for user 'root'"
→ Isi `DB_PASS` di `backend/.env` dengan password MySQL kamu

### npm install error
```cmd
npm install --legacy-peer-deps
```

### pip install error
```cmd
pip install -r requirements.txt --break-system-packages
```

### Port 8080 sudah dipakai
→ XAMPP Control Panel → Apache → Config → httpd.conf
→ Cari `Listen 80` → ganti `Listen 8080`
→ Restart Apache

### Music API tidak jalan
→ Pastikan Python 3.10+: `python --version`
→ Pastikan yt-dlp: `pip install yt-dlp`

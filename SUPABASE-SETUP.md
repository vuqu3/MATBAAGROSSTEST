# Supabase Kurulum Adımları

## ✅ Tamamlanan Adımlar

1. `.env` dosyası Supabase bağlantısıyla güncellendi
2. NextAuth.js yapılandırması eklendi

## ⚠️ ÖNEMLİ: Şifre Değiştirme

`.env` dosyasındaki `DATABASE_URL` satırında `[mirandaA12345!12345]` kısmını **kendi Supabase şifrenizle** değiştirin!

**Örnek:**
```env
DATABASE_URL="postgresql://postgres:GERÇEK_ŞİFRENİZ@db.wgwxnwbpvqfjjlzfbgrz.supabase.co:5432/postgres?schema=public"
```

## Sonraki Adımlar

1. **Şifreyi Değiştirin:** `.env` dosyasını açın ve `[mirandaA12345!12345]` kısmını gerçek şifrenizle değiştirin

2. **Migration Çalıştırın:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Seed Script Çalıştırın (İlk Admin Kullanıcısı):**
   ```bash
   npm run db:seed
   ```

4. **Sunucuyu Başlatın:**
   ```bash
   npm run dev
   ```

5. **Admin Paneline Giriş:**
   - URL: `http://localhost:3000/admin/login`
   - Email: `admin@matbaagross.com`
   - Şifre: `admin123`

## Sorun Giderme

- **Bağlantı hatası alırsanız:** Şifrenin doğru olduğundan ve özel karakterlerin URL-encoded olduğundan emin olun
- **Migration hatası:** Supabase'de veritabanı bağlantısının aktif olduğundan emin olun

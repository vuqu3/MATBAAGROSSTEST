# MatbaaGross Admin Panel Kurulumu

## 1. Veritabanı Kurulumu

### PostgreSQL Kurulumu
1. PostgreSQL veritabanı oluşturun:
```sql
CREATE DATABASE matbaagross;
```

2. `.env` dosyasını oluşturun ve DATABASE_URL'i ayarlayın:
```
DATABASE_URL="postgresql://user:password@localhost:5432/matbaagross?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Prisma Migrate
```bash
# Veritabanı şemasını oluştur
npx prisma migrate dev --name init

# Seed script'i çalıştır (İlk admin kullanıcısı oluşturur)
npm run db:seed
```

## 2. İlk Admin Kullanıcısı

Seed script çalıştırıldığında otomatik olarak oluşturulur:

**Email:** admin@matbaagross.com  
**Şifre:** admin123

⚠️ **Güvenlik:** Production ortamında şifreyi mutlaka değiştirin!

### Manuel SQL ile Admin Kullanıcısı Oluşturma

```sql
-- Bcrypt hash'i oluştur (Node.js'de)
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('admin123', 10);

INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'clx1234567890',
  'admin@matbaagross.com',
  '$2a$10$...', -- bcrypt hash'i buraya
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
);
```

## 3. Admin Paneline Erişim

1. Sunucuyu başlatın: `npm run dev`
2. Tarayıcıda `http://localhost:3000/admin/login` adresine gidin
3. Admin bilgileriyle giriş yapın

## 4. Güvenlik Notları

- Middleware tüm `/admin` rotalarını korur
- Sadece `ADMIN` rolüne sahip kullanıcılar erişebilir
- JWT token ile session yönetimi yapılır
- Şifreler bcrypt ile hash'lenir

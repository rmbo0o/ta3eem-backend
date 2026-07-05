const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.seedDemoData = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (existing[0].count > 2) {
      return res.json({ message: 'Database already has data, skipping seed.' });
    }

    const hash = await bcrypt.hash('demo123456', 10);

    const stores = [
      { username: 'tech_zone', store_name: 'تك زون - للإلكترونيات', email: 'tech@demo.com', password: hash, city: 'الرياض', store_type: 'إلكترونيات', bio: 'متجر متخصص في أحدث الأجهزة الإلكترونية والهواتف', featured: 1 },
      { username: 'fashion_house', store_name: 'دار الموضة', email: 'fashion@demo.com', password: hash, city: 'جدة', store_type: 'موضة', bio: 'أحدث صيحات الموضة والعناية بالملابس', featured: 1 },
      { username: 'beauty_garden', store_name: 'حديقة الجمال', email: 'beauty@demo.com', password: hash, city: 'الرياض', store_type: 'الجمال والعناية', bio: 'منتجات عناية بالبشرة والشعر الأصلية', featured: 1 },
      { username: 'home_plus', store_name: 'هوم بلس', email: 'home@demo.com', password: hash, city: 'الدمام', store_type: 'المنزل والمطبخ', bio: 'أثاث منزلي وأدوات مطبخ عصرية', featured: 0 },
      { username: 'sport_fit', store_name: 'سبورت آند فت', email: 'sport@demo.com', password: hash, city: 'الخبر', store_type: 'الرياضة', bio: 'معدات رياضية وملابس تدريب', featured: 0 },
    ];

    const storeIds = [];
    for (const s of stores) {
      const [result] = await pool.query(
        'INSERT INTO users (username, store_name, email, password, city, store_type, bio, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [s.username, s.store_name, s.email, s.password, s.city, s.store_type, s.bio, s.featured]
      );
      storeIds.push(result.insertId);
    }

    const [catRows] = await pool.query('SELECT id FROM store_categories LIMIT 14');
    const catIds = catRows.map(r => r.id);

    const products = [];
    const productNames = {
      'إلكترونيات': ['آيفون 15 برو', 'سامسونج جالاكسي S24', 'لابتوب HP', 'سماعات لاسلكية', 'ساعة ذكية', 'شاحن متنقل', 'تابلت', 'كاميرا رقمية'],
      'موضة': ['فستان سهرة', 'حذاء رياضي', 'شنطة يدوية', 'نظارة شمسية', 'ساعة أنيقة', 'عطر فرنسي', 'محفظة جلدية', 'ربطة عنق'],
      'الجمال والعناية': ['كريم ترطيب الوجه', 'زيت الأرغان', 'ماسك للشعر', 'عطر زهري', 'طلاء أظافر', 'مجموعة عناية كاملة', 'صابون طبيعي', 'مقشر للجسم'],
      'الرياضة': ['دمبلز 10 كجم', 'حقيبة ظهر رياضية', 'قميص رياضي', 'حذاء جري', 'سجادة يوجا', 'مقاومة مطاطية', 'قارورة ماء رياضية', 'ساعة رياضية'],
    };

    for (let i = 0; i < storeIds.length; i++) {
      const sid = storeIds[i];
      const type = stores[i].store_type;
      const names = productNames[type] || ['منتج 1', 'منتج 2', 'منتج 3'];
      for (const name of names) {
        const catId = catIds.length > 0 ? catIds[Math.floor(Math.random() * catIds.length)] : null;
        products.push([sid, name, `وصف مميز للمنتج ${name}`, (Math.random() * 500 + 20).toFixed(2), Math.floor(Math.random() * 50 + 5), catId]);
      }
    }

    for (const p of products) {
      await pool.query(
        'INSERT INTO products (store_id, name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        p
      );
    }

    res.json({
      message: '✅ Demo data seeded successfully',
      stores: stores.length,
      products: products.length
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: 'Seed failed', error: err.message });
  }
};

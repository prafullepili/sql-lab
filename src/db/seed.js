export function seedDatabase(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, joined_on TEXT);
    CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER);
    CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, total REAL, status TEXT);
    CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, unit_price REAL);
    CREATE TABLE IF NOT EXISTS web_events (event_id INTEGER PRIMARY KEY, user_id INTEGER, event_type TEXT, event_date TEXT, region TEXT, amount REAL);
    INSERT OR IGNORE INTO customers VALUES (1,'Ava Chen','ava@example.com','Portland','2023-02-12'),(2,'Noah Patel','noah@example.com','Austin','2023-04-08'),(3,'Mia Brooks','mia@example.com','Portland','2023-05-19'),(4,'Leo Kim','leo@example.com','Chicago','2023-08-03'),(5,'Zoe Rivera','zoe@example.com','Austin','2024-01-15'),(6,'Eli Morgan','eli@example.com','Denver','2024-03-22');
    INSERT OR IGNORE INTO products VALUES (1,'Everyday Tote','Accessories',28,42),(2,'Field Journal','Stationery',16.5,75),(3,'Ceramic Mug','Home',24,18),(4,'Desk Lamp','Home',68,9),(5,'Canvas Pouch','Accessories',19,0),(6,'SQL for Humans','Books',34,26);
    INSERT OR IGNORE INTO orders VALUES (1,1,'2024-01-06',44.5,'shipped'),(2,2,'2024-01-14',68,'shipped'),(3,1,'2024-02-02',92,'delivered'),(4,3,'2024-02-19',34,'delivered'),(5,4,'2024-03-05',84,'processing'),(6,5,'2024-03-21',59,'shipped');
    INSERT OR IGNORE INTO order_items VALUES (1,1,1,1,28),(2,1,2,1,16.5),(3,2,4,1,68),(4,3,3,2,24),(5,3,2,2,16.5),(6,4,6,1,34),(7,5,4,1,68),(8,5,2,1,16),(9,6,1,1,28),(10,6,6,1,31);
  `);

  const count = db.exec('SELECT COUNT(*) FROM web_events')[0].values[0][0];
  if (count === 0) {
    const insert = db.prepare('INSERT INTO web_events (event_id, user_id, event_type, event_date, region, amount) VALUES (?, ?, ?, ?, ?, ?)');
    const events = ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    for (let i = 1; i <= 1000; i += 1) {
      const day = String(((i * 7) % 28) + 1).padStart(2, '0');
      const month = String(((i * 3) % 12) + 1).padStart(2, '0');
      const event = events[(i * 13) % events.length];
      insert.run([i, ((i * 37) % 250) + 1, event, `2025-${month}-${day}`, regions[(i * 11) % regions.length], event === 'purchase' ? ((i * 17) % 19000 + 500) / 100 : 0]);
    }
    insert.free();
  }
}

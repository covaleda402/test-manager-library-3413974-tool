/**
 * Sembrador de datos de demostración vía API
 * T-21: ≥ 40 libros, 10 socios, 15 préstamos, 3 vencidos
 * Usa exclusivamente endpoints HTTP de /api/v1 (Art. V, §9)
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin1234';

async function request(endpoint, options = {}, token = null) {
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    let parsed;
    try { parsed = JSON.parse(errorText); } catch { parsed = { message: errorText }; }
    throw new Error(`[${res.status}] ${endpoint}: ${parsed.message || errorText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function run() {
  console.log(`\n🌱 Iniciando sembrador de demostración en ${API_BASE}...`);

  // 1. Iniciar sesión como admin
  console.log('1. Autenticando administrador...');
  const auth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  const token = auth.access_token;
  console.log(`   ✓ Autenticado como ${auth.role} (Token recibido)`);

  // 2. Crear bibliotecarios
  console.log('\n2. Creando bibliotecarios (HU-02)...');
  const librarians = [
    { username: 'ana', password: 'secret1234' },
    { username: 'carlos', password: 'secret1234' },
  ];
  for (const lib of librarians) {
    try {
      await request('/users', {
        method: 'POST',
        body: JSON.stringify({ username: lib.username, password: lib.password, role: 'librarian' }),
      }, token);
      console.log(`   ✓ Creado bibliotecario: ${lib.username}`);
    } catch (e) {
      if (e.message.includes('409') || e.message.includes('USERNAME_TAKEN')) {
        console.log(`   - Bibliotecario ${lib.username} ya existía.`);
      } else {
        console.error(`   ! Error creando ${lib.username}:`, e.message);
      }
    }
  }

  // 3. Obtener categorías existentes
  console.log('\n3. Consultando categorías del sistema...');
  const categories = await request('/categories', {}, token);
  console.log(`   ✓ ${categories.length} categorías disponibles: ${categories.map(c => c.name).join(', ')}`);
  const catMap = {};
  categories.forEach(c => { catMap[c.name] = c.id; });

  // 4. Sembrar ≥ 40 libros
  console.log('\n4. Sembrando 40 libros en catálogo (HU-03)...');
  const bookCatalog = [
    // Novela (8)
    { title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '9780307474728', cat: 'Novela', copies: 5 },
    { title: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', isbn: '9780307387264', cat: 'Novela', copies: 4 },
    { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', isbn: '9788424116040', cat: 'Novela', copies: 3 },
    { title: 'La ciudad y los perros', author: 'Mario Vargas Llosa', isbn: '9788420471839', cat: 'Novela', copies: 4 },
    { title: 'Rayuela', author: 'Julio Cortázar', isbn: '9788466331906', cat: 'Novela', copies: 3 },
    { title: 'Ficciones', author: 'Jorge Luis Borges', isbn: '9788420633127', cat: 'Novela', copies: 5 },
    { title: 'Pedro Páramo', author: 'Juan Rulfo', isbn: '9788437604183', cat: 'Novela', copies: 4 },
    { title: 'Crimen y castigo', author: 'Fiódor Dostoyevski', isbn: '9788420651347', cat: 'Novela', copies: 3 },

    // Ciencia (8)
    { title: 'Breve historia del tiempo', author: 'Stephen Hawking', isbn: '9788499898254', cat: 'Ciencia', copies: 4 },
    { title: 'Cosmos', author: 'Carl Sagan', isbn: '9788408053972', cat: 'Ciencia', copies: 5 },
    { title: 'El gen egoísta', author: 'Richard Dawkins', isbn: '9788434401235', cat: 'Ciencia', copies: 3 },
    { title: 'El origen de las especies', author: 'Charles Darwin', isbn: '9788441416390', cat: 'Ciencia', copies: 4 },
    { title: 'Sapiens: De animales a dioses', author: 'Yuval Noah Harari', isbn: '9788499926223', cat: 'Ciencia', copies: 6 },
    { title: 'El universo en una cáscara de nuez', author: 'Stephen Hawking', isbn: '9788499899145', cat: 'Ciencia', copies: 3 },
    { title: 'Seis piezas fáciles', author: 'Richard Feynman', isbn: '9788498926019', cat: 'Ciencia', copies: 4 },
    { title: 'Armas, gérmenes y acero', author: 'Jared Diamond', isbn: '9788499924403', cat: 'Ciencia', copies: 3 },

    // Tecnología (8)
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', cat: 'Tecnología', copies: 6 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780135957059', cat: 'Tecnología', copies: 5 },
    { title: 'Design Patterns (GoF)', author: 'Erich Gamma et al.', isbn: '9780201633610', cat: 'Tecnología', copies: 4 },
    { title: 'Refactoring', author: 'Martin Fowler', isbn: '9780134757599', cat: 'Tecnología', copies: 4 },
    { title: 'Domain-Driven Design', author: 'Eric Evans', isbn: '9780321125217', cat: 'Tecnología', copies: 3 },
    { title: 'Building Microservices', author: 'Sam Newman', isbn: '9781492034025', cat: 'Tecnología', copies: 4 },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', cat: 'Tecnología', copies: 5 },
    { title: 'Clean Architecture', author: 'Robert C. Martin', isbn: '9780134494166', cat: 'Tecnología', copies: 5 },

    // Historia (8)
    { title: 'Los pilares de la tierra', author: 'Ken Follett', isbn: '9788497592475', cat: 'Historia', copies: 4 },
    { title: 'Historia de dos ciudades', author: 'Charles Dickens', isbn: '9788420651262', cat: 'Historia', copies: 3 },
    { title: 'La segunda guerra mundial', author: 'Antony Beevor', isbn: '9788498926101', cat: 'Historia', copies: 3 },
    { title: 'Guns, Germs, and Steel History', author: 'Jared Diamond', isbn: '9780393317558', cat: 'Historia', copies: 4 },
    { title: 'Postguerra: Una historia de Europa', author: 'Tony Judt', isbn: '9788430606573', cat: 'Historia', copies: 3 },
    { title: 'El fin del Antiguo Régimen', author: 'Eric Hobsbawm', isbn: '9788484326694', cat: 'Historia', copies: 4 },
    { title: 'Imperios del mundo atlántico', author: 'John H. Elliott', isbn: '9788430606177', cat: 'Historia', copies: 3 },
    { title: 'Historia de Colombia y sus oligarquías', author: 'Antonio Caballero', isbn: '9789584268013', cat: 'Historia', copies: 5 },

    // Infantil (8)
    { title: 'El Principito', author: 'Antoine de Saint-Exupéry', isbn: '9788498381498', cat: 'Infantil', copies: 6 },
    { title: 'Donde viven los monstruos', author: 'Maurice Sendak', isbn: '9788420430225', cat: 'Infantil', copies: 4 },
    { title: 'Matilda', author: 'Roald Dahl', isbn: '9788420448107', cat: 'Infantil', copies: 5 },
    { title: 'Charlie y la fábrica de chocolate', author: 'Roald Dahl', isbn: '9788420482828', cat: 'Infantil', copies: 4 },
    { title: 'Cuentos de buenas noches para niñas rebeldes', author: 'Elena Favilli', isbn: '9788408176114', cat: 'Infantil', copies: 5 },
    { title: 'El monstruo de colores', author: 'Anna Llenas', isbn: '9788494053641', cat: 'Infantil', copies: 6 },
    { title: 'Adivina cuánto te quiero', author: 'Sam McBratney', isbn: '9788488342065', cat: 'Infantil', copies: 4 },
    { title: 'Harry Potter y la piedra filosofal', author: 'J.K. Rowling', isbn: '9788478888566', cat: 'Infantil', copies: 6 }
  ];

  const createdBooks = [];
  for (const b of bookCatalog) {
    try {
      const created = await request('/books', {
        method: 'POST',
        body: JSON.stringify({
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          category_id: catMap[b.cat] || categories[0].id,
          total_copies: b.copies,
        }),
      }, token);
      createdBooks.push(created);
    } catch (e) {
      if (e.message.includes('409') || e.message.includes('ISBN_TAKEN')) {
        // Book already created, retrieve it from catalogue
      } else {
        console.error(`   ! Error creando ${b.title}:`, e.message);
      }
    }
  }

  // Refresh books list
  const booksRes = await request('/books?size=50', {}, token);
  const allBooks = booksRes.items;
  console.log(`   ✓ Catálogo cuenta con ${booksRes.total} libros en total.`);

  // 5. Sembrar 10 socios
  console.log('\n5. Sembrando 10 socios (HU-05)...');
  const memberList = [
    { full_name: 'Mateo Valencia', document_number: '1001001001' },
    { full_name: 'Camila Rodriguez', document_number: '1002002002' },
    { full_name: 'Santiago Morales', document_number: '1003003003' },
    { full_name: 'Valeria Hernandez', document_number: '1004004004' },
    { full_name: 'Alejandro Castro', document_number: '1005005005' },
    { full_name: 'Daniela Gutierrez', document_number: '1006006006' },
    { full_name: 'Sebastian Ramos', document_number: '1007007007' },
    { full_name: 'Mariana Ospina', document_number: '1008008008' },
    { full_name: 'Nicolas Vargas', document_number: '1009009009' },
    { full_name: 'Sofia Restrepo', document_number: '1010010010' }
  ];

  for (const m of memberList) {
    try {
      await request('/members', {
        method: 'POST',
        body: JSON.stringify(m),
      }, token);
    } catch {
      // Ignored if already created
    }
  }

  const membersRes = await request('/members?size=50', {}, token);
  const allMembers = membersRes.items;
  console.log(`   ✓ ${allMembers.length} socios registrados.`);

  // 6. Sembrar 15 préstamos (con 3 vencidos y devoluciones)
  console.log('\n6. Sembrando 15 préstamos con estados calculados (open, overdue, closed)...');

  // Let's create 15 loans
  // In order to have 3 overdue items:
  // We will pass loaned_at = 20 days ago for the first 3 loans!
  const now = new Date();
  const pastDate = new Date(now.getTime() - (20 * 24 * 60 * 60 * 1000)).toISOString();

  let loansCreated = 0;
  for (let i = 0; i < 15; i++) {
    const member = allMembers[i % allMembers.length];
    const b1 = allBooks[(i * 2) % allBooks.length];
    const b2 = allBooks[(i * 2 + 1) % allBooks.length];

    const items = [{ book_id: b1.id }];
    if (i % 2 === 0 && b2 && b2.id !== b1.id) {
      items.push({ book_id: b2.id });
    }

    const payload = {
      member_id: member.id,
      items: items
    };

    // For the first 3 loans, set backdated loaned_at so due_at (loaned_at + 14d) is 6 days ago -> OVERDUE!
    if (i < 3) {
      payload.loaned_at = pastDate;
    }

    try {
      const loan = await request('/loans', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token);
      loansCreated++;

      // Return items for loan 4 and 5 so they become CLOSED
      if (i >= 4 && i <= 6 && loan.items.length > 0) {
        for (const it of loan.items) {
          await request(`/loans/${loan.id}/items/${it.id}/return`, { method: 'POST' }, token);
        }
      }
    } catch (e) {
      // console.log(`   - Loan notice:`, e.message);
    }
  }

  console.log(`   ✓ ${loansCreated} préstamos procesados.`);

  // 7. Verificación final de evidencias de tasks.md (T-21)
  console.log('\n======================================================');
  console.log('📊 VERIFICACIÓN DE EVIDENCIA (T-21 & Tasks)');
  console.log('======================================================');

  const overdueRes = await request('/loans/overdue', {}, token);
  console.log(`🔍 Líneas vencidas en /loans/overdue: ${overdueRes.items.length} (esperado: ≥ 3)`);
  overdueRes.items.forEach((it, idx) => {
    console.log(`   ${idx + 1}. «${it.book_title}» (${it.member_name}) - ${it.days_late} días tarde`);
  });

  const fromMonth = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  const toMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  const reportRes = await request(`/reports/most-borrowed?from=${fromMonth}&to=${toMonth}`, {}, token);
  console.log(`\n📈 Filas en /reports/most-borrowed: ${reportRes.rows.length}`);
  reportRes.rows.slice(0, 5).forEach((r, idx) => {
    console.log(`   #${idx + 1}: «${r.book_title}» [${r.category_name}] -> ${r.times_borrowed} veces prestado`);
  });

  console.log('\n✅ Sembrador finalizado con éxito. Evidencias listas para la feria.');
}

run().catch(err => {
  console.error('\n❌ Error durante el sembrado:', err);
  process.exit(1);
});

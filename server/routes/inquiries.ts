import { Router } from 'express';
import db from '../db.ts';
import { requireAuth } from '../middleware/requireAuth.ts';

const router = Router();

interface InquiryRow {
  id: number;
  catering_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  special_requests: string;
  event_date: string | null;
  event_time: string | null;
  headcount: number;
  company_name: string | null;
  event_description: string | null;
  meal_type: string | null;
  bar_option: string | null;
  preferred_pickup_date: string | null;
  preferred_pickup_time: string | null;
  selected_dishes: string;
  staff_notes: string;
  estimate_low: number | null;
  estimate_high: number | null;
  submitted_at: string;
}

function rowToInquiry(row: InquiryRow) {
  return {
    ...row,
    selectedDishes: JSON.parse(row.selected_dishes),
  };
}

// Stats — must be before /:id to avoid matching "stats" as id
router.get('/stats', requireAuth, (_req, res) => {
  const rows = db.prepare(`
    SELECT status, COUNT(*) as count FROM inquiries GROUP BY status
  `).all() as { status: string; count: number }[];

  const stats: Record<string, number> = { new: 0, reviewed: 0, confirmed: 0, completed: 0, cancelled: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
  }
  res.json(stats);
});

// Public: create inquiry
router.post('/', async (req, res) => {
  const { cateringType, contactData, buyoutData, togoData, estimateLow, estimateHigh } = req.body;

  if (!cateringType || !contactData) {
    res.status(400).json({ error: 'cateringType and contactData are required' });
    return;
  }

  const isBuyout = cateringType === 'buyout';
  const headcount = isBuyout ? buyoutData?.headcount : togoData?.headcount;
  const selectedDishes = isBuyout ? (buyoutData?.selectedDishes || []) : (togoData?.selectedDishes || []);

  const result = db.prepare(`
    INSERT INTO inquiries (
      catering_type, first_name, last_name, email, phone, special_requests,
      event_date, event_time, headcount, company_name, event_description,
      meal_type, bar_option, preferred_pickup_date, preferred_pickup_time,
      selected_dishes, estimate_low, estimate_high
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    cateringType,
    contactData.firstName, contactData.lastName, contactData.email, contactData.phone,
    contactData.specialRequests || '',
    isBuyout ? buyoutData?.eventDate : null,
    isBuyout ? buyoutData?.eventTime : null,
    headcount || 0,
    isBuyout ? buyoutData?.companyName : null,
    isBuyout ? buyoutData?.eventDescription : null,
    isBuyout ? buyoutData?.mealType : null,
    isBuyout ? buyoutData?.barOption : null,
    !isBuyout ? togoData?.preferredPickupDate : null,
    !isBuyout ? togoData?.preferredPickupTime : null,
    JSON.stringify(selectedDishes),
    estimateLow ?? null,
    estimateHigh ?? null,
  );

  const inquiryId = result.lastInsertRowid;

  // Send notification email (non-blocking)
  try {
    const staffEmail = process.env.STAFF_NOTIFY_EMAIL;
    const resendKey = process.env.RESEND_API_KEY;
    if (staffEmail && resendKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);
      const adminUrl = `${req.protocol}://${req.get('host')}/admin/#/inquiries/${inquiryId}`;
      await resend.emails.send({
        from: 'Sum Bar Catering <onboarding@resend.dev>',
        to: staffEmail,
        subject: `New ${cateringType} inquiry from ${contactData.firstName} ${contactData.lastName}`,
        html: `
          <h2>New Catering Inquiry</h2>
          <p><strong>Type:</strong> ${cateringType === 'buyout' ? 'Restaurant Buyout' : 'To-Go Catering'}</p>
          <p><strong>Contact:</strong> ${contactData.firstName} ${contactData.lastName}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Headcount:</strong> ${headcount}</p>
          ${isBuyout && buyoutData?.eventDate ? `<p><strong>Event Date:</strong> ${buyoutData.eventDate}</p>` : ''}
          ${!isBuyout && togoData?.preferredPickupDate ? `<p><strong>Pickup Date:</strong> ${togoData.preferredPickupDate}</p>` : ''}
          <p><a href="${adminUrl}">View in Admin Panel</a></p>
        `,
      });
    }
  } catch (err) {
    console.error('Failed to send notification email:', err);
  }

  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(inquiryId) as InquiryRow;
  res.status(201).json(rowToInquiry(row));
});

// Auth: list inquiries with filters
router.get('/', requireAuth, (req, res) => {
  const { status, type, page = '1' } = req.query;
  const limit = 20;
  const offset = (Number(page) - 1) * limit;

  let where = 'WHERE 1=1';
  const params: unknown[] = [];

  if (status && status !== 'all') {
    where += ' AND status = ?';
    params.push(status);
  }
  if (type && type !== 'all') {
    where += ' AND catering_type = ?';
    params.push(type);
  }

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM inquiries ${where}`).get(...params) as { count: number };
  params.push(limit, offset);
  const rows = db.prepare(`SELECT * FROM inquiries ${where} ORDER BY submitted_at DESC LIMIT ? OFFSET ?`).all(...params) as InquiryRow[];

  res.json({
    inquiries: rows.map(rowToInquiry),
    total: countRow.count,
    page: Number(page),
    totalPages: Math.ceil(countRow.count / limit),
  });
});

// Auth: get single inquiry
router.get('/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id) as InquiryRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Inquiry not found' });
    return;
  }
  res.json(rowToInquiry(row));
});

// Auth: update inquiry (status, staff_notes)
router.patch('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as InquiryRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Inquiry not found' });
    return;
  }

  const { status, staff_notes } = req.body;
  const validStatuses = ['new', 'reviewed', 'confirmed', 'completed', 'cancelled'];

  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  db.prepare(`
    UPDATE inquiries SET status = ?, staff_notes = ? WHERE id = ?
  `).run(
    status ?? existing.status,
    staff_notes ?? existing.staff_notes,
    id
  );

  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as InquiryRow;
  res.json(rowToInquiry(row));
});

export default router;

import { Router, type Request } from 'express';
import db from '../db.ts';
import { requireAuth } from '../middleware/requireAuth.ts';

const router = Router();

async function sendNotificationEmail(row: InquiryRow, req: Request) {
  const staffEmail = process.env.STAFF_NOTIFY_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  if (!staffEmail || !resendKey) return;

  const { Resend } = await import('resend');
  const resend = new Resend(resendKey);
  const adminUrl = `${req.protocol}://${req.get('host')}/admin/#/inquiries/${row.id}`;
  const cateringType = row.catering_type;
  const isGeneral = cateringType === 'general';
  const isBuyout = cateringType === 'buyout';

  await resend.emails.send({
    from: 'Sum Bar Catering <onboarding@resend.dev>',
    to: staffEmail,
    subject: `New ${isGeneral ? 'general' : cateringType} inquiry from ${row.first_name} ${row.last_name}`,
    html: `
      <h2>New ${isGeneral ? 'General' : 'Catering'} Inquiry</h2>
      <p><strong>Type:</strong> ${isBuyout ? 'Restaurant Buyout' : cateringType === 'togo' ? 'To-Go Catering' : 'General Inquiry'}</p>
      <p><strong>Contact:</strong> ${row.first_name} ${row.last_name}</p>
      <p><strong>Email:</strong> ${row.email}</p>
      ${!isGeneral ? `<p><strong>Headcount:</strong> ${row.headcount}</p>` : ''}
      ${isBuyout && row.event_date ? `<p><strong>Event Date:</strong> ${row.event_date}</p>` : ''}
      ${!isBuyout && !isGeneral && row.preferred_pickup_date ? `<p><strong>Pickup Date:</strong> ${row.preferred_pickup_date}</p>` : ''}
      ${isGeneral && row.special_requests ? `<p><strong>Message:</strong> ${row.special_requests}</p>` : ''}
      <p><a href="${adminUrl}">View in Admin Panel</a></p>
    `,
  });
}

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
  submitted: number;
  submitted_at: string;
  customer_email_sent_at: string | null;
  customer_email_status: string;
}

function rowToInquiry(row: InquiryRow) {
  return {
    ...row,
    selectedDishes: JSON.parse(row.selected_dishes),
    submitted: !!row.submitted,
  };
}

async function sendCustomerReviewEmail(row: InquiryRow) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CUSTOMER_EMAIL_FROM || 'Sum Bar Catering <onboarding@resend.dev>';
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping customer review email');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const { Resend } = await import('resend');
  const resend = new Resend(resendKey);

  const isBuyout = row.catering_type === 'buyout';
  const isGeneral = row.catering_type === 'general';
  const typeLabel = isBuyout ? 'Restaurant Buyout' : isGeneral ? 'General Inquiry' : 'To-Go Catering';

  const result = await resend.emails.send({
    from: fromEmail,
    to: row.email,
    subject: `Your ${typeLabel} inquiry is being reviewed — Sum Bar`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${row.first_name},</h2>
        <p>Thank you for your ${typeLabel.toLowerCase()} inquiry! We wanted to let you know that our team is currently reviewing your request.</p>
        ${!isGeneral && row.headcount ? `<p><strong>Party size:</strong> ${row.headcount} guests</p>` : ''}
        ${isBuyout && row.event_date ? `<p><strong>Event date:</strong> ${row.event_date}</p>` : ''}
        ${!isBuyout && !isGeneral && row.preferred_pickup_date ? `<p><strong>Pickup date:</strong> ${row.preferred_pickup_date}</p>` : ''}
        <p>We'll be in touch soon with more details. If you have any questions in the meantime, feel free to reply to this email.</p>
        <p>Best,<br/>The Sum Bar Team</p>
      </div>
    `,
  });

  if (result.error) {
    return { success: false, error: result.error.message };
  }
  return { success: true, emailId: result.data?.id };
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

// Public: create inquiry (draft or submitted)
router.post('/', async (req, res) => {
  const { cateringType, contactData, buyoutData, togoData, estimateLow, estimateHigh, submitted } = req.body;

  if (!cateringType || !contactData) {
    res.status(400).json({ error: 'cateringType and contactData are required' });
    return;
  }

  const isBuyout = cateringType === 'buyout';
  const isGeneral = cateringType === 'general';
  const headcount = isBuyout ? buyoutData?.headcount : isGeneral ? 0 : togoData?.headcount;
  const selectedDishes = isBuyout ? (buyoutData?.selectedDishes || []) : isGeneral ? [] : (togoData?.selectedDishes || []);

  const result = db.prepare(`
    INSERT INTO inquiries (
      catering_type, first_name, last_name, email, phone, special_requests,
      event_date, event_time, headcount, company_name, event_description,
      meal_type, bar_option, preferred_pickup_date, preferred_pickup_time,
      selected_dishes, estimate_low, estimate_high, submitted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    (!isBuyout && !isGeneral) ? togoData?.preferredPickupDate : null,
    (!isBuyout && !isGeneral) ? togoData?.preferredPickupTime : null,
    JSON.stringify(selectedDishes),
    estimateLow ?? null,
    estimateHigh ?? null,
    submitted ? 1 : 0,
  );

  const inquiryId = result.lastInsertRowid;
  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(inquiryId) as InquiryRow;

  // Send notification email if immediately submitted (e.g. general contact flow)
  if (submitted) {
    sendNotificationEmail(row, req).catch((err) => {
      console.error('Failed to send notification email:', err);
    });
  }

  res.status(201).json(rowToInquiry(row));
});

// Public: mark inquiry as submitted
router.post('/:id/submit', async (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as InquiryRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Inquiry not found' });
    return;
  }

  // Update estimate values if provided
  const { estimateLow, estimateHigh } = req.body || {};
  db.prepare(`
    UPDATE inquiries SET submitted = 1, estimate_low = ?, estimate_high = ? WHERE id = ?
  `).run(
    estimateLow ?? existing.estimate_low,
    estimateHigh ?? existing.estimate_high,
    id
  );

  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as InquiryRow;

  // Send notification email (non-blocking)
  sendNotificationEmail(row, req).catch((err) => {
    console.error('Failed to send notification email:', err);
  });

  res.json(rowToInquiry(row));
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

  // Send customer email when status changes to "reviewed"
  if (status === 'reviewed' && existing.status !== 'reviewed' && existing.customer_email_status === 'none') {
    sendCustomerReviewEmail(existing).then((result) => {
      if (result.success) {
        db.prepare(`
          UPDATE inquiries SET customer_email_sent_at = datetime('now'), customer_email_status = 'sent' WHERE id = ?
        `).run(id);
      } else {
        db.prepare(`
          UPDATE inquiries SET customer_email_status = 'failed' WHERE id = ?
        `).run(id);
        console.error(`Failed to send customer review email for inquiry ${id}:`, result.error);
      }
    }).catch((err) => {
      db.prepare(`
        UPDATE inquiries SET customer_email_status = 'failed' WHERE id = ?
      `).run(id);
      console.error(`Failed to send customer review email for inquiry ${id}:`, err);
    });
  }

  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as InquiryRow;
  res.json(rowToInquiry(row));
});

// Auth: resend customer review email
router.post('/:id/resend-email', requireAuth, async (req, res) => {
  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id) as InquiryRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Inquiry not found' });
    return;
  }

  const result = await sendCustomerReviewEmail(row);
  if (result.success) {
    db.prepare(`
      UPDATE inquiries SET customer_email_sent_at = datetime('now'), customer_email_status = 'sent' WHERE id = ?
    `).run(req.params.id);
    const updated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id) as InquiryRow;
    res.json(rowToInquiry(updated));
  } else {
    db.prepare(`
      UPDATE inquiries SET customer_email_status = 'failed' WHERE id = ?
    `).run(req.params.id);
    res.status(500).json({ error: 'Failed to send email', details: result.error });
  }
});

export default router;

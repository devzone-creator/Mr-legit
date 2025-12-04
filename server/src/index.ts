import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import Stripe from 'stripe'

const app = express()

app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const JWT_SECRET = process.env.JWT_SECRET
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET is not set. Auth endpoints will not work correctly.')
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null

interface JwtUser {
  id: string
  role: 'customer' | 'admin'
  email: string
}

interface AuthedRequest extends Request {
  user?: JwtUser
}

const authMiddleware = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' })

  const token = authHeader.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtUser
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

const adminOnly = (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
})

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ ok: false })
  }
})

// Seed categories (run once)
app.post('/api/admin/seed-categories', async (_req, res) => {
  try {
    await pool.query(`
      INSERT INTO categories (name, slug) VALUES 
        ('Apples', 'apples'),
        ('Oraimo Accessories', 'oraimo'),
        ('Men Wear', 'men-wear')
      ON CONFLICT (slug) DO NOTHING
    `)
    res.json({ success: true, message: 'Categories seeded' })
  } catch (error) {
    console.error('Seed categories error:', error)
    res.status(500).json({ error: 'Failed to seed categories', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Auth schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Register
app.post('/api/auth/register', authLimiter, async (req: Request, res: Response) => {
  if (!JWT_SECRET) return res.status(500).json({ error: 'Auth not configured' })
  const parse = registerSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', details: parse.error.format() })
  }

  const { email, password, full_name } = parse.data

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rowCount) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [email, passwordHash, full_name, 'customer']
    )

    const user: JwtUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
    }

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })

    res.json({ user, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Failed to register' })
  }
})

// Login
app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
  if (!JWT_SECRET) return res.status(500).json({ error: 'Auth not configured' })
  const parse = loginSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', details: parse.error.format() })
  }

  const { email, password } = parse.data

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    )
    if (!result.rowCount) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const userRow = result.rows[0]
    const valid = await bcrypt.compare(password, userRow.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user: JwtUser = {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role,
    }

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })

    res.json({ user, token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// Basic products endpoint
app.get('/api/products', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.original_price, p.brand, p.image_url, 
              p.colors, p.sizes, p.rating, p.review_count, p.discount, p.is_new, p.created_at,
              c.slug as category
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = true 
       ORDER BY p.created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to load products', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Admin product management
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  original_price: z.number().nonnegative().optional(),
  brand: z.string().optional(),
  image_url: z.string().url().optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  discount: z.number().int().min(0).max(100).default(0),
  is_new: z.boolean().default(false),
  category_slug: z.enum(['apples', 'oraimo', 'men-wear']),
})

app.post('/api/admin/products', authMiddleware, adminOnly, async (req: AuthedRequest, res: Response) => {
  const parse = productSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', details: parse.error.format() })
  }

  try {
    // Get category_id from slug
    const catResult = await pool.query('SELECT id FROM categories WHERE slug = $1', [parse.data.category_slug])
    if (!catResult.rowCount) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    const categoryId = catResult.rows[0].id

    const result = await pool.query(
      `INSERT INTO products (name, description, price, original_price, brand, image_url, colors, sizes, discount, is_new, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, name, description, price, original_price, brand, image_url, colors, sizes, discount, is_new, created_at`,
      [
        parse.data.name,
        parse.data.description || null,
        parse.data.price,
        parse.data.original_price || null,
        parse.data.brand || null,
        parse.data.image_url || null,
        parse.data.colors || null,
        parse.data.sizes || null,
        parse.data.discount,
        parse.data.is_new,
        categoryId,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.put('/api/admin/products/:id', authMiddleware, adminOnly, async (req: AuthedRequest, res: Response) => {
  const productId = parseInt(req.params.id)
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const parse = productSchema.partial().safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', details: parse.error.format() })
  }

  try {
    let categoryId: number | undefined
    if (parse.data.category_slug) {
      const catResult = await pool.query('SELECT id FROM categories WHERE slug = $1', [parse.data.category_slug])
      if (!catResult.rowCount) {
        return res.status(400).json({ error: 'Invalid category' })
      }
      categoryId = catResult.rows[0].id
    }

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (parse.data.name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(parse.data.name)
    }
    if (parse.data.description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(parse.data.description)
    }
    if (parse.data.price !== undefined) {
      updates.push(`price = $${paramCount++}`)
      values.push(parse.data.price)
    }
    if (parse.data.original_price !== undefined) {
      updates.push(`original_price = $${paramCount++}`)
      values.push(parse.data.original_price)
    }
    if (parse.data.brand !== undefined) {
      updates.push(`brand = $${paramCount++}`)
      values.push(parse.data.brand)
    }
    if (parse.data.image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`)
      values.push(parse.data.image_url)
    }
    if (parse.data.colors !== undefined) {
      updates.push(`colors = $${paramCount++}`)
      values.push(parse.data.colors)
    }
    if (parse.data.sizes !== undefined) {
      updates.push(`sizes = $${paramCount++}`)
      values.push(parse.data.sizes)
    }
    if (parse.data.discount !== undefined) {
      updates.push(`discount = $${paramCount++}`)
      values.push(parse.data.discount)
    }
    if (parse.data.is_new !== undefined) {
      updates.push(`is_new = $${paramCount++}`)
      values.push(parse.data.is_new)
    }
    if (categoryId !== undefined) {
      updates.push(`category_id = $${paramCount++}`)
      values.push(categoryId)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' })
    }

    values.push(productId)
    const result = await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.delete('/api/admin/products/:id', authMiddleware, adminOnly, async (req: AuthedRequest, res: Response) => {
  const productId = parseInt(req.params.id)
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  try {
    // Soft delete by setting is_active = false
    const result = await pool.query('UPDATE products SET is_active = false WHERE id = $1 RETURNING id', [productId])
    if (!result.rowCount) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Orders
const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1),
  total: z.number().nonnegative(),
  phoneNumber: z.string().min(1),
  deliveryAddress: z.string().min(1),
  deliveryRegion: z.enum(['Northern', 'Upper East', 'Upper West', 'North East', 'Savannah']),
  deliveryNotes: z.string().optional().nullable(),
  paymentMethod: z.enum(['stripe', 'momo']),
  paymentReference: z.string().optional().nullable(),
})

app.post('/api/orders', authMiddleware, async (req: AuthedRequest, res: Response) => {
  const parse = orderSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', details: parse.error.format() })
  }

  const { items, total, phoneNumber, deliveryAddress, deliveryRegion, deliveryNotes, paymentMethod, paymentReference } = parse.data

  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, status, phone_number, delivery_address, delivery_region, delivery_notes, payment_method, payment_reference) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [req.user!.id, total, paymentMethod === 'stripe' ? 'paid' : 'pending', phoneNumber, deliveryAddress, deliveryRegion, deliveryNotes || null, paymentMethod, paymentReference || null]
      )
      const orderId = orderResult.rows[0].id

      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [orderId, item.productId, item.quantity, item.unitPrice]
        )
      }

      // Create notification for admin
      await client.query(
        'INSERT INTO order_notifications (order_id) VALUES ($1)',
        [orderId]
      )

      await client.query('COMMIT')
      res.status(201).json({ id: orderId })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Create order error:', error)
      res.status(500).json({ error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('DB connection error:', error)
    res.status(500).json({ error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.get('/api/orders', authMiddleware, async (req: AuthedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `select o.id,
              o.status,
              o.total_amount,
              o.created_at,
              json_agg(
                json_build_object(
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price
                )
              ) as items
       from orders o
       join order_items oi on oi.order_id = o.id
       where o.user_id = $1
       group by o.id
       order by o.created_at desc`,
      [req.user!.id]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Fetch orders error:', error)
    res.status(500).json({ error: 'Failed to load orders' })
  }
})

app.put('/api/admin/orders/:id', authMiddleware, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    const { status } = req.body
    if (!status || !['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id',
      [status, req.params.id]
    )

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: 'Failed to update order status', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

app.get('/api/admin/orders', authMiddleware, adminOnly, async (_req: AuthedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `select o.id,
              o.status,
              o.total_amount,
              o.created_at,
              o.phone_number,
              o.delivery_address,
              o.delivery_region,
              o.delivery_notes,
              o.payment_method,
              u.email,
              u.full_name,
              json_agg(
                json_build_object(
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price
                )
              ) as items
       from orders o
       join users u on u.id = o.user_id
       join order_items oi on oi.order_id = o.id
       group by o.id, u.email, u.full_name
       order by o.created_at desc`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Admin orders error:', error)
    res.status(500).json({ error: 'Failed to load admin orders', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Get unread order notifications
app.get('/api/admin/notifications', authMiddleware, adminOnly, async (_req: AuthedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT on.id, on.order_id, on.read, on.created_at, o.total_amount, u.full_name, u.email
       FROM order_notifications on
       JOIN orders o ON o.id = on.order_id
       JOIN users u ON u.id = o.user_id
       WHERE on.read = false
       ORDER BY on.created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Admin notifications error:', error)
    res.status(500).json({ error: 'Failed to load notifications', details: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// Mark notification as read
app.put('/api/admin/notifications/:id/read', authMiddleware, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    await pool.query('UPDATE order_notifications SET read = true WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
})

// Payments
const createIntentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().default('usd'),
})

app.post('/api/payments/create-intent', async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Payments not configured' })
  }

  const parse = createIntentSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', details: parse.error.format() })
  }

  try {
    const { amount, currency } = parse.data
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    })
    res.json({ client_secret: intent.client_secret })
  } catch (error) {
    console.error('Create payment intent error:', error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
})

const port = process.env.PORT || 4000

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`)
})




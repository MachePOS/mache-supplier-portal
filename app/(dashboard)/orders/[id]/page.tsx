'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  orderDetails: { en: 'Order Details', fr: 'Détails de la commande', ht: 'Detay kòmand', es: 'Detalles del pedido' },
  back: { en: 'Back to Orders', fr: 'Retour aux commandes', ht: 'Retounen nan kòmand', es: 'Volver a pedidos' },
  notFound: { en: 'Order not found', fr: 'Commande non trouvée', ht: 'Kòmand pa jwenn', es: 'Pedido no encontrado' },
  customer: { en: 'Customer Information', fr: 'Informations client', ht: 'Enfòmasyon kliyan', es: 'Información del cliente' },
  delivery: { en: 'Delivery', fr: 'Livraison', ht: 'Livrezon', es: 'Entrega' },
  pickup: { en: 'Pickup', fr: 'Retrait', ht: 'Retire', es: 'Recoger' },
  items: { en: 'Order Items', fr: 'Articles', ht: 'Atik yo', es: 'Artículos' },
  payment: { en: 'Payment', fr: 'Paiement', ht: 'Peman', es: 'Pago' },
  notes: { en: 'Notes', fr: 'Notes', ht: 'Nòt', es: 'Notas' },
  status: { en: 'Order Status', fr: 'Statut de la commande', ht: 'Estati kòmand', es: 'Estado del pedido' },
  pending: { en: 'Pending', fr: 'En attente', ht: 'Ap tann', es: 'Pendiente' },
  confirmed: { en: 'Confirmed', fr: 'Confirmé', ht: 'Konfime', es: 'Confirmado' },
  processing: { en: 'Processing', fr: 'En traitement', ht: 'Ap trete', es: 'Procesando' },
  shipped: { en: 'Shipped', fr: 'Expédié', ht: 'Voye', es: 'Enviado' },
  delivered: { en: 'Delivered', fr: 'Livré', ht: 'Livre', es: 'Entregado' },
  received: { en: 'Received', fr: 'Reçu', ht: 'Resevwa', es: 'Recibido' },
  cancelled: { en: 'Cancelled', fr: 'Annulé', ht: 'Anile', es: 'Cancelado' },
  confirmOrder: { en: 'Confirm Order', fr: 'Confirmer la commande', ht: 'Konfime kòmand', es: 'Confirmar pedido' },
  startProcessing: { en: 'Start Processing', fr: 'Commencer le traitement', ht: 'Kòmanse trete', es: 'Empezar a procesar' },
  markShipped: { en: 'Mark as Shipped', fr: 'Marquer comme expédié', ht: 'Make kòm voye', es: 'Marcar como enviado' },
  markDelivered: { en: 'Mark as Delivered', fr: 'Marquer comme livré', ht: 'Make kòm livre', es: 'Marcar como entregado' },
  cancelOrder: { en: 'Cancel Order', fr: 'Annuler la commande', ht: 'Anile kòmand', es: 'Cancelar pedido' },
  subtotal: { en: 'Subtotal', fr: 'Sous-total', ht: 'Sou-total', es: 'Subtotal' },
  deliveryFee: { en: 'Delivery Fee', fr: 'Frais de livraison', ht: 'Frè livrezon', es: 'Costo de envío' },
  total: { en: 'Total', fr: 'Total', ht: 'Total', es: 'Total' },
  unpaid: { en: 'Unpaid', fr: 'Non payé', ht: 'Pa peye', es: 'No pagado' },
  partial: { en: 'Partially Paid', fr: 'Partiellement payé', ht: 'Peye an pati', es: 'Parcialmente pagado' },
  paid: { en: 'Paid', fr: 'Payé', ht: 'Peye', es: 'Pagado' },
  trackingNumber: { en: 'Tracking Number', fr: 'Numéro de suivi', ht: 'Nimewo swivi', es: 'Número de seguimiento' },
  addTracking: { en: 'Add tracking number...', fr: 'Ajouter le numéro de suivi...', ht: 'Ajoute nimewo swivi...', es: 'Agregar número de seguimiento...' },
  supplierNotes: { en: 'Supplier Notes', fr: 'Notes du fournisseur', ht: 'Nòt founisè', es: 'Notas del proveedor' },
  addNotes: { en: 'Add notes for this order...', fr: 'Ajouter des notes...', ht: 'Ajoute nòt...', es: 'Agregar notas...' },
  save: { en: 'Save', fr: 'Enregistrer', ht: 'Anrejistre', es: 'Guardar' },
  on_delivery: { en: 'Pay on Delivery', fr: 'Paiement à la livraison', ht: 'Peye nan livrezon', es: 'Pago contra entrega' },
  full_upfront: { en: 'Full Payment Upfront', fr: 'Paiement intégral d\'avance', ht: 'Peman konplè davans', es: 'Pago completo por adelantado' },
  partial_payment: { en: 'Partial Payment', fr: 'Paiement partiel', ht: 'Peman an pati', es: 'Pago parcial' },
  messages: { en: 'Messages', fr: 'Messages', ht: 'Mesaj', es: 'Mensajes' },
  noMessages: { en: 'No messages yet', fr: 'Pas de messages', ht: 'Pa gen mesaj', es: 'Sin mensajes' },
  typeMessage: { en: 'Type a message...', fr: 'Tapez un message...', ht: 'Tape yon mesaj...', es: 'Escribe un mensaje...' },
  send: { en: 'Send', fr: 'Envoyer', ht: 'Voye', es: 'Enviar' },
  you: { en: 'You', fr: 'Vous', ht: 'Ou', es: 'Tú' },
  buyer: { en: 'Buyer', fr: 'Acheteur', ht: 'Achtè', es: 'Comprador' },
  downloadInvoice: { en: 'Download Invoice', fr: 'Télécharger la facture', ht: 'Telechaje fakti', es: 'Descargar factura' },
  invoice: { en: 'Invoice', fr: 'Facture', ht: 'Fakti', es: 'Factura' },
  billTo: { en: 'Bill To', fr: 'Facturer à', ht: 'Fakti pou', es: 'Facturar a' },
  shipTo: { en: 'Ship To', fr: 'Livrer à', ht: 'Voye bay', es: 'Enviar a' },
  invoiceDate: { en: 'Invoice Date', fr: 'Date de facture', ht: 'Dat fakti', es: 'Fecha de factura' },
  orderDate: { en: 'Order Date', fr: 'Date de commande', ht: 'Dat kòmand', es: 'Fecha de pedido' },
  description: { en: 'Description', fr: 'Description', ht: 'Deskripsyon', es: 'Descripción' },
  quantity: { en: 'Qty', fr: 'Qté', ht: 'Kantite', es: 'Cant' },
  unitPrice: { en: 'Unit Price', fr: 'Prix unitaire', ht: 'Pri inite', es: 'Precio unitario' },
  amount: { en: 'Amount', fr: 'Montant', ht: 'Montan', es: 'Monto' },
  thankYou: { en: 'Thank you for your business!', fr: 'Merci pour votre confiance!', ht: 'Mèsi pou biznis ou!', es: '¡Gracias por su negocio!' },
  packingSlip: { en: 'Packing Slip', fr: 'Bordereau d\'expédition', ht: 'Bòdwo anvwa', es: 'Lista de empaque' },
  printPackingSlip: { en: 'Print Packing Slip', fr: 'Imprimer bordereau', ht: 'Enprime bòdwo', es: 'Imprimir lista' },
  packedBy: { en: 'Packed by:', fr: 'Emballé par:', ht: 'Anbale pa:', es: 'Empacado por:' },
  dateTime: { en: 'Date/Time:', fr: 'Date/Heure:', ht: 'Dat/Lè:', es: 'Fecha/Hora:' },
  itemChecklist: { en: 'Item Checklist', fr: 'Liste de contrôle', ht: 'Lis kontwòl', es: 'Lista de verificación' },
  packed: { en: 'Packed', fr: 'Emballé', ht: 'Anbale', es: 'Empacado' },
  specialInstructions: { en: 'Special Instructions', fr: 'Instructions spéciales', ht: 'Enstriksyon espesyal', es: 'Instrucciones especiales' },
}

interface OrderItem {
  id: string
  product_name: string
  product_sku: string | null
  product_image_url: string | null
  quantity: number
  unit_price: number
  total_price: number
  unit_of_measure: string | null
}

interface Message {
  id: string
  sender_type: 'buyer' | 'supplier'
  sender_name: string | null
  message: string
  created_at: string
}

interface Order {
  id: string
  order_number: string
  business_name: string
  ordered_by_name: string | null
  fulfillment_type: string
  delivery_address: string | null
  delivery_city: string | null
  delivery_phone: string | null
  delivery_notes: string | null
  pickup_location: string | null
  pickup_date: string | null
  pickup_time: string | null
  subtotal: number
  delivery_fee: number
  total_amount: number
  total_items: number
  status: string
  payment_terms: string
  payment_status: string
  amount_paid: number
  business_notes: string | null
  supplier_notes: string | null
  tracking_number: string | null
  created_at: string
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { t } = useLanguage()

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [supplierNotes, setSupplierNotes] = useState('')

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    const supabase = createClient()

    const { data: orderData, error: orderError } = await supabase
      .from('marketplace_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !orderData) {
      setLoading(false)
      return
    }

    setOrder(orderData)
    setTrackingNumber(orderData.tracking_number || '')
    setSupplierNotes(orderData.supplier_notes || '')

    // Load order items
    const { data: itemsData } = await supabase
      .from('marketplace_order_items')
      .select('*')
      .eq('order_id', orderId)

    setItems(itemsData || [])

    // Load messages
    const { data: messagesData } = await supabase
      .from('marketplace_order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    setMessages(messagesData || [])
    setLoading(false)
  }

  const updateStatus = async (newStatus: string) => {
    if (!order) return
    setUpdating(true)

    const supabase = createClient()
    const updates: any = { status: newStatus }

    if (newStatus === 'confirmed') updates.confirmed_at = new Date().toISOString()
    if (newStatus === 'processing') updates.processing_at = new Date().toISOString()
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString()
    if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString()

    await supabase
      .from('marketplace_orders')
      .update(updates)
      .eq('id', orderId)

    // Add to history
    await supabase
      .from('marketplace_order_history')
      .insert({
        order_id: orderId,
        old_status: order.status,
        new_status: newStatus,
        changed_by_type: 'supplier',
      })

    setOrder({ ...order, status: newStatus, ...updates })
    setUpdating(false)
  }

  const saveDetails = async () => {
    if (!order) return
    setUpdating(true)

    const supabase = createClient()
    await supabase
      .from('marketplace_orders')
      .update({
        tracking_number: trackingNumber || null,
        supplier_notes: supplierNotes || null,
      })
      .eq('id', orderId)

    setUpdating(false)
  }

  const sendMessage = async () => {
    if (!order || !newMessage.trim()) return
    setSendingMessage(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('marketplace_order_messages')
      .insert({
        order_id: orderId,
        sender_type: 'supplier',
        sender_name: 'Supplier',
        message: newMessage.trim(),
      })
      .select()
      .single()

    if (!error && data) {
      setMessages([...messages, data])
      setNewMessage('')
    }

    setSendingMessage(false)
  }

  const generateInvoice = () => {
    if (!order) return

    const invoiceWindow = window.open('', '_blank')
    if (!invoiceWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('invoice', translations.invoice)} - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 40px; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #6366f1; }
          .invoice-meta { text-align: right; }
          .invoice-meta p { margin: 4px 0; color: #666; }
          .invoice-meta strong { color: #333; }
          .parties { display: flex; gap: 60px; margin-bottom: 40px; }
          .party { flex: 1; }
          .party-label { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 8px; }
          .party-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
          .party-details { font-size: 14px; color: #666; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #666; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .text-right { text-align: right; }
          .totals { width: 300px; margin-left: auto; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .totals-row.total { font-size: 18px; font-weight: bold; border-bottom: none; border-top: 2px solid #333; padding-top: 12px; }
          .footer { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
          .status-paid { background: #dcfce7; color: #166534; }
          .status-unpaid { background: #fee2e2; color: #991b1b; }
          .status-partial { background: #fef3c7; color: #92400e; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <div class="invoice-title">${t('invoice', translations.invoice)}</div>
            <p style="color: #666; margin-top: 8px;">#${order.order_number}</p>
          </div>
          <div class="invoice-meta">
            <p><strong>${t('invoiceDate', translations.invoiceDate)}:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>${t('orderDate', translations.orderDate)}:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p style="margin-top: 8px;">
              <span class="status-badge ${order.payment_status === 'paid' ? 'status-paid' : order.payment_status === 'partial' ? 'status-partial' : 'status-unpaid'}">
                ${t(order.payment_status as keyof typeof translations, translations[order.payment_status as keyof typeof translations])}
              </span>
            </p>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <div class="party-label">${t('billTo', translations.billTo)}</div>
            <div class="party-name">${order.business_name}</div>
            <div class="party-details">
              ${order.ordered_by_name ? order.ordered_by_name + '<br>' : ''}
              ${order.delivery_address || ''}
              ${order.delivery_city ? '<br>' + order.delivery_city : ''}
              ${order.delivery_phone ? '<br>' + order.delivery_phone : ''}
            </div>
          </div>
          ${order.fulfillment_type === 'delivery' ? `
          <div class="party">
            <div class="party-label">${t('shipTo', translations.shipTo)}</div>
            <div class="party-name">${order.business_name}</div>
            <div class="party-details">
              ${order.delivery_address || ''}<br>
              ${order.delivery_city || ''}
              ${order.delivery_phone ? '<br>' + order.delivery_phone : ''}
            </div>
          </div>
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>${t('description', translations.description)}</th>
              <th class="text-right">${t('quantity', translations.quantity)}</th>
              <th class="text-right">${t('unitPrice', translations.unitPrice)}</th>
              <th class="text-right">${t('amount', translations.amount)}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>
                  <strong>${item.product_name}</strong>
                  ${item.product_sku ? `<br><small style="color: #666;">SKU: ${item.product_sku}</small>` : ''}
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">$${item.unit_price.toFixed(2)}</td>
                <td class="text-right">$${item.total_price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>${t('subtotal', translations.subtotal)}</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.delivery_fee > 0 ? `
          <div class="totals-row">
            <span>${t('deliveryFee', translations.deliveryFee)}</span>
            <span>$${order.delivery_fee.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="totals-row total">
            <span>${t('total', translations.total)}</span>
            <span>$${order.total_amount.toFixed(2)}</span>
          </div>
          ${order.amount_paid > 0 ? `
          <div class="totals-row" style="border-bottom: none;">
            <span style="color: #16a34a;">${t('paid', translations.paid)}</span>
            <span style="color: #16a34a;">-$${order.amount_paid.toFixed(2)}</span>
          </div>
          <div class="totals-row" style="font-weight: bold; border-bottom: none;">
            <span>Balance Due</span>
            <span>$${(order.total_amount - order.amount_paid).toFixed(2)}</span>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>${t('thankYou', translations.thankYou)}</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
      </body>
      </html>
    `

    invoiceWindow.document.write(invoiceHTML)
    invoiceWindow.document.close()
  }

  const generatePackingSlip = () => {
    if (!order) return

    const packingWindow = window.open('', '_blank')
    if (!packingWindow) return

    const packingHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('packingSlip', translations.packingSlip)} - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
          .title { font-size: 28px; font-weight: bold; }
          .order-info { text-align: right; }
          .order-info p { margin: 4px 0; }
          .order-number { font-size: 18px; font-weight: bold; }
          .sections { display: flex; gap: 40px; margin-bottom: 30px; }
          .section { flex: 1; }
          .section-label { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
          .section-content { font-size: 14px; line-height: 1.6; }
          .section-content strong { display: block; font-size: 16px; margin-bottom: 4px; }
          .packing-info { display: flex; gap: 20px; margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .packing-info-item { display: flex; gap: 8px; }
          .packing-info-item label { font-weight: bold; }
          .packing-info-item span { color: #666; }
          .packing-info-item input { border: 1px solid #999; padding: 4px 8px; width: 200px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #333; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #ddd; vertical-align: top; }
          .checkbox { width: 24px; height: 24px; border: 2px solid #333; display: inline-block; vertical-align: middle; }
          .qty-box { display: inline-flex; align-items: center; gap: 8px; background: #f0f0f0; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
          .sku { color: #666; font-size: 12px; margin-top: 4px; }
          .notes-section { padding: 15px; border: 2px dashed #999; border-radius: 8px; margin-bottom: 20px; }
          .notes-section h3 { font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
          .notes-content { min-height: 60px; font-size: 14px; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
            .packing-info { background: white; border: 1px solid #ddd; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${t('packingSlip', translations.packingSlip)}</div>
          </div>
          <div class="order-info">
            <p class="order-number">#${order.order_number}</p>
            <p>${new Date(order.created_at).toLocaleDateString()}</p>
            <p style="margin-top: 8px;">
              <span style="display: inline-block; padding: 4px 12px; background: ${order.fulfillment_type === 'delivery' ? '#dbeafe' : '#f3e8ff'}; color: ${order.fulfillment_type === 'delivery' ? '#1d4ed8' : '#7c3aed'}; border-radius: 9999px; font-size: 12px; font-weight: bold;">
                ${order.fulfillment_type === 'delivery' ? t('delivery', translations.delivery) : t('pickup', translations.pickup)}
              </span>
            </p>
          </div>
        </div>

        <div class="sections">
          <div class="section">
            <div class="section-label">${t('billTo', translations.billTo)}</div>
            <div class="section-content">
              <strong>${order.business_name}</strong>
              ${order.ordered_by_name ? order.ordered_by_name + '<br>' : ''}
              ${order.delivery_phone ? order.delivery_phone : ''}
            </div>
          </div>
          <div class="section">
            <div class="section-label">${order.fulfillment_type === 'delivery' ? t('shipTo', translations.shipTo) : t('pickup', translations.pickup)}</div>
            <div class="section-content">
              ${order.fulfillment_type === 'delivery' ? `
                <strong>${order.business_name}</strong>
                ${order.delivery_address || ''}<br>
                ${order.delivery_city || ''}
              ` : `
                <strong>${order.pickup_location || 'Store Pickup'}</strong>
                ${order.pickup_date ? order.pickup_date + ' ' + (order.pickup_time || '') : ''}
              `}
            </div>
          </div>
        </div>

        <div class="packing-info">
          <div class="packing-info-item">
            <label>${t('packedBy', translations.packedBy)}</label>
            <input type="text" placeholder="Name..." />
          </div>
          <div class="packing-info-item">
            <label>${t('dateTime', translations.dateTime)}</label>
            <span>${new Date().toLocaleString()}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;"><span class="checkbox"></span></th>
              <th>${t('itemChecklist', translations.itemChecklist)}</th>
              <th style="width: 100px; text-align: center;">${t('quantity', translations.quantity)}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="text-align: center;"><span class="checkbox"></span></td>
                <td>
                  <strong>${item.product_name}</strong>
                  ${item.product_sku ? `<div class="sku">SKU: ${item.product_sku}</div>` : ''}
                  ${item.unit_of_measure ? `<div class="sku">${item.unit_of_measure}</div>` : ''}
                </td>
                <td style="text-align: center;">
                  <span class="qty-box">${item.quantity}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="notes-section">
          <h3>${t('specialInstructions', translations.specialInstructions)}</h3>
          <div class="notes-content">
            ${order.business_notes || order.delivery_notes || '<em style="color: #999;">None</em>'}
          </div>
        </div>

        <div class="footer">
          <p>Total Items: ${items.reduce((sum, item) => sum + item.quantity, 0)} | Order: ${order.order_number}</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 12px 24px; background: #333; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            Print Packing Slip
          </button>
        </div>
      </body>
      </html>
    `

    packingWindow.document.write(packingHTML)
    packingWindow.document.close()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('notFound', translations.notFound)}</h2>
          <Link href="/orders" className="text-primary-600 hover:text-primary-700">
            {t('back', translations.back)}
          </Link>
        </div>
      </div>
    )
  }

  // Status timeline steps
  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'received']
  const currentStepIndex = statusSteps.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back', translations.back)}
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-200 text-sm">Order from</p>
              <h1 className="text-xl font-bold">{order.business_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-purple-200 text-sm">{order.order_number}</p>
                <button
                  onClick={generateInvoice}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('downloadInvoice', translations.downloadInvoice)}
                </button>
                <button
                  onClick={generatePackingSlip}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  {t('printPackingSlip', translations.printPackingSlip)}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${order.total_amount.toFixed(2)}</p>
              <p className="text-purple-200 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        {!isCancelled ? (
          <div className="px-5 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                const isPending = index > currentStepIndex

                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-purple-600 text-white ring-4 ring-purple-100' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 text-center ${isCurrent ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>
                        {t(step as keyof typeof translations, translations[step as keyof typeof translations])}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-1 rounded ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="px-5 py-3 bg-red-50 border-t border-red-100">
            <p className="text-red-700 font-medium text-center">{t('cancelled', translations.cancelled)}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isCancelled && order.status !== 'delivered' && order.status !== 'received' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => updateStatus('confirmed')}
                  disabled={updating}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('confirmOrder', translations.confirmOrder)}
                </button>
                <button
                  onClick={() => updateStatus('cancelled')}
                  disabled={updating}
                  className="py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  {t('cancelOrder', translations.cancelOrder)}
                </button>
              </>
            )}
            {order.status === 'confirmed' && (
              <button
                onClick={() => updateStatus('processing')}
                disabled={updating}
                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t('startProcessing', translations.startProcessing)}
              </button>
            )}
            {order.status === 'processing' && (
              <button
                onClick={() => updateStatus('shipped')}
                disabled={updating}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {t('markShipped', translations.markShipped)}
              </button>
            )}
            {order.status === 'shipped' && (
              <button
                onClick={() => updateStatus('delivered')}
                disabled={updating}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('markDelivered', translations.markDelivered)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Customer & Payment Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">{t('customer', translations.customer)}</h2>
          </div>

          <p className="font-medium text-gray-900">{order.business_name}</p>
          {order.ordered_by_name && <p className="text-sm text-gray-600">{order.ordered_by_name}</p>}

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              {order.fulfillment_type === 'delivery' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
              <span className="font-medium">
                {order.fulfillment_type === 'delivery' ? t('delivery', translations.delivery) : t('pickup', translations.pickup)}
              </span>
            </div>
            {order.fulfillment_type === 'delivery' ? (
              <div className="text-sm text-gray-600 space-y-1">
                {order.delivery_address && <p>{order.delivery_address}</p>}
                {order.delivery_city && <p>{order.delivery_city}</p>}
                {order.delivery_phone && (
                  <p className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {order.delivery_phone}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600 space-y-1">
                {order.pickup_location && <p>{order.pickup_location}</p>}
                {order.pickup_date && <p>{order.pickup_date} {order.pickup_time}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">{t('payment', translations.payment)}</h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Terms</span>
              <span className="font-medium text-gray-900">
                {t(order.payment_terms as keyof typeof translations, translations[order.payment_terms as keyof typeof translations] || { en: order.payment_terms })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${paymentStatusColors[order.payment_status]}`}>
                {t(order.payment_status as keyof typeof translations, translations[order.payment_status as keyof typeof translations])}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paid</span>
                <span className="text-green-600">${order.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due</span>
                <span className={order.total_amount - order.amount_paid > 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                  ${(order.total_amount - order.amount_paid).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="font-semibold text-gray-900">{t('items', translations.items)}</h2>
          <span className="text-sm text-gray-500">({items.length} items)</span>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.product_image_url ? (
                  <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{item.product_name}</p>
                <p className="text-xs text-gray-500">
                  {item.product_sku && `SKU: ${item.product_sku} · `}
                  {item.quantity} × ${item.unit_price.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${item.total_price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('subtotal', translations.subtotal)}</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('deliveryFee', translations.deliveryFee)}</span>
              <span>${order.delivery_fee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-gray-900 pt-1">
            <span>{t('total', translations.total)}</span>
            <span>${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tracking/Notes & Messages Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Tracking & Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">{t('trackingNumber', translations.trackingNumber)} & {t('notes', translations.notes)}</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('trackingNumber', translations.trackingNumber)}</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t('addTracking', translations.addTracking)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('supplierNotes', translations.supplierNotes)}</label>
              <textarea
                value={supplierNotes}
                onChange={(e) => setSupplierNotes(e.target.value)}
                placeholder={t('addNotes', translations.addNotes)}
                rows={2}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={saveDetails}
              disabled={updating}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
            >
              {t('save', translations.save)}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">{t('messages', translations.messages)}</h2>
            {messages.length > 0 && (
              <span className="bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
                {messages.length}
              </span>
            )}
          </div>

          {/* Messages List */}
          <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">{t('noMessages', translations.noMessages)}</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg text-sm ${
                    msg.sender_type === 'supplier'
                      ? 'bg-primary-50 border border-primary-100 ml-6'
                      : 'bg-gray-50 border border-gray-100 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-medium ${
                      msg.sender_type === 'supplier' ? 'text-primary-700' : 'text-gray-700'
                    }`}>
                      {msg.sender_type === 'supplier' ? t('you', translations.you) : (msg.sender_name || t('buyer', translations.buyer))}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-800">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Send Message */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
              placeholder={t('typeMessage', translations.typeMessage)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={sendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Notes */}
      {order.business_notes && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 text-sm">Customer Notes</h3>
              <p className="text-yellow-700 text-sm mt-1">{order.business_notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

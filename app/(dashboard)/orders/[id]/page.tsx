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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('notFound', translations.notFound)}</h2>
          <Link href="/orders" className="text-primary-600 hover:text-primary-700">
            {t('back', translations.back)}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('back', translations.back)}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status]}`}>
            {t(order.status as keyof typeof translations, translations[order.status as keyof typeof translations])}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('customer', translations.customer)}</h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{order.business_name}</p>
              {order.ordered_by_name && <p className="text-gray-600">{order.ordered_by_name}</p>}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-2">
                {order.fulfillment_type === 'delivery'
                  ? t('delivery', translations.delivery)
                  : t('pickup', translations.pickup)}
              </p>
              {order.fulfillment_type === 'delivery' ? (
                <div className="space-y-1 text-gray-600">
                  {order.delivery_address && <p>{order.delivery_address}</p>}
                  {order.delivery_city && <p>{order.delivery_city}</p>}
                  {order.delivery_phone && <p>{order.delivery_phone}</p>}
                  {order.delivery_notes && <p className="text-sm italic">{order.delivery_notes}</p>}
                </div>
              ) : (
                <div className="space-y-1 text-gray-600">
                  {order.pickup_location && <p>{order.pickup_location}</p>}
                  {order.pickup_date && <p>{order.pickup_date} {order.pickup_time}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('items', translations.items)}</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product_image_url ? (
                      <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.product_sku && <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>}
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ${item.unit_price.toFixed(2)} {item.unit_of_measure && `per ${item.unit_of_measure}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${item.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>{t('subtotal', translations.subtotal)}</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>{t('deliveryFee', translations.deliveryFee)}</span>
                  <span>${order.delivery_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>{t('total', translations.total)}</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.business_notes && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('notes', translations.notes)}</h2>
              <p className="text-gray-600">{order.business_notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('status', translations.status)}</h2>
            <div className="space-y-3">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus('confirmed')}
                    disabled={updating}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t('confirmOrder', translations.confirmOrder)}
                  </button>
                  <button
                    onClick={() => updateStatus('cancelled')}
                    disabled={updating}
                    className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {t('cancelOrder', translations.cancelOrder)}
                  </button>
                </>
              )}
              {order.status === 'confirmed' && (
                <button
                  onClick={() => updateStatus('processing')}
                  disabled={updating}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {t('startProcessing', translations.startProcessing)}
                </button>
              )}
              {order.status === 'processing' && (
                <button
                  onClick={() => updateStatus('shipped')}
                  disabled={updating}
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {t('markShipped', translations.markShipped)}
                </button>
              )}
              {order.status === 'shipped' && (
                <button
                  onClick={() => updateStatus('delivered')}
                  disabled={updating}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {t('markDelivered', translations.markDelivered)}
                </button>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('payment', translations.payment)}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Terms</span>
                <span className="font-medium">
                  {t(order.payment_terms as keyof typeof translations, translations[order.payment_terms as keyof typeof translations] || { en: order.payment_terms })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[order.payment_status]}`}>
                  {t(order.payment_status as keyof typeof translations, translations[order.payment_status as keyof typeof translations])}
                </span>
              </div>
              {order.amount_paid > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-green-600">${order.amount_paid.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('trackingNumber', translations.trackingNumber)}</h2>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t('addTracking', translations.addTracking)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-3"
            />
            <button
              onClick={saveDetails}
              disabled={updating}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {t('save', translations.save)}
            </button>
          </div>

          {/* Supplier Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('supplierNotes', translations.supplierNotes)}</h2>
            <textarea
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              placeholder={t('addNotes', translations.addNotes)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-3"
            />
            <button
              onClick={saveDetails}
              disabled={updating}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {t('save', translations.save)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

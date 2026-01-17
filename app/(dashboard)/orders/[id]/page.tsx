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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Status timeline steps
  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'received']
  const currentStepIndex = statusSteps.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

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
              <p className="text-purple-200 text-sm mt-1">{order.order_number}</p>
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

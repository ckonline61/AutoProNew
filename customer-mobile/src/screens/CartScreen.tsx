import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { useAuth } from '../contexts/AuthContext';
export const CartScreen = () => {
  const { cart, orders, addresses, updateCartQuantity, placeOrder } = useCustomerData();
  const { isPreview } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((sum,item) => sum + (item.unitPrice ?? item.sparePart.price) * item.quantity, 0);
  const update = async (id: string, quantity: number) => {
    if (busy) return; setBusy(true);
    try { await updateCartQuantity(id, quantity); } catch (error) { Alert.alert('Cart update failed', requestError(error)); } finally { setBusy(false); }
  };
  const checkout = () => {
    const address = addresses.find(a => a.id === (selectedAddress || addresses[0]?.id));
    if (!address) { Alert.alert('Address required', 'Add a shipping address in Profile before ordering.'); return; }
    Alert.alert(isPreview ? 'Place sample order?' : 'Place order?', `Ship to ${address.street}, ${address.city}. The backend confirms the final amount. This does not mark a payment as successful.`, [{ text: 'Keep shopping', style: 'cancel' }, { text: 'Place order', onPress: async () => {
      if (busy) return; setBusy(true);
      try { const order = await placeOrder(address); Alert.alert(isPreview ? 'Sample order placed' : 'Order placed', `${order.number}\nStatus: ${order.status}\nPayment: ${order.paymentStatus}\nAmount: ₹${order.totalAmount}`); }
      catch (error) { Alert.alert('Order failed', requestError(error)); }
      finally { setBusy(false); }
    } }]);
  };
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Your Cart</Text>
    {!cart.length && <Text>Your cart is empty. Add spare parts from Marketplace.</Text>}
    {cart.map(item => <View key={item.sparePartId} style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, gap: 12 }}>
      <Text style={{ fontWeight: '700' }}>{item.sparePart.name || 'Unavailable part'}</Text><Text>₹{item.unitPrice ?? item.sparePart.price} × {item.quantity}</Text>
      <View style={{ flexDirection: 'row', gap: 24 }}><TouchableOpacity disabled={busy} onPress={() => void update(item.sparePartId, item.quantity-1)}><Text>−</Text></TouchableOpacity><Text>{item.quantity}</Text><TouchableOpacity disabled={busy} onPress={() => void update(item.sparePartId, item.quantity+1)}><Text>+</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={() => void update(item.sparePartId,0)}><Text style={{ color: '#DC2626' }}>Remove</Text></TouchableOpacity></View>
    </View>)}
    {cart.length > 0 && <><Text style={{ fontSize: 18 }}>Cart amount: ₹{total}</Text><Text>Shipping address</Text>{addresses.map(address => <TouchableOpacity key={address.id} onPress={() => setSelectedAddress(address.id)} style={{ padding: 12, borderWidth: 1, borderColor: (selectedAddress || addresses[0]?.id) === address.id ? '#2563EB' : '#CBD5E1' }}><Text>{address.title} — {address.street}, {address.city}</Text></TouchableOpacity>)}<TouchableOpacity disabled={busy} onPress={checkout} style={{ padding: 16, borderRadius: 8, backgroundColor: '#2563EB' }}><Text style={{ color: 'white' }}>{busy ? 'Processing...' : 'Place order'}</Text></TouchableOpacity></>}
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Order History</Text>
    {!orders.length && <Text>No orders yet.</Text>}
    {orders.map(order => <View key={order.id} style={{ padding: 16, backgroundColor: 'white', borderRadius: 12, gap: 8 }}><Text style={{ fontWeight: '700' }}>{order.number || order.id}</Text><Text>{order.status} · Payment: {order.paymentStatus} · ₹{order.totalAmount}</Text>{order.items.map((item,index) => <Text key={index}>{item.name} × {item.quantity}</Text>)}</View>)}
  </ScrollView>;
};

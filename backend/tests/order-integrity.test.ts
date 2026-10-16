import { Types } from 'mongoose';
import { orderService } from '../src/services/order.service';
import { Cart } from '../src/models/cart.model';
import { Order } from '../src/models/order.model';
import { SparePart } from '../src/models/spare-part.model';
import { OrderStatus } from '../src/types';
jest.mock('../src/models/cart.model'); jest.mock('../src/models/order.model'); jest.mock('../src/models/spare-part.model');
const userId = '507f1f77bcf86cd799439011'; const partId = new Types.ObjectId('507f1f77bcf86cd799439022'); const cartId = new Types.ObjectId('507f1f77bcf86cd799439033');
const address = { addressLine1:'House One',city:'Pune',state:'Maharashtra',pincode:'411045' };
const part = { _id:partId,name:'Filter',price:500,stock:5,isActive:true };
const cart = { _id:cartId,items:[{sparePartId:part,quantity:2,price:500}],totalAmount:1000 };
beforeEach(() => {
  jest.clearAllMocks();
  (Cart.findOneAndUpdate as jest.Mock).mockReturnValue({populate:jest.fn().mockResolvedValue(cart)});
  (Cart.updateOne as jest.Mock).mockResolvedValue({modifiedCount:1});
  (SparePart.findOneAndUpdate as jest.Mock).mockResolvedValue(part);
  (SparePart.findByIdAndUpdate as jest.Mock).mockResolvedValue(part);
  (Order.create as jest.Mock).mockImplementation(async value => value);
});
test('checkout claims the cart once and conditionally reserves inventory', async () => {
  const order = await orderService.placeOrder(userId,address,1000);
  expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(expect.objectContaining({checkoutInProgress:{$ne:true}}),expect.any(Object),{new:true});
  expect(SparePart.findOneAndUpdate).toHaveBeenCalledWith({_id:partId,isActive:true,stock:{$gte:2}},{$inc:{stock:-2}},{new:true});
  expect(order).toMatchObject({totalAmount:1000,status:'PLACED',paymentStatus:'PENDING'});
});
test('a concurrent or empty checkout cannot create a second order', async () => {
  (Cart.findOneAndUpdate as jest.Mock).mockReturnValue({populate:jest.fn().mockResolvedValue(null)});
  await expect(orderService.placeOrder(userId,address)).rejects.toThrow('already processing'); expect(Order.create).not.toHaveBeenCalled(); expect(SparePart.findOneAndUpdate).not.toHaveBeenCalled();
});
test('inventory is restored and the cart unlocked if order persistence fails', async () => {
  (Order.create as jest.Mock).mockRejectedValue(new Error('Database write failed'));
  await expect(orderService.placeOrder(userId,address)).rejects.toThrow('Database write failed');
  expect(SparePart.findByIdAndUpdate).toHaveBeenCalledWith(partId,{$inc:{stock:2}});
  expect(Cart.updateOne).toHaveBeenCalledWith(expect.any(Object),expect.objectContaining({$set:{checkoutInProgress:false}}));
});
test('changed prices and mismatched totals are rejected without placing an order', async () => {
  (SparePart.findOneAndUpdate as jest.Mock).mockResolvedValue({...part,price:600});
  await expect(orderService.placeOrder(userId,address,1000)).rejects.toThrow('price changed'); expect(Order.create).not.toHaveBeenCalled();
  (SparePart.findOneAndUpdate as jest.Mock).mockResolvedValue(part);
  await expect(orderService.placeOrder(userId,address,1)).rejects.toThrow('total changed');
});
test('out-of-stock reservation never decrements without a stock guard', async () => {
  (SparePart.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
  await expect(orderService.placeOrder(userId,address)).rejects.toThrow('Insufficient stock'); expect(Order.create).not.toHaveBeenCalled();
});
test('fulfillment cannot go backwards or pretend a refund succeeded', async () => {
  (Order.findById as jest.Mock).mockResolvedValue({status:OrderStatus.DELIVERED});
  await expect(orderService.updateStatus(cartId.toString(),OrderStatus.CONFIRMED)).rejects.toThrow('Cannot change order');
  await expect(orderService.updateStatus(cartId.toString(),OrderStatus.REFUNDED)).rejects.toThrow('Cannot change order');
});
test('a lost cancellation race cannot restore stock twice', async () => {
  (Order.findById as jest.Mock).mockResolvedValue({userId:new Types.ObjectId(userId),status:OrderStatus.PLACED,items:[{sparePartId:partId,quantity:2}]});
  (Order.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
  await expect(orderService.cancelOrder(userId,cartId.toString())).rejects.toThrow('changed while cancelling'); expect(SparePart.findByIdAndUpdate).not.toHaveBeenCalled();
});

import { Address, IAddress } from '../models/address.model';
import { NotFoundError } from '../errors/app-error';
import { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator';

export class AddressService {
  /**
   * Create an address for the user. If marked as default, unset other defaults.
   */
  public async create(userId: string, data: CreateAddressInput): Promise<IAddress> {
    if (data.isDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      ...data,
      userId,
      isActive: true,
    });

    return address;
  }

  /**
   * Get all active addresses for the user.
   */
  public async getAll(userId: string): Promise<IAddress[]> {
    return Address.find({ userId, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
  }

  /**
   * Get single address by ID, ensuring ownership.
   */
  public async getById(userId: string, addressId: string): Promise<IAddress> {
    const address = await Address.findOne({
      _id: addressId,
      userId,
      isActive: true,
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return address;
  }

  /**
   * Update address, ensuring ownership. If isDefault=true, unset other defaults.
   */
  public async update(
    userId: string,
    addressId: string,
    data: UpdateAddressInput
  ): Promise<IAddress> {
    const address = await Address.findOne({
      _id: addressId,
      userId,
      isActive: true,
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    if (data.isDefault) {
      await Address.updateMany(
        { userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, data);
    await address.save();

    return address;
  }

  /**
   * Soft delete address (set isActive=false), ensuring ownership.
   */
  public async remove(userId: string, addressId: string): Promise<IAddress> {
    const address = await Address.findOne({
      _id: addressId,
      userId,
      isActive: true,
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    address.isActive = false;
    await address.save();

    return address;
  }
}

export const addressService = new AddressService();

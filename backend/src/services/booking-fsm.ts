import { BookingStatus } from '../types';
import { BadRequestError } from '../errors/app-error';

/**
 * Valid state transitions mapping for Bookings.
 */
export const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
    BookingStatus.REJECTED,
  ],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.ASSIGNED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.ASSIGNED]: [
    BookingStatus.ACCEPTED,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.ACCEPTED]: [
    BookingStatus.EN_ROUTE,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.EN_ROUTE]: [
    BookingStatus.ARRIVED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.ARRIVED]: [
    BookingStatus.IN_PROGRESS,
    BookingStatus.NO_SHOW,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.IN_PROGRESS]: [
    BookingStatus.COMPLETED,
    BookingStatus.FAILED,
  ],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.REJECTED]: [
    BookingStatus.ASSIGNED, // Re-assigning to another mechanic
  ],
  [BookingStatus.FAILED]: [],
  [BookingStatus.NO_SHOW]: [],
};

/**
 * Statuses from which a customer is permitted to cancel their booking.
 */
export const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.ASSIGNED,
  BookingStatus.ACCEPTED,
];

export class BookingFsm {
  /**
   * Check if a state transition is permitted.
   */
  public static canTransition(currentStatus: BookingStatus, nextStatus: BookingStatus): boolean {
    const allowed = VALID_BOOKING_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  }

  /**
   * Validate and assert that a transition is allowed; throw BadRequestError otherwise.
   */
  public static assertTransition(currentStatus: BookingStatus, nextStatus: BookingStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new BadRequestError(
        `Invalid status transition from '${currentStatus}' to '${nextStatus}'`
      );
    }
  }

  /**
   * Check if the booking can be cancelled by the customer.
   */
  public static assertCustomerCanCancel(currentStatus: BookingStatus): void {
    if (!CANCELLABLE_STATUSES.includes(currentStatus)) {
      throw new BadRequestError(
        `Booking cannot be cancelled in its current state '${currentStatus}'`
      );
    }
  }
}

import type { ApplicationOrder } from "./ApplicationOrderContext";

export type StepId = 1 | 2 | 3 | 4 | 5;

/** Returns field key -> error message. Empty object means step is valid. */
export function validateStep(
  stepId: StepId,
  order: ApplicationOrder
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (stepId === 1) {
    if (!order.tripDetails.arrivalDate?.trim()) {
      errors.arrivalDate = "Arrival date is required";
    }
    if (!order.tripDetails.email?.trim()) {
      errors.email = "Email is required";
    }
    if (
      order.tripDetails.email?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.tripDetails.email)
    ) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (stepId === 2) {
    order.travellers.forEach((t, i) => {
      if (!t.firstName?.trim()) {
        errors[`traveller_${i}_firstName`] = "First name is required";
      }
      if (!t.lastName?.trim()) {
        errors[`traveller_${i}_lastName`] = "Last name is required";
      }
      if (!t.dateOfBirth?.trim()) {
        errors[`traveller_${i}_dateOfBirth`] = "Date of birth is required";
      }
    });
  }

  if (stepId === 3) {
    order.travellers.forEach((t, i) => {
      if (!t.passportDestination?.trim()) {
        errors[`traveller_${i}_passportDestination`] = "Passport destination is required";
      }
      if (!t.passportNumber?.trim()) {
        errors[`traveller_${i}_passportNumber`] = "Passport number is required";
      }
      if (!t.passportExpiryDate?.trim()) {
        errors[`traveller_${i}_passportExpiryDate`] = "Passport expiry date is required";
      }
      if (!t.countryOfBirth?.trim()) {
        errors[`traveller_${i}_countryOfBirth`] = "Country of birth is required";
      }
      if (!t.countryOfResidence?.trim()) {
        errors[`traveller_${i}_countryOfResidence`] = "Country of residence is required";
      }
    });
  }

  // Step 4: turnaround always has a value
  // Step 5: no required fields for "next"

  return errors;
}

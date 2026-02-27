import type { ApplicationOrder } from "./ApplicationOrderContext";

export type StepId = 1 | 2 | 3 | 4 | 5;

/** Returns field key -> error message. Empty object means step is valid. */
export function validateStep(
  stepId: StepId,
  order: ApplicationOrder
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (stepId === 1) {
    if (!order.arrival_date?.trim()) {
      errors.arrivalDate = "Arrival date is required";
    }
    if (!order.contact_email?.trim()) {
      errors.email = "Email is required";
    }
    if (
      order.contact_email?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.contact_email)
    ) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (stepId === 2) {
    order.travellers.forEach((t, i) => {
      if (!t.first_name?.trim()) {
        errors[`traveller_${i}_first_name`] = "First name is required";
      }
      if (!t.last_name?.trim()) {
        errors[`traveller_${i}_last_name`] = "Last name is required";
      }
      if (!t.date_of_birth?.trim()) {
        errors[`traveller_${i}_date_of_birth`] = "Date of birth is required";
      }
    });
  }

  if (stepId === 3) {
    order.travellers.forEach((t, i) => {
      if (!t.nationality?.trim()) {
        errors[`traveller_${i}_nationality`] = "Passport nationality is required";
      }
      if (!t.passport_number?.trim()) {
        errors[`traveller_${i}_passport_number`] = "Passport number is required";
      }
      if (!t.passport_expiry_date?.trim()) {
        errors[`traveller_${i}_passport_expiry_date`] = "Passport expiry date is required";
      }
      if (!t.country_of_birth?.trim()) {
        errors[`traveller_${i}_country_of_birth`] = "Country of birth is required";
      }
      if (!t.country_of_residence?.trim()) {
        errors[`traveller_${i}_country_of_residence`] = "Country of residence is required";
      }
    });
  }

  // Step 4: turnaround always has a value
  // Step 5: no required fields for "next"

  return errors;
}

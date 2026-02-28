import type { ApplicationOrder } from "./ApplicationOrderContext";
import isVisaAvailable from "@/actions/visas";

export type StepId = 1 | 2 | 3 | 4 | 5;

/** Parse YYYY-MM-DD to local Date at midnight for date-only comparison */
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns field key -> error message. Empty object means step is valid. */
export async function validateStep(
  stepId: StepId,
  order: ApplicationOrder
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  if (stepId === 1) {
    if (!order.arrival_date?.trim()) {
      errors.arrivalDate = "Arrival date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const arrivalDate = parseDateLocal(order.arrival_date);
      if (arrivalDate < today) {
        errors.arrivalDate = "Arrival date cannot be in the past";
      }
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
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dob = parseDateLocal(t.date_of_birth);
        if (dob > today) {
          errors[`traveller_${i}_date_of_birth`] = "Date of birth cannot be in the future";
        }
      }
    });
  }

  if (stepId === 3) {
    for (let i = 0; i < order.travellers.length; i++) {
      const t = order.travellers[i];
      if (!t.nationality?.trim()) {
        errors[`traveller_${i}_nationality`] = "Passport nationality is required";
      } else {
        if (t.nationality !== order.nationality) {
          const { status, error } = await isVisaAvailable(
            order.destination_country,
            t.nationality,
            order.visa_type_id
          );
          if (!status && error) {
            errors[`traveller_${i}_nationality`] = error;
          }
        }
      }
      if (!t.passport_number?.trim()) {
        errors[`traveller_${i}_passport_number`] = "Passport number is required";
      }
      if (!t.passport_expiry_date?.trim()) {
        errors[`traveller_${i}_passport_expiry_date`] = "Passport expiry date is required";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = parseDateLocal(t.passport_expiry_date);
        if (expiryDate < today) {
          errors[`traveller_${i}_passport_expiry_date`] = "Passport expiry date cannot be in the past";
        }
      }
      if (!t.country_of_birth?.trim()) {
        errors[`traveller_${i}_country_of_birth`] = "Country of birth is required";
      }
      if (!t.country_of_residence?.trim()) {
        errors[`traveller_${i}_country_of_residence`] = "Country of residence is required";
      }
    }
  }

  if(stepId === 4) {
    if (!order.turnaround_time_id) {
      errors["turnaroundTimeId"] = "Turnaround time is required";
    }
  }

  // Step 4: turnaround always has a value
  // Step 5: no required fields for "next"

  return errors;
}


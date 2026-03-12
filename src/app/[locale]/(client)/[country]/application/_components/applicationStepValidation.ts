import type { ApplicationOrder } from "./ApplicationOrderContext";
import isVisaAvailable from "@/actions/visas";

export type StepId = 1 | 2 | 3 | 4 | 5;

export type ValidationTranslateFn = (key: string) => string;

/** Parse YYYY-MM-DD to local Date at midnight for date-only comparison */
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns field key -> error message. Empty object means step is valid. */
export async function validateStep(
  stepId: StepId,
  order: ApplicationOrder,
  t: ValidationTranslateFn
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  if (stepId === 1) {
    if (!order.arrival_date?.trim()) {
      errors.arrivalDate = t("arrivalDateRequired");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const arrivalDate = parseDateLocal(order.arrival_date);
      if (arrivalDate < today) {
        errors.arrivalDate = t("arrivalDatePast");
      }
    }
    if (!order.contact_email?.trim()) {
      errors.email = t("emailRequired");
    }
    if (
      order.contact_email?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.contact_email)
    ) {
      errors.email = t("emailInvalid");
    }
  }

  if (stepId === 2) {
    order.travellers.forEach((tr, i) => {
      if (!tr.first_name?.trim()) {
        errors[`traveller_${i}_first_name`] = t("firstNameRequired");
      }
      if (!tr.last_name?.trim()) {
        errors[`traveller_${i}_last_name`] = t("lastNameRequired");
      }
      if (!tr.date_of_birth?.trim()) {
        errors[`traveller_${i}_date_of_birth`] = t("dobRequired");
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dob = parseDateLocal(tr.date_of_birth);
        if (dob > today) {
          errors[`traveller_${i}_date_of_birth`] = t("dobFuture");
        }
      }
      if (tr.denied_visa_last_6_months === true) {
        errors[`traveller_${i}_denied_visa_last_6_months`] = t("deniedVisa");
      }
    });
  }

  if (stepId === 3) {
    for (let i = 0; i < order.travellers.length; i++) {
      const tr = order.travellers[i];
      if (!tr.nationality?.trim()) {
        errors[`traveller_${i}_nationality`] = t("nationalityRequired");
      } else {
        if (tr.nationality !== order.nationality) {
          const { status, error } = await isVisaAvailable(
            order.destination_country,
            tr.nationality,
            order.visa_type_id
          );
          if (!status && error) {
            errors[`traveller_${i}_nationality`] = error;
          }
        }
      }
      if (!tr.passport_number?.trim()) {
        errors[`traveller_${i}_passport_number`] = t("passportNumberRequired");
      }
      if (!tr.passport_expiry_date?.trim()) {
        errors[`traveller_${i}_passport_expiry_date`] = t("passportExpiryRequired");
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = parseDateLocal(tr.passport_expiry_date);
        if (expiryDate < today) {
          errors[`traveller_${i}_passport_expiry_date`] = t("passportExpiryPast");
        }
      }
      if (!tr.country_of_birth?.trim()) {
        errors[`traveller_${i}_country_of_birth`] = t("countryOfBirthRequired");
      }
      if (!tr.country_of_residence?.trim()) {
        errors[`traveller_${i}_country_of_residence`] = t("countryOfResidenceRequired");
      }
    }
  }

  if(stepId === 4) {
    if (!order.turnaround_time_id) {
      errors["turnaroundTimeId"] = t("turnaroundRequired");
    }
  }

  // Step 4: turnaround always has a value
  // Step 5: no required fields for "next"

  return errors;
}


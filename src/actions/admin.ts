"use server"

import {
  getApplications,
  getApplicationById,
  getCountries,
  getCountryById,
  getVisaRulesByDestination,
  getVisaRulesByNationality,
  getProductsBetweenCountries,
  getVisasByCountry,
  getAllVisas,
  getVisaById,
  getClients,
  getClientById,
  getApplicationsByClient,
  getAdmins,
  disableProduct,
  deleteProduct,
  updateProduct,
  disableVisa,
  deleteVisa,
  createVisa,
} from "@/lib/admin-mock-data"
import {
  createTurnaroundTime,
  getTurnaroundTimes,
  updateTurnaroundTime,
} from "@/actions/turnaround-times"

export async function fetchApplications() {
  return getApplications()
}

export async function fetchApplicationById(id: string) {
  return getApplicationById(id)
}

export async function fetchCountries(search?: string) {
  return getCountries(search)
}

export async function fetchCountryById(id: string) {
  return getCountryById(id)
}

export async function fetchVisaRulesByDestination(countryId: string) {
  return getVisaRulesByDestination(countryId)
}

export async function fetchVisaRulesByNationality(countryId: string) {
  return getVisaRulesByNationality(countryId)
}

export async function fetchProductsBetweenCountries(
  destinationCountryId: string,
  nationalityCountryId: string
) {
  return getProductsBetweenCountries(destinationCountryId, nationalityCountryId)
}

export async function fetchVisasByCountry(countryId: string) {
  return getVisasByCountry(countryId)
}

export async function fetchAllVisas() {
  return getAllVisas()
}

export async function fetchVisaById(id: number) {
  return getVisaById(id)
}

export async function fetchClients() {
  return getClients()
}

export async function fetchClientById(id: string) {
  return getClientById(id)
}

export async function fetchApplicationsByClient(profileId: string) {
  return getApplicationsByClient(profileId)
}

export async function fetchAdmins() {
  return getAdmins()
}

export async function fetchTurnaroundTimes() {
  return getTurnaroundTimes()
}

export async function disableProductAction(id: number) {
  await disableProduct(id)
}

export async function deleteProductAction(id: number) {
  await deleteProduct(id)
}

export async function updateProductAction(
  id: number,
  data: { price?: string }
) {
  await updateProduct(id, data)
}

export async function disableVisaAction(id: number) {
  await disableVisa(id)
}

export async function deleteVisaAction(id: number) {
  await deleteVisa(id)
}

export async function createVisaAction(
  countryId: string,
  data: Parameters<typeof createVisa>[1]
) {
  return createVisa(countryId, data)
}

export async function updateTurnaroundTimeAction(
  id: number,
  data: {
    name?: string
    fee?: number
    turnaround_time_hours?: number
    is_disabled?: boolean
  }
) {
  const result = await updateTurnaroundTime(id, data)
  if (!result.status) {
    throw new Error(result.error)
  }
}

export async function createTurnaroundTimeAction(data: {
  name: string
  index: number
  turnaround_time_hours: number
  fee: number
}) {
  const result = await createTurnaroundTime(data)
  if (!result.status) {
    throw new Error(result.error)
  }
}

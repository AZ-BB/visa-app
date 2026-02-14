import GeneralResponse from "@/types/general"

export interface VisaSearchResult {
  id: string
  fromCountry: string
  toCountry: string
  isVisaRequired: boolean
  isSupported: boolean
  visaTypes: VisaType[]
}
export interface VisaType {
  id: string
  name: string
  validFor: string
  numberOfEntries: string
  maxStay: string
}
export default function getVisaSearchResult(
  destinationCountry: string,
  passportCountry: string,
): GeneralResponse<VisaSearchResult> {
    console.log("destinationCountry", destinationCountry);
    console.log("passportCountry", passportCountry);
  if (destinationCountry === "AR") {
    if (passportCountry === "AT") {
      return {
        data: {
          id: "1",
          fromCountry: "AT",
          toCountry: "AR",
          isVisaRequired: true,
          isSupported: true,
          visaTypes: [
            {
              id: "1",
              name: "Tourist visa",
              validFor: "3 months",
              numberOfEntries: "1",
              maxStay: "30 days",
            },
            {
              id: "2",
              name: "Business visa",
              validFor: "6 months",
              numberOfEntries: "2",
              maxStay: "15 days",
            },
          ],
        },
      }
    } else if (passportCountry === "US") {
      return {
        data: {
          id: "1",
          fromCountry: "US",
          toCountry: "AR",
          isVisaRequired: true,
          isSupported: true,
          visaTypes: [
            {
              id: "1",
              name: "Tourist visa",
              validFor: "3 months",
              numberOfEntries: "1",
              maxStay: "30 days",
            },
          ],
        },
      }
    } else if(passportCountry === "EG") {
      return {
        data: {
          id: "1",
          fromCountry: "EG",
          toCountry: "AR",
          isVisaRequired: false,
          isSupported: true,
          visaTypes: [],
        },
      }
    }
  }

  return {
    data: {
      id: "1",
      fromCountry: "AR",
      toCountry: "AR",
      isVisaRequired: true,
      isSupported: false,
      visaTypes: [],
    },
  }
}

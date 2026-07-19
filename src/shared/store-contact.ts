export const storeContact = {
  email: "lszstoree@gmail.com",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "51 99695 7614",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5551996957614",
  location: "Cachoeirinha - RS",
} as const;

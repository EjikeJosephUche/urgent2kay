export interface MerchantRegistrationRequest {
  business: {
    businessName: string;
    businessRegNumber: string;
  };
  personal: {
    firstname: string;
    lastname: string;
    email: string;
  };
  bank: {
    accountName: string;
    accountNumber: string;
  };
}

export type ProductStatusValue = "active" | "inactive" | "beta" | "deprecated";

export type ProductStatus = {
  platform: string;
  product: string;
  status: ProductStatusValue;
  updatedAt: number;
  updatedBy?: string;
};

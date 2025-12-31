export type TokenSet = {
  provider: 'google';
  accountEmail: string;
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  scope: string;
};

export type OAuthToken = {
  id: number;
  provider: string;
  accountEmail: string;
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  scope: string;
  updatedAt: Date;
};

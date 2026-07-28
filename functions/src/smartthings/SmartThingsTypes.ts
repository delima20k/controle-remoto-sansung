export type SmartThingsDevice = {
  readonly deviceId: string;
  readonly name?: string;
  readonly label?: string;
  readonly deviceManufacturerCode?: string;
  readonly manufacturerName?: string;
  readonly deviceModel?: string;
  readonly presentationId?: string;
  readonly locationId?: string;
  readonly roomId?: string;
  readonly type?: string;
  readonly components?: SmartThingsComponent[];
};

export type SmartThingsComponent = {
  readonly id: string;
  readonly label?: string;
  readonly capabilities?: SmartThingsCapability[];
  readonly categories?: SmartThingsCategory[];
};

export type SmartThingsCapability = {
  readonly id: string;
  readonly version?: number;
};

export type SmartThingsCategory = {
  readonly name: string;
  readonly categoryType?: string;
};

export type SmartThingsCommand = {
  readonly component: string;
  readonly capability: string;
  readonly command: string;
  readonly arguments?: unknown[];
};

export type SmartThingsTokenResponse = {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly scope?: string;
  readonly token_type?: string;
};

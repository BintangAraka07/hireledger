export type AnchorDocumentHashArgs = {
  contractId: string;
  documentHash: string;
};

export type AnchorVerifyArgs = {
  documentHash: string;
};

export interface AnchorDocumentRecord {
  authority: string;
  contractId: string;
  documentHash: string;
  createdAt: string;
}

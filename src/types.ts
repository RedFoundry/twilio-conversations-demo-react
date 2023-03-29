import { Message, Participant } from "@twilio/conversations";

export type AddMessagesType = (channelSid: string, messages: Message[]) => void;
export type SetSidType = (sid: string) => void;

export type SetParticipantsType = (
  participants: Participant[],
  sid: string
) => void;

export type SetUnreadMessagesType = (
  channelSid: string,
  unreadCount: number
) => void;

export enum ActionName {
  Save = "Save",
  Create = "Create",
  Manage = "Manage",
}

export enum InputType {
  Text = "text",
  Password = "password",
}

export enum Content {
  AddChat = "Add chat participant",
  AddSMS = "Add SMS participant",
  AddWhatsApp = "Add WhatsApp participant",
}

export interface RelatedEntity {
  ID: number;
  Code: string;
  Name: null | string;
  Address: Address;
  PrimaryContact: PrimaryContact;
  EntityID: number;
}

export interface Address {
  ID: number;
  AddressLine1: string;
  AddressLine2: string | null;
  City: string;
  Province: string;
  PostalCode: string;
  CountryCode: string;
  CountyID: number | null;
  Latitude: number;
  Longitude: number;
}

export interface PrimaryContact {
  ID: number;
  Name: string;
  PhoneNumber: string;
  EMailAddress: string;
}

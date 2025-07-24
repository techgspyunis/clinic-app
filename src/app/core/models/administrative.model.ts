// src/app/core/models/administrative.model.ts

export interface AdministrativeRecord {
  administrative_id: string;
  invoicedetail_id: string | null;
  ident_protocol: string;
  lab_identification: string;
  surname: string;
  firstname: string;
  sex: string;
  date_of_birth: string; // Formato DDMMYYYY
  external_identifier: string;
  street_number: string;
  postal_code: string;
  city: string;
  prescribing_doctor: string;
  date_request: string; // Formato DDMMYYYY
  empty_field: string | null;
  protocol_type: string;
  cover: string;
  holder: string;
  cod_tit1: string;
  cod_tit2: string;
  file_name: string; // URL al archivo .lab
  status: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  zip_uploaded: string;
}

export interface AdministrativeResult {
  result_id: string;
  administrative_id: string;
  type: number;
  ident_protocol: string;
  analytical_code: string;
  analytical_name: string;
  reference_value: string;
  unit: string;
  code: string;
  result: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
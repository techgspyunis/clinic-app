// src/app/core/models/orderpreview.model.ts

export interface OrderPreview {
    order_id: string;
    date: string;
    description: string;
    created_at: string;
    updated_at: string | null;
    is_active: boolean;
    yearNumber: number;
    monthNumber: number;
    weekNumber: number;
}

export interface OrderDetailPreview {
    orderdetail_id: string;
    order_id: string;
    number: number;
    centre_medical: string;
    ref_patient: string;
    name_patient: string;
    ref_analyze: string;
    nomenclature_examen: string;
    code: string;
    created_at: string;
    updated_at: string | null;
    is_active: boolean;
}

// Payload para crear una nueva orden de previsualización
export interface OrderDetailPayload {
    medical_center: string;
    patient_name: string;
    nomenclature: string;
}

export interface NewOrderPreviewPayload {
    date: string;
    description: string;
    year: number;
    month: number;
    week: number;
    orderDetails: OrderDetailPayload[];
}

// Modelo para el formulario en el componente
export interface NewOrderPreviewForm {
    date: Date | string;
    description: string;
    year: number | null;
    month: number | null;
    week: number | null;
    orderDetails: OrderDetailPayload[];
}
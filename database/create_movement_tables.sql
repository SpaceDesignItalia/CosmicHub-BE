-- Script per creare le tabelle Movement e MovementType

-- Tabella per i tipi di movimento
CREATE TABLE IF NOT EXISTS public."MovementType" (
    movement_type_id BIGSERIAL PRIMARY KEY,
    movement_name TEXT NOT NULL UNIQUE
);

-- Inserimento dei tipi di movimento di base
INSERT INTO public."MovementType" (movement_type_id, movement_name) VALUES 
(1, 'Carico'),
(2, 'Scarico'),
(3, 'Trasferimento')
ON CONFLICT (movement_type_id) DO NOTHING;

-- Tabella per i movimenti
CREATE TABLE IF NOT EXISTS public."Movement" (
    movement_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    from_warehouse_id BIGINT NULL,
    from_vehicle_id BIGINT NULL,
    to_warehouse_id BIGINT NULL,
    to_vehicle_id BIGINT NULL,
    amount BIGINT NOT NULL,
    movement_type_id BIGINT NOT NULL,
    movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    from_supplier BIGINT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT NULL,
    updated_at TIMESTAMP NULL,
    notes TEXT NULL,
    reason TEXT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_movement_product 
        FOREIGN KEY (product_id) 
        REFERENCES public."Product"(product_id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_movement_type 
        FOREIGN KEY (movement_type_id) 
        REFERENCES public."MovementType"(movement_type_id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_movement_from_warehouse 
        FOREIGN KEY (from_warehouse_id) 
        REFERENCES public."Warehouse"("WarehouseID") 
        ON DELETE SET NULL,
        
    CONSTRAINT fk_movement_to_warehouse 
        FOREIGN KEY (to_warehouse_id) 
        REFERENCES public."Warehouse"("WarehouseID") 
        ON DELETE SET NULL,
        
    -- Check constraints per validare la logica di business
    CONSTRAINT chk_movement_amount_positive 
        CHECK (amount > 0),
        
    CONSTRAINT chk_movement_has_source_or_destination 
        CHECK (
            from_warehouse_id IS NOT NULL OR 
            from_vehicle_id IS NOT NULL OR 
            to_warehouse_id IS NOT NULL OR 
            to_vehicle_id IS NOT NULL OR 
            from_supplier IS NOT NULL
        )
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_movement_product_id ON public."Movement"(product_id);
CREATE INDEX IF NOT EXISTS idx_movement_type_id ON public."Movement"(movement_type_id);
CREATE INDEX IF NOT EXISTS idx_movement_date ON public."Movement"(movement_date);
CREATE INDEX IF NOT EXISTS idx_movement_from_warehouse ON public."Movement"(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movement_to_warehouse ON public."Movement"(to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movement_created_at ON public."Movement"(created_at);

-- Commenti per documentazione
COMMENT ON TABLE public."Movement" IS 'Tabella per tracciare tutti i movimenti di prodotti nel sistema';
COMMENT ON COLUMN public."Movement".movement_type_id IS '1=Carico, 2=Scarico, 3=Trasferimento';
COMMENT ON COLUMN public."Movement".amount IS 'Quantità movimentata (sempre positiva)';
COMMENT ON COLUMN public."Movement".from_supplier IS 'ID fornitore per movimenti di carico';
COMMENT ON COLUMN public."Movement".reason IS 'Motivo del movimento';
COMMENT ON COLUMN public."Movement".notes IS 'Note aggiuntive sul movimento'; 
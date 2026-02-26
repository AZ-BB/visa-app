ALTER TABLE public.travellers ADD COLUMN product_id INT NOT NULL;
ALTER TABLE public.travellers ADD CONSTRAINT fk_travellers_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.applications DROP COLUMN product_id;
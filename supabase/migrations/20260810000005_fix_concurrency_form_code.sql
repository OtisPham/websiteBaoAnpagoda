-- Sửa lỗi duplicate key khi nhiều người gửi sớ cùng lúc (Concurrency)
create or replace function public.generate_codes_before_insert()
returns trigger as $$
declare
  v_next_val integer;
begin
  if tg_table_name = 'forms' then
    if new.form_code is null then
      
      -- KHÓA BẢNG TẠM THỜI ĐỂ NGĂN XUNG ĐỘT KHI 2 NGƯỜI GỬI CÙNG LÚC
      LOCK TABLE public.forms IN EXCLUSIVE MODE;

      if new.form_type = 'CAU_AN' then
        WITH existing_numbers AS (
            SELECT CAST(SUBSTRING(form_code FROM '^CA(\d+)') AS INTEGER) as num
            FROM public.forms
            WHERE form_type = 'CAU_AN' AND form_code ~ '^CA\d+'
        )
        SELECT COALESCE(MIN(num + 1), 1) INTO v_next_val
        FROM existing_numbers e1
        WHERE NOT EXISTS (
            SELECT 1 FROM existing_numbers e2 WHERE e2.num = e1.num + 1
        );
        
        IF NOT EXISTS (SELECT 1 FROM existing_numbers WHERE num = 1) THEN
            v_next_val := 1;
        END IF;

        new.form_code := 'CA' || lpad(v_next_val::text, 4, '0');
      else
        WITH existing_numbers AS (
            SELECT CAST(SUBSTRING(form_code FROM '^CS(\d+)') AS INTEGER) as num
            FROM public.forms
            WHERE form_type = 'CAU_SIEU' AND form_code ~ '^CS\d+'
        )
        SELECT COALESCE(MIN(num + 1), 1) INTO v_next_val
        FROM existing_numbers e1
        WHERE NOT EXISTS (
            SELECT 1 FROM existing_numbers e2 WHERE e2.num = e1.num + 1
        );
        
        IF NOT EXISTS (SELECT 1 FROM existing_numbers WHERE num = 1) THEN
            v_next_val := 1;
        END IF;

        new.form_code := 'CS' || lpad(v_next_val::text, 4, '0');
      end if;
    end if;
  elsif tg_table_name = 'donations' then
    if new.receipt_no is null and new.payment_status = 'CONFIRMED' then
      new.receipt_no := 'BL-' || lpad(nextval('public.receipt_seq')::text, 6, '0');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

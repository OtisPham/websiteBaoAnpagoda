-- Cập nhật hàm generate_codes_before_insert để tái sử dụng form_code bị trống
create or replace function public.generate_codes_before_insert()
returns trigger as $$
declare
  v_next_val integer;
begin
  if tg_table_name = 'forms' then
    if new.form_code is null then
      if new.form_type = 'CAU_AN' then
        -- Tìm số nhỏ nhất bị thiếu (Gap detection)
        WITH existing_numbers AS (
            SELECT CAST(SUBSTRING(form_code FROM 3) AS INTEGER) as num
            FROM public.forms
            WHERE form_type = 'CAU_AN' AND form_code ~ '^CA\d+$'
        )
        SELECT COALESCE(MIN(num + 1), 1) INTO v_next_val
        FROM existing_numbers e1
        WHERE NOT EXISTS (
            SELECT 1 FROM existing_numbers e2 WHERE e2.num = e1.num + 1
        );
        
        -- Nếu số 1 bị thiếu
        IF NOT EXISTS (SELECT 1 FROM public.forms WHERE form_type = 'CAU_AN' AND form_code = 'CA0001') THEN
            v_next_val := 1;
        END IF;

        new.form_code := 'CA' || lpad(v_next_val::text, 4, '0');
      else
        -- Tìm số nhỏ nhất bị thiếu (Gap detection)
        WITH existing_numbers AS (
            SELECT CAST(SUBSTRING(form_code FROM 3) AS INTEGER) as num
            FROM public.forms
            WHERE form_type = 'CAU_SIEU' AND form_code ~ '^CS\d+$'
        )
        SELECT COALESCE(MIN(num + 1), 1) INTO v_next_val
        FROM existing_numbers e1
        WHERE NOT EXISTS (
            SELECT 1 FROM existing_numbers e2 WHERE e2.num = e1.num + 1
        );
        
        -- Nếu số 1 bị thiếu
        IF NOT EXISTS (SELECT 1 FROM public.forms WHERE form_type = 'CAU_SIEU' AND form_code = 'CS0001') THEN
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
